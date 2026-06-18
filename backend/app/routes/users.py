from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange
from app.auth.jwt import get_current_user, get_admin_user
from app.auth.password import verify_password, hash_password
from app.services import cloudinary_service
import structlog
import uuid

logger = structlog.get_logger()
router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, value in data.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    if file.size and file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    content = await file.read()
    result = await cloudinary_service.upload_image(
        content,
        public_id=f"avatar_{current_user.id}",
        folder="avatars"
    )

    current_user.profile_photo = result["url"]
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
async def change_password(
    data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.password:
        raise HTTPException(status_code=400, detail="Cannot change password for OAuth accounts")

    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


# Admin endpoints
@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/stats")
async def user_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy import func
    from datetime import datetime, timedelta

    total = db.query(func.count(User.id)).scalar()
    active = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    today = datetime.utcnow().date()
    new_today = db.query(func.count(User.id)).filter(
        func.date(User.created_at) == today
    ).scalar()

    return {
        "total_users": total,
        "active_users": active,
        "new_today": new_today
    }


@router.delete("/{user_id}")
async def deactivate_user(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User deactivated"}
