from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Integer, Float, Date

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    date = Column(Date, nullable=False, unique=True, index=True)
    total_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    resumes_created = Column(Integer, default=0)
    ats_analyses = Column(Integer, default=0)
    cover_letters = Column(Integer, default=0)
    portfolios_generated = Column(Integer, default=0)
    interview_sessions = Column(Integer, default=0)
    ai_requests = Column(Integer, default=0)
    revenue = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<Analytics {self.date}>"


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    extra_data = Column(JSON, default=dict)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="activity_logs")

    def __repr__(self):
        return f"<ActivityLog {self.action} by {self.user_id}>"
