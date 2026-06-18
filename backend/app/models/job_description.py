from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    experience_level = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    ats_reports = relationship("ATSReport", back_populates="job_description")

    def __repr__(self):
        return f"<JobDescription {self.title}>"
