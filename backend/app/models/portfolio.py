from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON, ForeignKey

from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base
from app.models.base import GUID


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(GUID, primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(GUID, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False, default="My Portfolio")
    slug = Column(String(255), unique=True, nullable=True)
    theme = Column(String(50), default="dark")  # dark, light, cyberpunk, professional
    is_published = Column(Boolean, default=False)
    views = Column(String(20), default="0")

    # Portfolio content
    tagline = Column(String(255), nullable=True)
    about = Column(Text, nullable=True)
    skills = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)
    contact = Column(JSON, default=dict)

    # Social links
    github_url = Column(Text, nullable=True)
    linkedin_url = Column(Text, nullable=True)
    twitter_url = Column(Text, nullable=True)
    website_url = Column(Text, nullable=True)

    # Export
    zip_url = Column(Text, nullable=True)
    github_repo_url = Column(Text, nullable=True)

    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="portfolios")

    def __repr__(self):
        return f"<Portfolio {self.title}>"
