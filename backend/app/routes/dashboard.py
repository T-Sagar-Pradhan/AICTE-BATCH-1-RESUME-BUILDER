from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.models.ats import ATSReport
from app.models.cover_letter import CoverLetter
from app.models.portfolio import Portfolio
from app.models.interview import InterviewSession
from app.models.subscription import Subscription
from app.auth.jwt import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive dashboard statistics for the current user."""
    user_id = current_user.id

    # Resume stats
    total_resumes = db.query(func.count(Resume.id)).filter(Resume.user_id == user_id).scalar()
    primary_resume = db.query(Resume).filter(Resume.user_id == user_id, Resume.is_primary == True).first()

    # ATS stats
    ats_reports = db.query(ATSReport).filter(ATSReport.user_id == user_id).order_by(
        ATSReport.created_at.desc()
    ).limit(5).all()
    latest_ats_score = ats_reports[0].overall_score if ats_reports else None
    avg_ats_score = db.query(func.avg(ATSReport.overall_score)).filter(
        ATSReport.user_id == user_id
    ).scalar()

    # Cover letter stats
    cover_letters_count = db.query(func.count(CoverLetter.id)).filter(
        CoverLetter.user_id == user_id
    ).scalar()

    # Portfolio stats
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

    # Interview stats
    interview_sessions = db.query(func.count(InterviewSession.id)).filter(
        InterviewSession.user_id == user_id
    ).scalar()

    # Subscription
    subscription = db.query(Subscription).filter(Subscription.user_id == user_id).first()

    # ATS score history (last 7 reports)
    ats_history = db.query(ATSReport).filter(
        ATSReport.user_id == user_id
    ).order_by(ATSReport.created_at.asc()).limit(7).all()

    ats_chart_data = [
        {
            "date": r.created_at.strftime("%b %d"),
            "score": r.overall_score,
            "formatting": r.formatting_score,
            "keywords": r.keyword_score,
            "skills": r.skills_score
        }
        for r in ats_history
    ]

    # Recent activity
    recent_resumes = db.query(Resume).filter(
        Resume.user_id == user_id
    ).order_by(Resume.created_at.desc()).limit(3).all()

    recent_activity = []
    for r in recent_resumes:
        recent_activity.append({
            "type": "resume",
            "title": r.title,
            "action": "Resume created/updated",
            "date": r.updated_at.isoformat()
        })

    for ats in ats_reports[:2]:
        recent_activity.append({
            "type": "ats",
            "title": ats.file_name or "ATS Analysis",
            "action": f"ATS Score: {ats.overall_score}",
            "date": ats.created_at.isoformat()
        })

    # Recommendations based on data
    recommendations = []
    if not latest_ats_score or latest_ats_score < 70:
        recommendations.append({
            "type": "ats",
            "title": "Improve ATS Score",
            "description": "Your resume needs optimization for ATS systems",
            "priority": "high"
        })
    if not portfolio:
        recommendations.append({
            "type": "portfolio",
            "title": "Create Portfolio",
            "description": "A portfolio website increases visibility by 40%",
            "priority": "medium"
        })
    if cover_letters_count == 0:
        recommendations.append({
            "type": "cover_letter",
            "title": "Generate Cover Letter",
            "description": "Personalized cover letters improve response rates",
            "priority": "medium"
        })
    if interview_sessions == 0:
        recommendations.append({
            "type": "interview",
            "title": "Practice Interviews",
            "description": "Prepare for technical and HR interviews",
            "priority": "low"
        })

    return {
        "user": {
            "id": str(current_user.id),
            "name": current_user.fullname,
            "email": current_user.email,
            "avatar": current_user.profile_photo,
            "target_role": current_user.target_role
        },
        "stats": {
            "total_resumes": total_resumes,
            "latest_ats_score": round(latest_ats_score, 1) if latest_ats_score else None,
            "avg_ats_score": round(float(avg_ats_score), 1) if avg_ats_score else None,
            "cover_letters": cover_letters_count,
            "portfolio_status": "published" if (portfolio and portfolio.is_published) else ("created" if portfolio else "none"),
            "interview_sessions": interview_sessions,
            "ai_credits": current_user.ai_credits
        },
        "subscription": {
            "plan": subscription.plan if subscription else "free",
            "status": subscription.status if subscription else "active",
            "ats_limit": subscription.ats_analyses_limit if subscription else "3",
            "ats_used": subscription.ats_analyses_used if subscription else "0"
        },
        "ats_chart": ats_chart_data,
        "recent_activity": sorted(recent_activity, key=lambda x: x["date"], reverse=True)[:5],
        "recommendations": recommendations
    }


@router.get("/admin/overview")
async def admin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Admin analytics overview."""
    from app.auth.jwt import get_admin_user
    if current_user.role.value != "admin":
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    total_users = db.query(func.count(User.id)).scalar()
    total_resumes = db.query(func.count(Resume.id)).scalar()
    total_ats = db.query(func.count(ATSReport.id)).scalar()
    total_cover_letters = db.query(func.count(CoverLetter.id)).scalar()
    total_portfolios = db.query(func.count(Portfolio.id)).scalar()
    total_interviews = db.query(func.count(InterviewSession.id)).scalar()

    # New users last 7 days
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = db.query(func.count(User.id)).filter(User.created_at >= week_ago).scalar()

    return {
        "overview": {
            "total_users": total_users,
            "new_users_week": new_users_week,
            "total_resumes": total_resumes,
            "total_ats_analyses": total_ats,
            "total_cover_letters": total_cover_letters,
            "total_portfolios": total_portfolios,
            "total_interview_sessions": total_interviews
        }
    }
