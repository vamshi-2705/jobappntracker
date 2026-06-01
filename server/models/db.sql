-- AI Job Application Tracker — database schema
-- Run against your PostgreSQL database (e.g. psql or Neon SQL editor)

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Applied',
  job_description TEXT,
  notes TEXT,
  applied_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_results (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  match_score INTEGER,
  cover_letter TEXT,
  interview_questions TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: index for faster job lookups per user
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_results_job_id ON ai_results(job_id);
