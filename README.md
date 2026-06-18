# CareerForge AI 🚀

> AI-powered Resume Builder, ATS Analyzer, Cover Letter Generator, Portfolio Creator & Interview Prep Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://postgresql.org)

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **Resume Builder** | Drag-and-drop builder with 4+ templates, live preview, PDF export |
| **ATS Analyzer** | Upload PDF → get ATS score (0-100) with detailed breakdown |
| **Cover Letter AI** | Gemini-powered personalized cover letters in 3 tones |
| **Portfolio Generator** | Auto-generate portfolio website in 4 themes, export as ZIP |
| **Interview Prep** | AI-generated technical, HR & project questions by role/difficulty |
| **Career Advisor** | ChatGPT-like AI chatbot for career guidance |
| **Job Match Engine** | Compare resume vs. job description with match % |
| **AI Resume Writer** | Generate ATS-optimized resume content from skills + target role |

---

## 🏗️ Tech Stack

**Frontend:** React 18 · Vite · Tailwind CSS · Framer Motion · React Query · React Router  
**Backend:** FastAPI · Python 3.11 · SQLAlchemy · Alembic · Pydantic v2  
**Database:** PostgreSQL (Neon for production)  
**AI:** Google Gemini 1.5 Flash  
**Storage:** Cloudinary  
**Auth:** JWT + Google OAuth  
**Deploy:** Frontend → Vercel · Backend → Render  

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/careerforge-ai.git
cd careerforge-ai
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

```bash
# Create database
createdb careerforge

# Run migrations
alembic upgrade head
```

### 4. Start Backend

```bash
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### 5. Frontend Setup

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:8000

npm install
npm run dev
# App: http://localhost:5173
```

---

## 🐳 Docker (Full Stack)

```bash
# Copy environment files
cp backend/.env.example backend/.env
# Edit backend/.env

# Start everything
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret (generate with `openssl rand -hex 32`) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `FRONTEND_URL` | Frontend URL for OAuth redirect |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

---

## 📁 Project Structure

```
careerforge-ai/
├── backend/
│   ├── app/
│   │   ├── ai/            # Gemini AI integrations
│   │   ├── auth/          # JWT & password utilities
│   │   ├── middleware/    # Logging middleware
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # FastAPI route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # ATS, PDF, Cloudinary, Portfolio
│   │   ├── config.py      # App configuration
│   │   ├── database.py    # DB connection
│   │   └── main.py        # FastAPI app entry point
│   ├── migrations/        # Alembic migrations
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/ui/ # Reusable UI components
│   │   ├── contexts/      # React context (Auth)
│   │   ├── hooks/         # Custom hooks
│   │   ├── layouts/       # Dashboard layout
│   │   ├── pages/         # All page components
│   │   ├── routes/        # Protected route wrappers
│   │   ├── services/      # API service layer
│   │   └── App.jsx        # Router & providers
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## 🌐 API Documentation

Once running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Key Endpoints

```
POST /api/auth/register        → Register new user
POST /api/auth/login           → Login
POST /api/auth/refresh         → Refresh tokens
GET  /api/dashboard/stats      → Dashboard overview

GET  /api/resumes/             → List resumes
POST /api/resumes/             → Create resume
POST /api/resumes/ai/generate  → AI-generate resume
GET  /api/resumes/{id}/download → Download PDF

POST /api/ats/analyze          → Analyze resume PDF
POST /api/ats/match            → Match resume to job

POST /api/cover-letters/generate → Generate cover letter
POST /api/portfolio/generate     → Generate portfolio

POST /api/interview/generate   → Generate interview questions
POST /api/chat/message         → Chat with AI advisor
```

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
vercel --prod
```

### Backend → Render
1. Connect GitHub repo to Render
2. Set environment variables
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Database → Neon
1. Create project at neon.tech
2. Copy connection string to `DATABASE_URL`
3. Run `alembic upgrade head`

---

## 📜 License

MIT © 2024 CareerForge AI
