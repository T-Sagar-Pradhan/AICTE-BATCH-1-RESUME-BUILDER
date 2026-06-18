from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, JSON, ForeignKey, Float

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, default="My Resume")
    template = Column(String(100), default="modern")
    is_primary = Column(Boolean, default=False)
    ats_score = Column(Float, nullable=True)
    cloudinary_url = Column(Text, nullable=True)
    cloudinary_public_id = Column(String(255), nullable=True)

    # Resume content stored as JSON
    personal_details = Column(JSON, nullable=True)
    education = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    languages = Column(JSON, default=list)
    summary = Column(Text, nullable=True)

    # AI Generated content
    ai_generated = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")
    ats_reports = relationship("ATSReport", back_populates="resume", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="resume")

    def __repr__(self):
        return f"<Resume {self.title}>"


class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    resume_id = Column(GUID, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot = Column(JSON, nullable=False)  # Complete resume snapshot
    change_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    resume = relationship("Resume", back_populates="versions")

    def __repr__(self):
        return f"<ResumeVersion {self.resume_id} v{self.version_number}>"
