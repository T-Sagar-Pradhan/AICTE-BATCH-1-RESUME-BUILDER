from sqlalchemy import Column, String, DateTime, Text, Integer, JSON, ForeignKey, Float

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class ATSReport(Base):
    __tablename__ = "ats_reports"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(GUID, ForeignKey("resumes.id", ondelete="SET NULL"), nullable=True)

    # Uploaded file info
    file_url = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=True)
    extracted_text = Column(Text, nullable=True)

    # Scores
    overall_score = Column(Float, nullable=False, default=0)
    formatting_score = Column(Float, default=0)
    skills_score = Column(Float, default=0)
    keyword_score = Column(Float, default=0)
    readability_score = Column(Float, default=0)
    structure_score = Column(Float, default=0)

    # Analysis results
    detected_skills = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    weak_sections = Column(JSON, default=list)
    formatting_issues = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    sections_found = Column(JSON, default=list)
    contact_info = Column(JSON, default=dict)

    # Job match (optional)
    job_description_id = Column(GUID, ForeignKey("job_descriptions.id", ondelete="SET NULL"), nullable=True)
    match_score = Column(Float, nullable=True)
    missing_skills = Column(JSON, default=list)
    match_suggestions = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="ats_reports")
    resume = relationship("Resume", back_populates="ats_reports")
    job_description = relationship("JobDescription", back_populates="ats_reports")

    def __repr__(self):
        return f"<ATSReport score={self.overall_score}>"
