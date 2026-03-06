-- HR Platform Database Schema (PostgreSQL)
-- Run: psql -U postgres -d hr_platform -f database.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
-- MIGRATION NOTE: default role changed from 'recruiter' to 'candidate'.
-- Existing 'recruiter' users are unaffected; only new self-registrations default to 'candidate'.
-- Staff/recruiter accounts should be created by an admin with role='recruiter'.
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          VARCHAR(50) NOT NULL DEFAULT 'candidate'
                  CHECK (role IN ('admin', 'recruiter', 'hr_manager', 'candidate', 'company')),
    full_name     VARCHAR(255),
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id                  SERIAL PRIMARY KEY,
    user_id             INT REFERENCES users(id) ON DELETE SET NULL,
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(50),
    location            VARCHAR(255),
    skills              TEXT,
    experience_years    INT,
    salary_expectation  NUMERIC(12, 2),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidates_name     ON candidates USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidates_skills   ON candidates USING gin (skills gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates (location);

-- CVs table
CREATE TABLE IF NOT EXISTS cvs (
    id           SERIAL PRIMARY KEY,
    candidate_id INT REFERENCES candidates(id) ON DELETE CASCADE,
    file_path    TEXT NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    file_size    BIGINT,
    uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cvs_candidate ON cvs (candidate_id);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    skills_required TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id        SERIAL PRIMARY KEY,
    user_id   INT REFERENCES users(id) ON DELETE SET NULL,
    action    VARCHAR(100) NOT NULL,
    resource  VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user      ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);

-- CV Templates table
CREATE TABLE IF NOT EXISTS cv_templates (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    thumbnail_url TEXT,
    html_content  TEXT,
    css_content   TEXT,
    category      VARCHAR(100) DEFAULT 'Professional',
    is_premium    BOOLEAN DEFAULT false,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_templates_category  ON cv_templates (category);
CREATE INDEX IF NOT EXISTS idx_cv_templates_is_premium ON cv_templates (is_premium);

-- User CVs table
CREATE TABLE IF NOT EXISTS user_cvs (
    id               SERIAL PRIMARY KEY,
    user_id          INT REFERENCES users(id) ON DELETE CASCADE,
    template_id      INT REFERENCES cv_templates(id) ON DELETE SET NULL,
    title            VARCHAR(255) NOT NULL DEFAULT 'My CV',
    personal_info    JSONB DEFAULT '{}',
    education        JSONB DEFAULT '[]',
    experience       JSONB DEFAULT '[]',
    skills           TEXT[] DEFAULT '{}',
    languages        JSONB DEFAULT '[]',
    certifications   JSONB DEFAULT '[]',
    summary          TEXT,
    parsed_data      JSONB DEFAULT '{}',
    ats_score        INT DEFAULT 0,
    status           VARCHAR(50) DEFAULT 'draft',
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_cvs_user_id ON user_cvs (user_id);

-- Company profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
    id                     SERIAL PRIMARY KEY,
    user_id                INT REFERENCES users(id) ON DELETE CASCADE,
    name                   VARCHAR(255) NOT NULL,
    industry               VARCHAR(100),
    size                   VARCHAR(50),
    website                VARCHAR(255),
    description            TEXT,
    logo_url               TEXT,
    subscription_tier      VARCHAR(50) DEFAULT 'starter',
    subscription_expires_at TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles (user_id);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id               SERIAL PRIMARY KEY,
    participant1_id  INT REFERENCES users(id) ON DELETE CASCADE,
    participant2_id  INT REFERENCES users(id) ON DELETE CASCADE,
    last_message_at  TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (participant1_id, participant2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations (participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations (participant2_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    sender_id       INT REFERENCES users(id) ON DELETE SET NULL,
    receiver_id     INT REFERENCES users(id) ON DELETE SET NULL,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_read         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender       ON messages (sender_id);

-- AI logs table
CREATE TABLE IF NOT EXISTS ai_logs (
    id                SERIAL PRIMARY KEY,
    user_id           INT REFERENCES users(id) ON DELETE SET NULL,
    action            VARCHAR(100) NOT NULL,
    prompt_tokens     INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    model             VARCHAR(100),
    cost              NUMERIC(10, 6) DEFAULT 0,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs (user_id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id                     SERIAL PRIMARY KEY,
    user_id                INT REFERENCES users(id) ON DELETE CASCADE,
    plan                   VARCHAR(50) NOT NULL,
    status                 VARCHAR(50) DEFAULT 'active',
    stripe_customer_id     VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start   TIMESTAMPTZ,
    current_period_end     TIMESTAMPTZ,
    created_at             TIMESTAMPTZ DEFAULT NOW(),
    updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS user_cvs_updated_at ON user_cvs;
CREATE TRIGGER user_cvs_updated_at
    BEFORE UPDATE ON user_cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS company_profiles_updated_at ON company_profiles;
CREATE TRIGGER company_profiles_updated_at
    BEFORE UPDATE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed: default admin user (password: Admin@1234)
INSERT INTO users (email, password_hash, role, full_name)
VALUES (
    'admin@hrplatform.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhem',
    'admin',
    'Platform Admin'
) ON CONFLICT (email) DO NOTHING;

-- Seed: 20 CV templates
INSERT INTO cv_templates (name, description, category, is_premium, html_content, css_content) VALUES
('Classic Professional', 'A timeless professional design with clean typography and structured layout.', 'Professional', false,
 '<div class="cv-classic">{{content}}</div>',
 '.cv-classic { font-family: Georgia, serif; color: #222; max-width: 800px; margin: 0 auto; padding: 40px; }'),
('Modern Minimalist', 'Clean modern design with ample white space and subtle accents.', 'Simple', false,
 '<div class="cv-modern">{{content}}</div>',
 '.cv-modern { font-family: "Helvetica Neue", sans-serif; color: #333; max-width: 800px; padding: 40px; }'),
('Creative Blue', 'Bold blue sidebar design for creative professionals.', 'Creative', true,
 '<div class="cv-creative-blue">{{content}}</div>',
 '.cv-creative-blue { font-family: Arial, sans-serif; display: grid; grid-template-columns: 280px 1fr; }'),
('Executive Dark', 'Premium dark-themed executive resume for senior professionals.', 'Professional', true,
 '<div class="cv-executive-dark">{{content}}</div>',
 '.cv-executive-dark { font-family: "Times New Roman", serif; background: #1a1a2e; color: #eee; padding: 40px; }'),
('Academic Scholar', 'Formal academic CV layout for researchers and academics.', 'Academic', false,
 '<div class="cv-academic">{{content}}</div>',
 '.cv-academic { font-family: "Palatino Linotype", serif; color: #111; max-width: 800px; padding: 40px; }'),
('Tech Developer', 'Structured layout optimized for software developers and engineers.', 'Professional', false,
 '<div class="cv-tech">{{content}}</div>',
 '.cv-tech { font-family: "Fira Code", monospace; color: #2d3748; max-width: 800px; padding: 40px; }'),
('Colorful Creative', 'Vibrant multi-color design for designers and creatives.', 'Creative', true,
 '<div class="cv-colorful">{{content}}</div>',
 '.cv-colorful { font-family: "Nunito", sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }'),
('Simple Clean', 'Ultra-minimalist single-column design for any industry.', 'Simple', false,
 '<div class="cv-simple">{{content}}</div>',
 '.cv-simple { font-family: Arial, sans-serif; color: #444; max-width: 700px; padding: 40px; line-height: 1.6; }'),
('Two-Column Modern', 'Contemporary two-column layout for maximum information density.', 'Modern', false,
 '<div class="cv-two-col">{{content}}</div>',
 '.cv-two-col { font-family: "Roboto", sans-serif; display: grid; grid-template-columns: 1fr 2fr; gap: 20px; }'),
('Green Nature', 'Fresh green-accented design for environmental and health professionals.', 'Creative', false,
 '<div class="cv-green">{{content}}</div>',
 '.cv-green { font-family: "Open Sans", sans-serif; accent-color: #27ae60; max-width: 800px; padding: 40px; }'),
('Finance Pro', 'Conservative, precise layout for finance and accounting professionals.', 'Professional', true,
 '<div class="cv-finance">{{content}}</div>',
 '.cv-finance { font-family: "Calibri", sans-serif; color: #1a1a1a; border-top: 4px solid #2c3e50; padding: 40px; }'),
('Healthcare CV', 'Clean white layout tailored for medical and healthcare professionals.', 'Professional', false,
 '<div class="cv-healthcare">{{content}}</div>',
 '.cv-healthcare { font-family: "Segoe UI", sans-serif; color: #2c3e50; border-left: 5px solid #3498db; padding: 40px; }'),
('Marketing Creative', 'Dynamic layout showcasing creativity for marketing professionals.', 'Creative', true,
 '<div class="cv-marketing">{{content}}</div>',
 '.cv-marketing { font-family: "Lato", sans-serif; background: #fff; border-radius: 8px; box-shadow: 0 2px 20px rgba(0,0,0,.1); }'),
('Infographic Style', 'Visual-heavy infographic-inspired CV for data and design roles.', 'Creative', true,
 '<div class="cv-infographic">{{content}}</div>',
 '.cv-infographic { font-family: "Source Sans Pro", sans-serif; background: #f8f9fa; padding: 40px; }'),
('Classic Academia', 'Traditional academic format with publications and research sections.', 'Academic', true,
 '<div class="cv-academia">{{content}}</div>',
 '.cv-academia { font-family: "Computer Modern", serif; color: #000; max-width: 800px; padding: 40px; }'),
('Startup Modern', 'Fresh, energetic design for startup and tech company roles.', 'Modern', false,
 '<div class="cv-startup">{{content}}</div>',
 '.cv-startup { font-family: "Inter", sans-serif; color: #1f2937; max-width: 800px; padding: 40px; }'),
('Navy Executive', 'Distinguished navy-blue executive format for C-suite candidates.', 'Professional', true,
 '<div class="cv-navy">{{content}}</div>',
 '.cv-navy { font-family: "Garamond", serif; border-top: 8px solid #1e3a5f; max-width: 800px; padding: 40px; }'),
('Pink Creative', 'Soft pink feminine design for creative and fashion industries.', 'Creative', false,
 '<div class="cv-pink">{{content}}</div>',
 '.cv-pink { font-family: "Quicksand", sans-serif; color: #4a4a4a; accent-color: #e91e8c; padding: 40px; }'),
('Compact One-Page', 'Optimized compact layout that fits everything on one page.', 'Simple', false,
 '<div class="cv-compact">{{content}}</div>',
 '.cv-compact { font-family: Arial, sans-serif; font-size: 11px; color: #333; max-width: 750px; padding: 30px; }'),
('Bold Header Pro', 'Large bold header with clean body, perfect for senior roles.', 'Modern', true,
 '<div class="cv-bold-header">{{content}}</div>',
 '.cv-bold-header { font-family: "Montserrat", sans-serif; color: #2d2d2d; max-width: 800px; padding: 40px; }')
ON CONFLICT DO NOTHING;
