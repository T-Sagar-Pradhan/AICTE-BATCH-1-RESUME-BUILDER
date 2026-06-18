from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.interview import InterviewSession, InterviewQuestion
from app.models.resume import Resume
from app.schemas.interview import (
    InterviewGenerateRequest, InterviewSessionResponse, InterviewQuestionResponse
)
from app.auth.jwt import get_current_user
from app.ai.gemini import generate_interview_questions
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/interview", tags=["Interview Prep"])


@router.post("/generate", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def generate_questions(
    data: InterviewGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate interview questions based on target role and resume."""
    resume_context = data.additional_context or ""

    if data.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == data.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume:
            context_parts = []
            if resume.summary:
                context_parts.append(f"Summary: {resume.summary}")
            if resume.skills:
                skills = resume.skills
                skill_names = [s if isinstance(s, str) else s.get("name", str(s)) for s in skills[:15]]
                context_parts.append(f"Skills: {', '.join(skill_names)}")
            if resume.projects:
                proj_names = [p.get("name", "") for p in resume.projects[:3]]
                context_parts.append(f"Key Projects: {', '.join(proj_names)}")
            resume_context = "\n".join(context_parts)

    try:
        questions_data = await generate_interview_questions(
            target_role=data.target_role,
            difficulty=data.difficulty,
            question_types=data.question_types,
            resume_context=resume_context,
            num_questions=data.num_questions
        )

        # Create session
        session = InterviewSession(
            user_id=current_user.id,
            title=f"Interview Prep - {data.target_role}",
            target_role=data.target_role,
            difficulty=data.difficulty,
            question_types=data.question_types,
            resume_context=resume_context[:1000] if resume_context else None
        )
        db.add(session)
        db.flush()

        # Create questions
        for idx, q_data in enumerate(questions_data):
            question = InterviewQuestion(
                session_id=session.id,
                question=q_data.get("question", ""),
                suggested_answer=q_data.get("suggested_answer", ""),
                question_type=q_data.get("question_type", "technical"),
                difficulty=q_data.get("difficulty", data.difficulty),
                topic=q_data.get("topic", ""),
                order_index=idx
            )
            db.add(question)

        db.commit()
        db.refresh(session)

        logger.info("Interview questions generated", session_id=str(session.id))
        return session

    except Exception as e:
        logger.error("Interview generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/sessions", response_model=List[InterviewSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).all()
    return sessions


@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}
