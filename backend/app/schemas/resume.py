from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from uuid import UUID


class PersonalDetails(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    portfolio: Optional[str] = None


class Education(BaseModel):
    institution: str
    degree: str
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[str] = None
    achievements: Optional[List[str]] = []


class Experience(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    description: Optional[List[str]] = []
    technologies: Optional[List[str]] = []


class Project(BaseModel):
    name: str
    description: Optional[str] = None
    technologies: Optional[List[str]] = []
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    highlights: Optional[List[str]] = []


class Certification(BaseModel):
    name: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    credential_id: Optional[str] = None
    url: Optional[str] = None


class Achievement(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[str] = None


class Language(BaseModel):
    name: str
    proficiency: Optional[str] = None  # native, fluent, intermediate, basic


class ResumeCreate(BaseModel):
    title: str = Field(default="My Resume", max_length=255)
    template: str = Field(default="modern")
    personal_details: Optional[Dict[str, Any]] = None
    education: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[Any]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[Dict[str, Any]]] = []
    achievements: Optional[List[Dict[str, Any]]] = []
    languages: Optional[List[Dict[str, Any]]] = []
    summary: Optional[str] = None


class ResumeUpdate(ResumeCreate):
    title: Optional[str] = None
    template: Optional[str] = None


class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    template: str
    is_primary: bool
    ats_score: Optional[float] = None
    cloudinary_url: Optional[str] = None
    personal_details: Optional[Dict[str, Any]] = None
    education: Optional[List[Any]] = []
    experience: Optional[List[Any]] = []
    skills: Optional[List[Any]] = []
    projects: Optional[List[Any]] = []
    certifications: Optional[List[Any]] = []
    achievements: Optional[List[Any]] = []
    languages: Optional[List[Any]] = []
    summary: Optional[str] = None
    ai_generated: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIResumeGenerateRequest(BaseModel):
    skills: List[str]
    education: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    target_job: str
    additional_context: Optional[str] = None
