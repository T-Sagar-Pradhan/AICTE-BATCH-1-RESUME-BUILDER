from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    fullname: str = Field(..., min_length=2, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)

    @validator("password")
    def password_strength(cls, v):
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    fullname: Optional[str] = Field(None, min_length=2, max_length=255)
    profile_photo: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    target_role: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    fullname: str
    email: str
    profile_photo: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    target_role: Optional[str] = None
    ai_credits: str
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
