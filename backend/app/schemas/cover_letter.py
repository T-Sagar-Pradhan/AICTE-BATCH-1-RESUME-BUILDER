from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class CoverLetterCreate(BaseModel):
    resume_id: Optional[UUID] = None
    company_name: str
    job_title: str
    job_description: str
    tone: str = Field(default="professional")  # formal, professional, friendly

    @validator("resume_id", pre=True)
    def empty_str_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class CoverLetterResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    tone: str
    content: str
    pdf_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
