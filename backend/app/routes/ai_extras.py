from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.auth.jwt import get_current_user
from app.ai.gemini import analyze_skill_gaps, rewrite_resume, generate_resume_content, chat_completion, extract_json
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/ai", tags=["AI Extras"])


class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_role: str
    experience_level: str = "entry"  # entry, mid, senior


class RewriteRequest(BaseModel):
    resume_id: UUID
    target_role: str


class CareerRoadmapRequest(BaseModel):
    current_role: Optional[str] = None
    target_role: str
    skills: List[str]
    experience_years: int = 0


@router.post("/skill-gap")
async def skill_gap_analysis(
    data: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze skill gaps between current skills and target role requirements."""
    try:
        result = await analyze_skill_gaps(
            current_skills=data.current_skills,
            target_role=data.target_role,
            experience_level=data.experience_level
        )
        return result
    except Exception as e:
        logger.error("Skill gap analysis failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/rewrite-resume")
async def rewrite_resume_route(
    data: RewriteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """AI-rewrite an existing resume for a target role."""
    resume = db.query(Resume).filter(
        Resume.id == data.resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    resume_dict = {
        "summary": resume.summary,
        "skills": resume.skills,
        "experience": resume.experience,
        "projects": resume.projects,
        "education": resume.education,
        "achievements": resume.achievements
    }

    try:
        improved = await rewrite_resume(resume_dict, data.target_role)

        # Apply improvements
        if improved.get("professional_summary"):
            resume.summary = improved["professional_summary"]
        if improved.get("skills"):
            resume.skills = improved["skills"]
        if improved.get("experience"):
            resume.experience = improved["experience"]
        if improved.get("projects"):
            resume.projects = improved["projects"]
        resume.ai_generated = True

        db.commit()
        db.refresh(resume)

        return {
            "message": f"Resume rewritten for {data.target_role}",
            "resume_id": str(resume.id),
            "improvements": improved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rewrite failed: {str(e)}")


@router.post("/career-roadmap")
async def generate_career_roadmap(
    data: CareerRoadmapRequest,
    current_user: User = Depends(get_current_user)
):
    """Generate a personalized career roadmap using AI."""
    import json

    prompt = f"""Create a detailed career roadmap for:
Current Role: {data.current_role or 'Student/Fresher'}
Target Role: {data.target_role}
Current Skills: {', '.join(data.skills) if data.skills else 'None'}
Experience: {data.experience_years} years

Return JSON:
{{"roadmap": [{{"phase": "Phase 1 (0-3 months)", "title": "Foundation", "goals": [], "skills_to_learn": [], "resources": [], "milestones": []}}], "total_duration": "6-12 months", "key_skills_needed": [], "salary_range": "estimate", "quick_wins": []}}"""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return extract_json(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")


@router.post("/improve-resume-section")
async def improve_section(
    section: str,
    content: str,
    target_role: str,
    current_user: User = Depends(get_current_user)
):
    """Improve a specific resume section with AI."""
    prompt = f"""Improve this resume {section} section for a {target_role} role. Make it ATS-friendly with action verbs and metrics.

Original:
{content}

Return only the improved content."""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        return {"improved": result.strip(), "section": section}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Improvement failed: {str(e)}")


@router.get("/job-recommendations")
async def job_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized job recommendations."""
    primary_resume = db.query(Resume).filter(
        Resume.user_id == current_user.id,
        Resume.is_primary == True
    ).first()

    skills = []
    if primary_resume and primary_resume.skills:
        s = primary_resume.skills
        skills = [x if isinstance(x, str) else x.get("name", "") for x in s[:10]]

    target_role = current_user.target_role or "Software Engineer"

    prompt = f"""Suggest 6 job recommendations for:
Skills: {', '.join(skills) if skills else 'General'}
Target Role: {target_role}

Return JSON array:
[{{"title": "Job Title", "company_type": "Startup/MNC/Remote", "match_percentage": 85, "required_skills": ["skill1"], "salary_range": "estimate", "why_good_fit": "reason"}}]"""

    try:
        result = chat_completion([{"role": "user", "content": prompt}])
        jobs = extract_json(result)
        return {"recommendations": jobs, "based_on_skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")
