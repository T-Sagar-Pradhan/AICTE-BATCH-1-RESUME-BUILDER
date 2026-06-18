from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    plan = Column(String(50), nullable=False, default="free")  # free, pro, premium
    status = Column(String(50), default="active")  # active, expired, cancelled
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    payment_id = Column(String(255), nullable=True)
    amount_paid = Column(String(20), nullable=True)
    currency = Column(String(10), default="INR")

    # Usage tracking
    ats_analyses_used = Column(String(10), default="0")
    cover_letters_used = Column(String(10), default="0")
    ai_credits_used = Column(String(10), default="0")

    # Plan limits
    ats_analyses_limit = Column(String(10), default="3")
    cover_letters_limit = Column(String(10), default="3")
    ai_credits_limit = Column(String(10), default="10")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subscription")

    def __repr__(self):
        return f"<Subscription {self.plan} for user {self.user_id}>"
