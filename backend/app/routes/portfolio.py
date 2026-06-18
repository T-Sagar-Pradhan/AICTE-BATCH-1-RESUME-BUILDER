from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.resume import Resume
from app.schemas.portfolio import PortfolioCreate, PortfolioGenerateRequest, PortfolioResponse
from app.auth.jwt import get_current_user
from app.services.portfolio_service import generate_slug, generate_portfolio_html, create_portfolio_zip
import structlog

logger = structlog.get_logger()
router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])


@router.post("/generate", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
async def generate_portfolio(
    data: PortfolioGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Auto-generate portfolio from resume data."""
    portfolio_content = {
        "personal_details": {"name": current_user.fullname, "email": ""},
        "skills": [],
        "projects": [],
        "experience": [],
        "education": [],
        "github_url": data.github_url or current_user.github_url,
        "linkedin_url": data.linkedin_url or current_user.linkedin_url
    }

    if data.resume_id:
        resume = db.query(Resume).filter(
            Resume.id == data.resume_id,
            Resume.user_id == current_user.id
        ).first()
        if resume:
            portfolio_content["personal_details"] = resume.personal_details or {"name": current_user.fullname}
            portfolio_content["skills"] = resume.skills or []
            portfolio_content["projects"] = resume.projects or []
            portfolio_content["experience"] = resume.experience or []
            portfolio_content["education"] = resume.education or []

    slug = generate_slug(current_user.fullname, str(current_user.id))

    portfolio = Portfolio(
        user_id=current_user.id,
        title=f"{current_user.fullname}'s Portfolio",
        slug=slug,
        theme=data.theme,
        tagline=f"Software Developer | {current_user.target_role or 'Tech Enthusiast'}",
        about=f"Hi! I'm {current_user.fullname}, a passionate developer building innovative solutions.",
        skills=portfolio_content["skills"],
        projects=portfolio_content["projects"],
        experience=portfolio_content["experience"],
        education=portfolio_content["education"],
        github_url=portfolio_content["github_url"],
        linkedin_url=portfolio_content["linkedin_url"],
        contact={
            "email": (portfolio_content["personal_details"] or {}).get("email", "")
        }
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)

    logger.info("Portfolio generated", portfolio_id=str(portfolio.id))
    return portfolio


@router.get("/", response_model=List[PortfolioResponse])
async def list_portfolios(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)
    return portfolio


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    data: PortfolioCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)
    for field, value in data.dict(exclude_none=True).items():
        setattr(portfolio, field, value)
    db.commit()
    db.refresh(portfolio)
    return portfolio


@router.post("/{portfolio_id}/publish")
async def toggle_publish(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)
    portfolio.is_published = not portfolio.is_published
    db.commit()
    return {
        "is_published": portfolio.is_published,
        "slug": portfolio.slug,
        "message": "Portfolio published" if portfolio.is_published else "Portfolio unpublished"
    }


@router.get("/{portfolio_id}/preview")
async def preview_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Preview portfolio as HTML."""
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)

    portfolio_data = {
        "personal_details": {"name": current_user.fullname},
        "tagline": portfolio.tagline,
        "about": portfolio.about,
        "skills": portfolio.skills,
        "projects": portfolio.projects,
        "experience": portfolio.experience,
        "education": portfolio.education,
        "contact": portfolio.contact,
        "github_url": portfolio.github_url,
        "linkedin_url": portfolio.linkedin_url
    }

    html = generate_portfolio_html(portfolio_data, portfolio.theme)
    return Response(content=html, media_type="text/html")


@router.get("/{portfolio_id}/download")
async def download_portfolio_zip(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download portfolio as ZIP file."""
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)

    portfolio_data = {
        "personal_details": {"name": current_user.fullname},
        "tagline": portfolio.tagline,
        "about": portfolio.about,
        "skills": portfolio.skills,
        "projects": portfolio.projects,
        "experience": portfolio.experience,
        "education": portfolio.education,
        "contact": portfolio.contact,
        "github_url": portfolio.github_url,
        "linkedin_url": portfolio.linkedin_url
    }

    zip_bytes = create_portfolio_zip(portfolio_data, portfolio.theme)

    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="portfolio-{portfolio.slug}.zip"'}
    )


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    portfolio = _get_user_portfolio(db, portfolio_id, current_user.id)
    db.delete(portfolio)
    db.commit()
    return {"message": "Portfolio deleted"}


def _get_user_portfolio(db: Session, portfolio_id: str, user_id) -> Portfolio:
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id,
        Portfolio.user_id == user_id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio
