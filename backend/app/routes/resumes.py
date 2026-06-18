from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse, AIResumeGenerateRequest
from app.auth.jwt import get_current_user
from app.ai.gemini import generate_resume_content
from app.services.pdf_service import generate_resume_pdf
from app.services import cloudinary_service
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/resumes", tags=["Resumes"])


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes


@router.post("/", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = Resume(
        user_id=current_user.id,
        **data.dict()
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Create initial version
    _save_version(db, resume, "Initial version")

    logger.info("Resume created", resume_id=str(resume.id), user_id=str(current_user.id))
    return resume


@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = _get_user_resume(db, resume_id, current_user.id)
    return resume


@router.put("/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = _get_user_resume(db, resume_id, current_user.id)

    for field, value in data.dict(exclude_none=True).items():
        setattr(resume, field, value)

    db.commit()
    db.refresh(resume)

    # Save version
    _save_version(db, resume, "Updated")

    return resume


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = _get_user_resume(db, resume_id, current_user.id)

    if resume.cloudinary_public_id:
        await cloudinary_service.delete_file(resume.cloudinary_public_id, "raw")

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted"}


@router.post("/ai/generate", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def generate_ai_resume(
    data: AIResumeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an AI-powered resume using Gemini."""
    try:
        ai_content = await generate_resume_content(
            skills=data.skills,
            education=data.education,
            projects=data.projects,
            experience=data.experience,
            target_job=data.target_job,
            additional_context=data.additional_context or ""
        )

        resume = Resume(
            user_id=current_user.id,
            title=f"AI Resume - {data.target_job}",
            template="modern",
            skills=ai_content.get("enhanced_skills", data.skills),
            education=data.education,
            projects=ai_content.get("enhanced_projects", data.projects),
            experience=ai_content.get("enhanced_experience", data.experience),
            summary=ai_content.get("professional_summary"),
            achievements=[{"title": a} for a in ai_content.get("achievement_statements", [])],
            ai_generated=True,
            ai_summary=ai_content.get("professional_summary")
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        _save_version(db, resume, "AI Generated")
        logger.info("AI resume generated", resume_id=str(resume.id))
        return resume

    except Exception as e:
        logger.error("AI resume generation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


@router.get("/{resume_id}/download")
async def download_resume_pdf(
    resume_id: str,
    template: str = "modern",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and download resume as PDF."""
    resume = _get_user_resume(db, resume_id, current_user.id)

    resume_dict = {
        "personal_details": resume.personal_details,
        "summary": resume.summary or resume.ai_summary,
        "education": resume.education,
        "experience": resume.experience,
        "skills": resume.skills,
        "projects": resume.projects,
        "certifications": resume.certifications,
        "achievements": resume.achievements,
        "languages": resume.languages
    }

    pdf_bytes = generate_resume_pdf(resume_dict, template or resume.template)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{resume.title}.pdf"'
        }
    )


@router.post("/{resume_id}/set-primary")
async def set_primary_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Unset all primary
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": False})

    resume = _get_user_resume(db, resume_id, current_user.id)
    resume.is_primary = True
    db.commit()
    return {"message": "Primary resume set"}


@router.get("/{resume_id}/versions")
async def get_resume_versions(
    resume_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = _get_user_resume(db, resume_id, current_user.id)
    versions = db.query(ResumeVersion).filter(
        ResumeVersion.resume_id == resume.id
    ).order_by(ResumeVersion.version_number.desc()).all()

    return [
        {
            "id": str(v.id),
            "version_number": v.version_number,
            "change_summary": v.change_summary,
            "created_at": v.created_at
        }
        for v in versions
    ]


@router.post("/{resume_id}/ai/rewrite", response_model=ResumeResponse)
async def rewrite_resume_ai(
    resume_id: str,
    target_role: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Rewrite existing resume using AI."""
    from app.ai.gemini import rewrite_resume

    resume = _get_user_resume(db, resume_id, current_user.id)

    resume_dict = {
        "summary": resume.summary,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "education": resume.education
    }

    try:
        improved = await rewrite_resume(resume_dict, target_role)

        if "professional_summary" in improved:
            resume.summary = improved["professional_summary"]
        if "skills" in improved:
            resume.skills = improved["skills"]
        if "experience" in improved:
            resume.experience = improved["experience"]
        if "projects" in improved:
            resume.projects = improved["projects"]

        resume.ai_generated = True
        db.commit()
        db.refresh(resume)

        _save_version(db, resume, f"AI Rewritten for {target_role}")
        return resume
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI rewrite failed: {str(e)}")


def _get_user_resume(db: Session, resume_id: str, user_id) -> Resume:
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == user_id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


def _save_version(db: Session, resume: Resume, change_summary: str):
    """Save a snapshot of the resume as a version."""
    last_version = db.query(ResumeVersion).filter(
        ResumeVersion.resume_id == resume.id
    ).order_by(ResumeVersion.version_number.desc()).first()

    version_num = (last_version.version_number + 1) if last_version else 1

    snapshot = {
        "title": resume.title,
        "template": resume.template,
        "personal_details": resume.personal_details,
        "summary": resume.summary,
        "education": resume.education,
        "experience": resume.experience,
        "skills": resume.skills,
        "projects": resume.projects,
        "certifications": resume.certifications,
        "achievements": resume.achievements,
        "languages": resume.languages
    }

    version = ResumeVersion(
        resume_id=resume.id,
        version_number=version_num,
        snapshot=snapshot,
        change_summary=change_summary
    )
    db.add(version)
    db.commit()
