from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.chat import ChatHistory, ChatMessage
from app.schemas.chat import ChatMessageCreate, ChatHistoryResponse, ChatResponse, ChatMessageResponse
from app.auth.jwt import get_current_user
from app.ai.gemini import chat_with_advisor
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/chat", tags=["AI Career Advisor"])


@router.post("/message", response_model=ChatResponse)
async def send_message(
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message to the AI career advisor."""
    # Get or create chat session
    if data.chat_id:
        chat = db.query(ChatHistory).filter(
            ChatHistory.id == data.chat_id,
            ChatHistory.user_id == current_user.id
        ).first()
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
    else:
        chat = ChatHistory(
            user_id=current_user.id,
            title=data.content[:50] + "..." if len(data.content) > 50 else data.content,
            context_type=data.context_type or "general"
        )
        db.add(chat)
        db.flush()

    # Save user message
    user_msg = ChatMessage(
        chat_id=chat.id,
        role="user",
        content=data.content
    )
    db.add(user_msg)
    db.flush()

    # Get chat history for context
    history = db.query(ChatMessage).filter(
        ChatMessage.chat_id == chat.id
    ).order_by(ChatMessage.created_at.asc()).all()

    history_list = [{"role": m.role, "content": m.content} for m in history[:-1]]  # Exclude current msg

    # User context
    user_context = f"Name: {current_user.fullname}"
    if current_user.target_role:
        user_context += f", Target Role: {current_user.target_role}"

    try:
        ai_response = await chat_with_advisor(
            message=data.content,
            context_type=chat.context_type,
            chat_history=history_list,
            user_context=user_context
        )

        # Save AI response
        ai_msg = ChatMessage(
            chat_id=chat.id,
            role="assistant",
            content=ai_response
        )
        db.add(ai_msg)
        db.commit()
        db.refresh(user_msg)
        db.refresh(ai_msg)

        return ChatResponse(
            chat_id=chat.id,
            message=user_msg,
            reply=ai_msg
        )

    except Exception as e:
        db.rollback()
        logger.error("AI chat failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"AI response failed: {str(e)}")


@router.get("/histories", response_model=List[ChatHistoryResponse])
async def list_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.updated_at.desc()).limit(20).all()
    return chats


@router.get("/histories/{chat_id}", response_model=ChatHistoryResponse)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(ChatHistory).filter(
        ChatHistory.id == chat_id,
        ChatHistory.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.delete("/histories/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = db.query(ChatHistory).filter(
        ChatHistory.id == chat_id,
        ChatHistory.user_id == current_user.id
    ).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted"}
