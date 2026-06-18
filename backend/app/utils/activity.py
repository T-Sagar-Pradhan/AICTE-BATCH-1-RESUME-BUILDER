from sqlalchemy.orm import Session
from app.models.analytics import ActivityLog
import structlog

logger = structlog.get_logger()


def log_activity(
    db: Session,
    user_id,
    action: str,
    description: str = None,
    metadata: dict = None,
    ip_address: str = None
):
    """Log a user activity to the database."""
    try:
        log = ActivityLog(
            user_id=user_id,
            action=action,
            description=description,
            metadata=metadata or {},
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
    except Exception as e:
        logger.error("Activity log failed", error=str(e))
        db.rollback()


# Action constants
class Actions:
    REGISTER          = "register"
    LOGIN             = "login"
    LOGOUT            = "logout"
    RESUME_CREATED    = "resume_created"
    RESUME_UPDATED    = "resume_updated"
    RESUME_DELETED    = "resume_deleted"
    RESUME_DOWNLOADED = "resume_downloaded"
    ATS_ANALYZED      = "ats_analyzed"
    COVER_LETTER_GEN  = "cover_letter_generated"
    PORTFOLIO_GEN     = "portfolio_generated"
    INTERVIEW_GEN     = "interview_questions_generated"
    AI_CHAT           = "ai_chat_message"
    JOB_MATCH         = "job_match_analyzed"
    SUBSCRIPTION_UP   = "subscription_upgraded"
    PASSWORD_RESET    = "password_reset"
    PROFILE_UPDATED   = "profile_updated"
