from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import structlog
import logging

from app.config import settings
from app.database import create_tables
from app.middleware.logging import LoggingMiddleware

# Routes
from app.routes import (
    auth, users, resumes, ats, cover_letter,
    portfolio, interview, chat, dashboard,
    templates, subscription
)
from app.routes import ai_extras

# Configure structlog
structlog.configure(
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    logger_factory=structlog.PrintLoggerFactory(),
)

logger = structlog.get_logger()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    description="""
## CareerForge AI - Backend API

AI-powered Resume, Portfolio, ATS Analysis, Cover Letter, and Interview Preparation platform.

### Features
- **Resume Builder** - Create and manage professional resumes
- **ATS Analyzer** - Analyze resume ATS compatibility
- **Cover Letter Generator** - AI-powered cover letter generation
- **Portfolio Generator** - Auto-generate portfolio websites
- **Interview Prep** - AI-generated interview questions
- **Career Advisor** - AI chatbot for career guidance
- **Job Match Engine** - Match resume to job descriptions

### Authentication
Use **JWT Bearer tokens** for all protected endpoints.
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# State
app.state.limiter = limiter

# Exception handlers
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(loc) for loc in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation error", "errors": errors}
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# CORS
import json as _json
_origins = _json.loads(settings.ALLOWED_ORIGINS) if isinstance(settings.ALLOWED_ORIGINS, str) else settings.ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"]
)

# Custom middleware
app.add_middleware(LoggingMiddleware)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resumes.router)
app.include_router(ats.router)
app.include_router(cover_letter.router)
app.include_router(portfolio.router)
app.include_router(interview.router)
app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(templates.router)
app.include_router(subscription.router)
app.include_router(ai_extras.router)


@app.on_event("startup")
async def startup():
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    create_tables()
    logger.info("Database initialized")


@app.get("/", tags=["Health"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
