from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.template import Template
from app.auth.jwt import get_current_user, get_admin_user
from pydantic import BaseModel

router = APIRouter(prefix="/api/templates", tags=["Templates"])


class TemplateResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    category: str
    thumbnail_url: Optional[str] = None
    is_premium: bool
    usage_count: int
    tags: List[str] = []

    class Config:
        from_attributes = True


@router.get("/", response_model=List[TemplateResponse])
async def list_templates(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Template).filter(Template.is_active == True)
    if category:
        query = query.filter(Template.category == category)
    return query.order_by(Template.usage_count.desc()).all()


@router.get("/{template_id}")
async def get_template(template_id: str, db: Session = Depends(get_db)):
    template = db.query(Template).filter(Template.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/seed")
async def seed_templates(
    admin=Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Seed default templates."""
    default_templates = [
        {"name": "Modern", "slug": "modern", "category": "general", "description": "Clean modern design with blue accent", "is_premium": False, "tags": ["modern", "clean", "ats-friendly"]},
        {"name": "ATS Friendly", "slug": "ats_friendly", "category": "general", "description": "Optimized for applicant tracking systems", "is_premium": False, "tags": ["ats", "simple", "text-only"]},
        {"name": "Corporate", "slug": "corporate", "category": "experienced", "description": "Professional corporate style for senior roles", "is_premium": True, "tags": ["corporate", "executive", "professional"]},
        {"name": "Minimal", "slug": "minimal", "category": "general", "description": "Clean minimal design, less is more", "is_premium": False, "tags": ["minimal", "simple", "elegant"]},
        {"name": "Developer", "slug": "developer", "category": "software_engineer", "description": "Technical resume for software engineers", "is_premium": False, "tags": ["tech", "developer", "engineering"]},
        {"name": "Fresher", "slug": "fresher", "category": "fresher", "description": "Perfect for fresh graduates", "is_premium": False, "tags": ["fresher", "graduate", "entry-level"]},
        {"name": "Data Scientist", "slug": "data_scientist", "category": "data_analyst", "description": "Optimized for data roles", "is_premium": True, "tags": ["data", "analytics", "ml"]},
        {"name": "Product Manager", "slug": "product_manager", "category": "product_manager", "description": "Tailored for PM roles", "is_premium": True, "tags": ["product", "management", "strategy"]}
    ]

    created = 0
    for t in default_templates:
        existing = db.query(Template).filter(Template.slug == t["slug"]).first()
        if not existing:
            template = Template(**t)
            db.add(template)
            created += 1

    db.commit()
    return {"message": f"Seeded {created} templates"}
