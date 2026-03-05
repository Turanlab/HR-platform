-- HR Platform Database Schema (PostgreSQL)
-- Run: psql -U postgres -d hr_platform -f database.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(50) NOT NULL DEFAULT 'recruiter'
                CHECK (role IN ('admin', 'recruiter', 'hr_manager')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
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

-- Trigger to auto-update users.updated_at
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

-- Seed: default admin user (password: Admin@1234)
-- bcrypt hash generated with 10 rounds
INSERT INTO users (email, password_hash, role)
VALUES (
    'admin@hrplatform.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhem',
    'admin'
) ON CONFLICT (email) DO NOTHING;
