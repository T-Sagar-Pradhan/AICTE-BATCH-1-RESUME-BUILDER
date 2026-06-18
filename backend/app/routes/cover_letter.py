from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.cover_letter import CoverLetter
from app.models.resume import Resume
from app.schemas.cover_letter import CoverLetterCreate, CoverLetterResponse
from app.auth.jwt import get_current_user
from app.ai.gemini import generate_cover_letter
from app.services.pdf_service import generate_resume_pdf
import structlog
import io

logger = structlog.get_logger()
router = APIRouter(prefix="/api/cover-letters", tags=["Cover Letters"])


@router.post("/generate", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def generate_cover_letter_route(
    data: CoverLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an AI-powered cover letter."""
    resume_data = {}

    if data.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == data.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume:
            resume_data = {
                "name": (resume.personal_details or {}).get("name", current_user.fullname),
                "summary": resume.summary,
                "skills": resume.skills,
                "experience": resume.experience,
                "projects": resume.projects,
                "education": resume.education
            }

    if not resume_data:
        resume_data = {"name": current_user.fullname}

    try:
        content = await generate_cover_letter(
            resume_data=resume_data,
            job_description=data.job_description,
            company_name=data.company_name,
            job_title=data.job_title,
            tone=data.tone
        )

        cover_letter = CoverLetter(
            user_id=current_user.id,
            resume_id=data.resume_id,
            title=f"Cover Letter - {data.company_name}",
            company_name=data.company_name,
            job_title=data.job_title,
            tone=data.tone,
            content=content,
            job_description=data.job_description
        )
        db.add(cover_letter)
        db.commit()
        db.refresh(cover_letter)

        logger.info("Cover letter generated", user_id=str(current_user.id))
        return cover_letter

    except Exception as e:
        logger.error("Cover letter generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/", response_model=List[CoverLetterResponse])
async def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    letters = db.query(CoverLetter).filter(
        CoverLetter.user_id == current_user.id
    ).order_by(CoverLetter.created_at.desc()).all()
    return letters


@router.get("/{letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return letter


@router.get("/{letter_id}/download")
async def download_cover_letter(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download cover letter as PDF."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.enums import TA_JUSTIFY
    from reportlab.lib import colors

    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)

    styles = getSampleStyleSheet()
    body_style = ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=11, leading=18, spaceAfter=12, alignment=TA_JUSTIFY
    )

    story = []
    for para in letter.content.split('\n\n'):
        if para.strip():
            story.append(Paragraph(para.replace('\n', '<br/>'), body_style))

    doc.build(story)
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="cover-letter-{letter.company_name}.pdf"'}
    )


@router.delete("/{letter_id}")
async def delete_cover_letter(
    letter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    letter = db.query(CoverLetter).filter(
        CoverLetter.id == letter_id,
        CoverLetter.user_id == current_user.id
    ).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    db.delete(letter)
    db.commit()
    return {"message": "Cover letter deleted"}
