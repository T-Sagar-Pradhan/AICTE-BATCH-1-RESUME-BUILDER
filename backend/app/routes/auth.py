from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
import httpx

from app.database import get_db
from app.models.user import User, UserRole
from app.models.subscription import Subscription
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, TokenResponse,
    PasswordResetRequest, PasswordReset, PasswordChange, RefreshTokenRequest
)
from app.auth.jwt import create_access_token, create_refresh_token, verify_token
from app.auth.password import hash_password, verify_password
from app.config import settings
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def create_user_tokens(user: User) -> dict:
    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }


def create_free_subscription(db: Session, user_id):
    subscription = Subscription(
        user_id=user_id,
        plan="free",
        status="active",
        ats_analyses_limit="3",
        cover_letters_limit="3",
        ai_credits_limit="10"
    )
    db.add(subscription)
    db.commit()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check existing user
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    user = User(
        fullname=user_data.fullname,
        email=user_data.email,
        password=hash_password(user_data.password),
        is_verified=False,
        role=UserRole.user
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create free subscription
    create_free_subscription(db, user.id)

    # Send welcome email (non-blocking)
    try:
        from app.utils.email import send_welcome_email
        send_welcome_email(user.email, user.fullname)
    except Exception:
        pass  # Email failure should never block registration

    logger.info("New user registered", user_id=str(user.id), email=user.email)
    return create_user_tokens(user)


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not user.password or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated"
        )

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    logger.info("User logged in", user_id=str(user.id))
    return create_user_tokens(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = verify_token(request.refresh_token, token_type="refresh")
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )

    return create_user_tokens(user)


@router.get("/google")
async def google_auth():
    """Redirect URL for Google OAuth."""
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/auth"
        f"?client_id={settings.GOOGLE_CLIENT_ID}"
        "&redirect_uri={settings.GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid email profile"
        "&access_type=offline"
    )
    return {"url": google_auth_url}


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                    "grant_type": "authorization_code"
                }
            )
            token_data = token_response.json()

            # Get user info
            user_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {token_data['access_token']}"}
            )
            google_user = user_response.json()

        # Find or create user
        user = db.query(User).filter(User.google_id == google_user["sub"]).first()
        if not user:
            user = db.query(User).filter(User.email == google_user["email"]).first()

        if not user:
            user = User(
                fullname=google_user.get("name", ""),
                email=google_user["email"],
                google_id=google_user["sub"],
                profile_photo=google_user.get("picture"),
                is_verified=True,
                role=UserRole.user
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            create_free_subscription(db, user.id)
        elif not user.google_id:
            user.google_id = google_user["sub"]
            user.is_verified = True
            if not user.profile_photo:
                user.profile_photo = google_user.get("picture")
            db.commit()

        tokens = create_user_tokens(user)
        # Redirect to frontend with tokens
        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"]
        }
    except Exception as e:
        logger.error("Google OAuth failed", error=str(e))
        raise HTTPException(status_code=400, detail="Google authentication failed")


@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    # Always return success to prevent email enumeration
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.commit()

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        try:
            from app.utils.email import send_password_reset_email
            send_password_reset_email(user.email, reset_url, user.fullname)
        except Exception:
            pass
        logger.info("Password reset requested", email=request.email)

    return {"message": "If that email is registered, you'll receive a reset link shortly"}


@router.post("/reset-password")
async def reset_password(data: PasswordReset, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()

    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    if user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.password = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    logger.info("Password reset successful", user_id=str(user.id))
    return {"message": "Password reset successfully"}
