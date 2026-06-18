from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.ats import ATSReport
from app.models.job_description import JobDescription
from app.schemas.ats import ATSAnalysisResponse, JobMatchRequest, JobMatchResponse
from app.auth.jwt import get_current_user
from app.services.ats_service import extract_text_from_pdf, analyze_ats, calculate_job_match
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/ats", tags=["ATS Analysis"])


@router.post("/analyze", response_model=ATSAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_resume(
    file: UploadFile = File(...),
    resume_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload and analyze a resume PDF for ATS compatibility."""
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if file.size and file.size > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File size must be under 10MB")

    content = await file.read()
    extracted_text = extract_text_from_pdf(content)

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF. Ensure it's not a scanned image.")

    analysis = analyze_ats(extracted_text)

    report = ATSReport(
        user_id=current_user.id,
        resume_id=resume_id,
        file_name=file.filename,
        extracted_text=extracted_text[:5000],  # Store first 5k chars
        **analysis
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    logger.info("ATS analysis completed", user_id=str(current_user.id), score=analysis["overall_score"])
    return report


@router.post("/match", response_model=JobMatchResponse)
async def match_resume_to_job(
    data: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Match a resume against a job description."""
    resume_text = data.resume_text

    # If resume_id provided, use that resume's content
    if data.resume_id and not resume_text:
        from app.models.resume import Resume
        resume = db.query(Resume).filter(
            Resume.id == data.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        # Build text representation from resume data
        parts = []
        if resume.summary:
            parts.append(resume.summary)
        if resume.skills:
            skills = resume.skills
            if isinstance(skills[0], dict):
                for sg in skills:
                    parts.extend(sg.get("skills", []))
            else:
                parts.extend(str(s) for s in skills)
        if resume.experience:
            for exp in resume.experience:
                parts.append(f"{exp.get('position', '')} {exp.get('company', '')}")
                parts.extend(exp.get("description", []))
        if resume.projects:
            for proj in resume.projects:
                parts.append(proj.get("description", ""))
                parts.extend(proj.get("technologies", []))

        resume_text = " ".join(parts)

    if not resume_text:
        raise HTTPException(status_code=400, detail="Resume text or resume_id required")

    match_result = calculate_job_match(resume_text, data.job_description)

    # Save job description
    jd = JobDescription(
        user_id=current_user.id,
        title=data.job_title or "Untitled Position",
        company=data.company or "",
        description=data.job_description,
        required_skills=match_result["missing_skills"][:5]
    )
    db.add(jd)
    db.commit()

    match_result["job_description_id"] = jd.id
    return match_result


@router.get("/reports", response_model=List[ATSAnalysisResponse])
async def get_ats_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(ATSReport).filter(
        ATSReport.user_id == current_user.id
    ).order_by(ATSReport.created_at.desc()).limit(20).all()
    return reports


@router.get("/reports/{report_id}", response_model=ATSAnalysisResponse)
async def get_ats_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    report = db.query(ATSReport).filter(
        ATSReport.id == report_id,
        ATSReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
