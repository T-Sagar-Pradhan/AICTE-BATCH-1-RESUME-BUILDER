from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ChatMessageCreate(BaseModel):
    content: str
    chat_id: Optional[UUID] = None
    context_type: Optional[str] = "general"


class ChatMessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatHistoryResponse(BaseModel):
    id: UUID
    title: str
    context_type: str
    messages: List[ChatMessageResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    chat_id: UUID
    message: ChatMessageResponse
    reply: ChatMessageResponse
