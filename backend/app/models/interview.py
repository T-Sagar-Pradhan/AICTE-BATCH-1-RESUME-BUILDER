from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Integer

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, default="Interview Prep Session")
    target_role = Column(String(255), nullable=False)
    difficulty = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    question_types = Column(JSON, default=list)  # technical, hr, project
    resume_context = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<InterviewSession {self.title}>"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    session_id = Column(GUID, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    suggested_answer = Column(Text, nullable=True)
    question_type = Column(String(50), nullable=False)  # technical, hr, project, behavioral
    difficulty = Column(String(50), default="intermediate")
    topic = Column(String(255), nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")

    def __repr__(self):
        return f"<InterviewQuestion {self.question[:50]}>"
