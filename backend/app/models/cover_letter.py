from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(GUID, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    title = Column(String(255), nullable=False, default="Cover Letter")
    company_name = Column(String(255), nullable=True)
    job_title = Column(String(255), nullable=True)
    tone = Column(String(50), default="professional")  # formal, professional, friendly
    content = Column(Text, nullable=False)
    job_description = Column(Text, nullable=True)

    # Export files
    pdf_url = Column(Text, nullable=True)
    docx_url = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cover_letters")
    resume = relationship("Resume", back_populates="cover_letters")

    def __repr__(self):
        return f"<CoverLetter {self.title}>"
