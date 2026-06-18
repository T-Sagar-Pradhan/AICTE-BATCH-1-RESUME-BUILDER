from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as SAEnum

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base
from app.models.base import GUID


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    fullname = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)  # Nullable for OAuth users
    profile_photo = Column(Text, nullable=True)
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    google_id = Column(String(255), nullable=True, unique=True)
    github_id = Column(String(255), nullable=True, unique=True)
    linkedin_url = Column(Text, nullable=True)
    github_url = Column(Text, nullable=True)
    target_role = Column(String(255), nullable=True)
    ai_credits = Column(String(10), default="10")
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    ats_reports = relationship("ATSReport", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"
