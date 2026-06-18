-- ================================================================
-- CareerForge AI — PostgreSQL Database Schema
-- Run: psql -d careerforge -f schema.sql
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE IF NOT EXISTS users (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fullname         VARCHAR(255) NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    password         VARCHAR(255),
    profile_photo    TEXT,
    role             user_role DEFAULT 'user' NOT NULL,
    is_active        BOOLEAN DEFAULT TRUE,
    is_verified      BOOLEAN DEFAULT FALSE,
    google_id        VARCHAR(255) UNIQUE,
    github_id        VARCHAR(255) UNIQUE,
    linkedin_url     TEXT,
    github_url       TEXT,
    target_role      VARCHAR(255),
    ai_credits       VARCHAR(10) DEFAULT '10',
    reset_token      VARCHAR(255),
    reset_token_expires TIMESTAMPTZ,
    last_login       TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- ── SUBSCRIPTIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                 VARCHAR(50) DEFAULT 'free' NOT NULL,
    status               VARCHAR(50) DEFAULT 'active',
    expiry_date          TIMESTAMPTZ,
    payment_id           VARCHAR(255),
    amount_paid          VARCHAR(20),
    currency             VARCHAR(10) DEFAULT 'INR',
    ats_analyses_used    VARCHAR(10) DEFAULT '0',
    cover_letters_used   VARCHAR(10) DEFAULT '0',
    ai_credits_used      VARCHAR(10) DEFAULT '0',
    ats_analyses_limit   VARCHAR(10) DEFAULT '3',
    cover_letters_limit  VARCHAR(10) DEFAULT '3',
    ai_credits_limit     VARCHAR(10) DEFAULT '10',
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ── RESUMES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(255) DEFAULT 'My Resume',
    template            VARCHAR(100) DEFAULT 'modern',
    is_primary          BOOLEAN DEFAULT FALSE,
    ats_score           FLOAT,
    cloudinary_url      TEXT,
    cloudinary_public_id VARCHAR(255),
    personal_details    JSONB,
    education           JSONB DEFAULT '[]',
    experience          JSONB DEFAULT '[]',
    skills              JSONB DEFAULT '[]',
    projects            JSONB DEFAULT '[]',
    certifications      JSONB DEFAULT '[]',
    achievements        JSONB DEFAULT '[]',
    languages           JSONB DEFAULT '[]',
    summary             TEXT,
    ai_generated        BOOLEAN DEFAULT FALSE,
    ai_summary          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resumes_user_id ON resumes(user_id);

-- ── RESUME VERSIONS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resume_versions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id      UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot       JSONB NOT NULL,
    change_summary TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── JOB DESCRIPTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_descriptions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title             VARCHAR(255) NOT NULL,
    company           VARCHAR(255),
    description       TEXT NOT NULL,
    required_skills   JSONB DEFAULT '[]',
    preferred_skills  JSONB DEFAULT '[]',
    experience_level  VARCHAR(50),
    location          VARCHAR(255),
    salary_range      VARCHAR(100),
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── ATS REPORTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ats_reports (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id           UUID REFERENCES resumes(id) ON DELETE SET NULL,
    job_description_id  UUID REFERENCES job_descriptions(id) ON DELETE SET NULL,
    file_url            TEXT,
    file_name           VARCHAR(255),
    extracted_text      TEXT,
    overall_score       FLOAT NOT NULL DEFAULT 0,
    formatting_score    FLOAT DEFAULT 0,
    skills_score        FLOAT DEFAULT 0,
    keyword_score       FLOAT DEFAULT 0,
    readability_score   FLOAT DEFAULT 0,
    structure_score     FLOAT DEFAULT 0,
    detected_skills     JSONB DEFAULT '[]',
    missing_keywords    JSONB DEFAULT '[]',
    weak_sections       JSONB DEFAULT '[]',
    formatting_issues   JSONB DEFAULT '[]',
    recommendations     JSONB DEFAULT '[]',
    sections_found      JSONB DEFAULT '[]',
    contact_info        JSONB DEFAULT '{}',
    match_score         FLOAT,
    missing_skills      JSONB DEFAULT '[]',
    match_suggestions   JSONB DEFAULT '[]',
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ats_reports_user_id ON ats_reports(user_id);

-- ── COVER LETTERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cover_letters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id       UUID REFERENCES resumes(id) ON DELETE SET NULL,
    title           VARCHAR(255) DEFAULT 'Cover Letter',
    company_name    VARCHAR(255),
    job_title       VARCHAR(255),
    tone            VARCHAR(50) DEFAULT 'professional',
    content         TEXT NOT NULL,
    job_description TEXT,
    pdf_url         TEXT,
    docx_url        TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── PORTFOLIOS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) DEFAULT 'My Portfolio',
    slug            VARCHAR(255) UNIQUE,
    theme           VARCHAR(50) DEFAULT 'dark',
    is_published    BOOLEAN DEFAULT FALSE,
    views           VARCHAR(20) DEFAULT '0',
    tagline         VARCHAR(255),
    about           TEXT,
    skills          JSONB DEFAULT '[]',
    projects        JSONB DEFAULT '[]',
    experience      JSONB DEFAULT '[]',
    education       JSONB DEFAULT '[]',
    contact         JSONB DEFAULT '{}',
    github_url      TEXT,
    linkedin_url    TEXT,
    twitter_url     TEXT,
    website_url     TEXT,
    zip_url         TEXT,
    github_repo_url TEXT,
    meta_title      VARCHAR(255),
    meta_description TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── TEMPLATES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS templates (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    description   TEXT,
    category      VARCHAR(100) NOT NULL,
    thumbnail_url TEXT,
    preview_url   TEXT,
    is_premium    BOOLEAN DEFAULT FALSE,
    is_active     BOOLEAN DEFAULT TRUE,
    usage_count   INTEGER DEFAULT 0,
    config        JSONB DEFAULT '{}',
    tags          JSONB DEFAULT '[]',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default templates
INSERT INTO templates (name, slug, category, description, is_premium, tags) VALUES
    ('Modern',        'modern',       'general',          'Clean modern design with blue accent',           FALSE, '["modern","clean","ats-friendly"]'),
    ('ATS Friendly',  'ats_friendly', 'general',          'Optimized for applicant tracking systems',       FALSE, '["ats","simple","text-only"]'),
    ('Corporate',     'corporate',    'experienced',      'Professional corporate style for senior roles',  TRUE,  '["corporate","executive","professional"]'),
    ('Minimal',       'minimal',      'general',          'Clean minimal design, less is more',             FALSE, '["minimal","simple","elegant"]'),
    ('Developer',     'developer',    'software_engineer','Technical resume for software engineers',        FALSE, '["tech","developer","engineering"]'),
    ('Fresher',       'fresher',      'fresher',          'Perfect for fresh graduates',                    FALSE, '["fresher","graduate","entry-level"]'),
    ('Data Scientist','data_scientist','data_analyst',    'Optimized for data roles',                       TRUE,  '["data","analytics","ml"]'),
    ('Product Manager','product_manager','product_manager','Tailored for PM roles',                        TRUE,  '["product","management","strategy"]')
ON CONFLICT (slug) DO NOTHING;

-- ── INTERVIEW SESSIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) DEFAULT 'Interview Prep Session',
    target_role     VARCHAR(255) NOT NULL,
    difficulty      VARCHAR(50) DEFAULT 'intermediate',
    question_types  JSONB DEFAULT '[]',
    resume_context  TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── INTERVIEW QUESTIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_questions (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id       UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question         TEXT NOT NULL,
    suggested_answer TEXT,
    question_type    VARCHAR(50) NOT NULL,
    difficulty       VARCHAR(50) DEFAULT 'intermediate',
    topic            VARCHAR(255),
    order_index      INTEGER DEFAULT 0,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHAT HISTORIES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_histories (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title        VARCHAR(255) DEFAULT 'New Chat',
    context_type VARCHAR(50) DEFAULT 'general',
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── CHAT MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id     UUID NOT NULL REFERENCES chat_histories(id) ON DELETE CASCADE,
    role        VARCHAR(20) NOT NULL,
    content     TEXT NOT NULL,
    tokens_used VARCHAR(10),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_chat_id ON chat_messages(chat_id);

-- ── ANALYTICS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date                  DATE UNIQUE NOT NULL,
    total_users           INTEGER DEFAULT 0,
    new_users             INTEGER DEFAULT 0,
    active_users          INTEGER DEFAULT 0,
    resumes_created       INTEGER DEFAULT 0,
    ats_analyses          INTEGER DEFAULT 0,
    cover_letters         INTEGER DEFAULT 0,
    portfolios_generated  INTEGER DEFAULT 0,
    interview_sessions    INTEGER DEFAULT 0,
    ai_requests           INTEGER DEFAULT 0,
    revenue               FLOAT DEFAULT 0.0,
    created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITY LOGS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action      VARCHAR(100) NOT NULL,
    description TEXT,
    metadata    JSONB DEFAULT '{}',
    ip_address  VARCHAR(50),
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- ── TRIGGERS: auto-update updated_at ─────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['users','subscriptions','resumes','cover_letters','portfolios','templates','chat_histories'] LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW EXECUTE FUNCTION update_updated_at();
        ', t, t);
    END LOOP;
END;
$$;
