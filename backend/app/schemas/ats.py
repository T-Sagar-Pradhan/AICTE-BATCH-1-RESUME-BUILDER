from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ATSAnalysisResponse(BaseModel):
    id: UUID
    overall_score: float
    formatting_score: float
    skills_score: float
    keyword_score: float
    readability_score: float
    structure_score: float
    detected_skills: List[str]
    missing_keywords: List[str]
    weak_sections: List[str]
    formatting_issues: List[str]
    recommendations: List[str]
    sections_found: List[str]
    contact_info: Dict[str, Any]
    extracted_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class JobMatchRequest(BaseModel):
    resume_text: Optional[str] = None
    resume_id: Optional[UUID] = None
    job_description: str
    job_title: Optional[str] = None
    company: Optional[str] = None


class JobMatchResponse(BaseModel):
    match_score: float
    missing_skills: List[str]
    matching_skills: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
    strengths: List[str]
    job_description_id: Optional[UUID] = None
