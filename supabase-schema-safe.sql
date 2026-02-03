-- ============================================
-- SASD PORTAL - DATABASE SCHEMA (SAFE VERSION)
-- ============================================
-- Ten plik można uruchomić wielokrotnie bez błędów
-- Usuwa istniejące policies przed stworzeniem nowych

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT,
  mta_nick TEXT,
  badge TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'dev')),
  force_logout_after TIMESTAMP WITH TIME ZONE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_mta_nick ON users(mta_nick);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Admins can delete users" ON users;

-- Policy: Wszyscy zalogowani mogą czytać użytkowników
CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Użytkownicy mogą aktualizować tylko swoje dane
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Użytkownicy mogą wstawiać swoje dane
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Tylko admin/dev mogą usuwać użytkowników
CREATE POLICY "Admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- ============================================
-- 2. EXAM TYPES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  passing_threshold INTEGER DEFAULT 75 CHECK (passing_threshold >= 0 AND passing_threshold <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE exam_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read exam types" ON exam_types;

-- Policy: Wszyscy mogą czytać typy egzaminów
CREATE POLICY "Anyone can read exam types"
  ON exam_types FOR SELECT
  TO authenticated
  USING (true);

-- Seed initial exam types (7 typów)
INSERT INTO exam_types (name, description, passing_threshold) VALUES
  ('Egzamin Trainee', 'Egzamin dla pozycji Trainee', 50),
  ('Egzamin Pościgowy', 'Egzamin pościgowy', 50),
  ('Egzamin SWAT', 'Egzamin dla jednostki SWAT', 50),
  ('Egzamin GU', 'Egzamin dla jednostki GU', 75),
  ('Egzamin DTU', 'Egzamin dla jednostki DTU', 75),
  ('Egzamin SS', 'Egzamin dla jednostki SS', 75),
  ('Egzamin z Wiedzy Ponadpodstawowej', 'Egzamin zaawansowany', 75)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. EXAM QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_questions (
  id SERIAL PRIMARY KEY,
  exam_type_id INTEGER NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of 4 options
  correct_answers JSONB NOT NULL, -- Array of correct indices
  is_multiple_choice BOOLEAN DEFAULT FALSE,
  time_limit INTEGER DEFAULT 30, -- Seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(exam_type_id);

-- RLS
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read questions" ON exam_questions;
DROP POLICY IF EXISTS "Admins can insert questions" ON exam_questions;
DROP POLICY IF EXISTS "Admins can update questions" ON exam_questions;
DROP POLICY IF EXISTS "Admins can delete questions" ON exam_questions;

-- Policy: Wszyscy mogą czytać pytania
CREATE POLICY "Anyone can read questions"
  ON exam_questions FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tylko admin/dev mogą dodawać pytania
CREATE POLICY "Admins can insert questions"
  ON exam_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą edytować pytania
CREATE POLICY "Admins can update questions"
  ON exam_questions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą usuwać pytania
CREATE POLICY "Admins can delete questions"
  ON exam_questions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- ============================================
-- 4. EXAM RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY,
  exam_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type_id INTEGER NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- { questionId: userAnswer }
  questions JSONB NOT NULL, -- Array of exam questions (snapshot)
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_results_user ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_type ON exam_results(exam_type_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_archived ON exam_results(is_archived);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);

-- RLS
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own results" ON exam_results;
DROP POLICY IF EXISTS "Users can insert own results" ON exam_results;
DROP POLICY IF EXISTS "Admins can update results" ON exam_results;
DROP POLICY IF EXISTS "Admins can delete results" ON exam_results;

-- Policy: Users mogą czytać tylko swoje wyniki
CREATE POLICY "Users can read own results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Wszyscy mogą wstawiać wyniki (własne)
CREATE POLICY "Users can insert own results"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Tylko admin/dev mogą aktualizować wyniki (archiwizacja)
CREATE POLICY "Admins can update results"
  ON exam_results FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą usuwać wyniki
CREATE POLICY "Admins can delete results"
  ON exam_results FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- ============================================
-- 5. MATERIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML content from Quill
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read materials" ON materials;
DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
DROP POLICY IF EXISTS "Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON materials;

-- Policy: Wszyscy mogą czytać materiały
CREATE POLICY "Anyone can read materials"
  ON materials FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Tylko admin/dev mogą dodawać materiały
CREATE POLICY "Admins can insert materials"
  ON materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą edytować materiały
CREATE POLICY "Admins can update materials"
  ON materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą usuwać materiały
CREATE POLICY "Admins can delete materials"
  ON materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'dev')
    )
  );

-- ============================================
-- 6. RPC FUNCTIONS
-- ============================================

-- Function: Update user role (tylko dev może nadawać role)
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Sprawdź czy wywołujący jest dev
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'dev'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only dev can update roles';
  END IF;

  -- Aktualizuj rolę
  UPDATE users
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_exam_questions_updated_at ON exam_questions;
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_questions_updated_at BEFORE UPDATE ON exam_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DONE! Schema created successfully
-- ============================================
-- Po wykonaniu tego skryptu, odśwież stronę SASD Portal
