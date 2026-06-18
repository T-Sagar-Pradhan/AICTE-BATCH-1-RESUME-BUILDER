from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class PortfolioCreate(BaseModel):
    title: Optional[str] = "My Portfolio"
    theme: str = Field(default="dark")  # dark, light, cyberpunk, professional
    tagline: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[List[Any]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    education: Optional[List[Dict[str, Any]]] = []
    contact: Optional[Dict[str, Any]] = {}
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    website_url: Optional[str] = None


class PortfolioGenerateRequest(BaseModel):
    resume_id: Optional[UUID] = None
    theme: str = "dark"
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    @validator("resume_id", pre=True)
    def empty_str_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class PortfolioResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    slug: Optional[str] = None
    theme: str
    is_published: bool
    views: str
    tagline: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[List[Any]] = []
    projects: Optional[List[Any]] = []
    experience: Optional[List[Any]] = []
    education: Optional[List[Any]] = []
    contact: Optional[Dict[str, Any]] = {}
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    zip_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
