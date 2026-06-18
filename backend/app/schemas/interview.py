from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class InterviewGenerateRequest(BaseModel):
    target_role: str
    difficulty: str = Field(default="intermediate")  # beginner, intermediate, advanced
    question_types: List[str] = ["technical", "hr", "project"]  # technical, hr, project, behavioral
    resume_id: Optional[UUID] = None
    additional_context: Optional[str] = None
    num_questions: int = Field(default=10, ge=5, le=30)

    @validator("resume_id", pre=True)
    def empty_str_to_none(cls, v):
        if v == "" or v is None:
            return None
        return v


class InterviewQuestionResponse(BaseModel):
    id: UUID
    question: str
    suggested_answer: Optional[str] = None
    question_type: str
    difficulty: str
    topic: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True


class InterviewSessionResponse(BaseModel):
    id: UUID
    title: str
    target_role: str
    difficulty: str
    question_types: List[str]
    questions: List[InterviewQuestionResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True
