from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, Integer

from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class Template(Base):
    __tablename__ = "templates"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # fresher, experienced, software_engineer, etc.
    thumbnail_url = Column(Text, nullable=True)
    preview_url = Column(Text, nullable=True)
    is_premium = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    usage_count = Column(Integer, default=0)
    config = Column(JSON, default=dict)  # Template configuration
    tags = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Template {self.name}>"
