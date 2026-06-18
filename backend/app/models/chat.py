from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Boolean

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class ChatHistory(Base):
    __tablename__ = "chat_histories"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="New Chat")
    context_type = Column(String(50), default="general")  # general, resume, career, interview
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="chat_histories")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def __repr__(self):
        return f"<ChatHistory {self.title}>"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    chat_id = Column(GUID, ForeignKey("chat_histories.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    tokens_used = Column(String(10), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    chat = relationship("ChatHistory", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage {self.role}: {self.content[:50]}>"
