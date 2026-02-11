-- Migration 020: Division Reports + Gang Profiles + SWAT Operator
-- Tabele: division_reports, gang_profiles
-- Kolumna: is_swat_operator w users

-- ============================================
-- 0. KOLUMNA: is_swat_operator w users (MUSI być przed policies!)
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_swat_operator BOOLEAN DEFAULT FALSE;

-- ============================================
-- 1. TABELA: division_reports
-- ============================================

CREATE TABLE IF NOT EXISTS division_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL,
  report_type TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  participants UUID[] DEFAULT '{}',
  form_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id)
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_division_reports_division ON division_reports(division);
CREATE INDEX IF NOT EXISTS idx_division_reports_author ON division_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_division_reports_status ON division_reports(status);
CREATE INDEX IF NOT EXISTS idx_division_reports_type ON division_reports(report_type);

-- RLS
ALTER TABLE division_reports ENABLE ROW LEVEL SECURITY;

-- SELECT: autor OR member dywizji OR cs/hcs/dev
DROP POLICY IF EXISTS "division_reports_select" ON division_reports;
CREATE POLICY "division_reports_select" ON division_reports
  FOR SELECT USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR u.division::text = division_reports.division
        OR (division_reports.division = 'SWAT' AND (
          'SWAT' = ANY(u.permissions)
          OR u.is_swat_commander = true
          OR u.is_swat_operator = true
        ))
      )
    )
  );

-- INSERT: member dywizji OR cs/hcs/dev
DROP POLICY IF EXISTS "division_reports_insert" ON division_reports;
CREATE POLICY "division_reports_insert" ON division_reports
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR u.division::text = division_reports.division
        OR (division_reports.division = 'SWAT' AND (
          'SWAT' = ANY(u.permissions)
          OR u.is_swat_commander = true
          OR u.is_swat_operator = true
        ))
      )
    )
  );

-- UPDATE: autor OR cs/hcs/dev
DROP POLICY IF EXISTS "division_reports_update" ON division_reports;
CREATE POLICY "division_reports_update" ON division_reports
  FOR UPDATE USING (
    auth.uid() = author_id
    OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

-- DELETE: cs/hcs/dev only
DROP POLICY IF EXISTS "division_reports_delete" ON division_reports;
CREATE POLICY "division_reports_delete" ON division_reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

-- ============================================
-- 2. TABELA: gang_profiles
-- ============================================

CREATE TABLE IF NOT EXISTS gang_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE gang_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: GU members + cs/hcs/dev
DROP POLICY IF EXISTS "gang_profiles_select" ON gang_profiles;
CREATE POLICY "gang_profiles_select" ON gang_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR u.division::text = 'GU'
      )
    )
  );

-- INSERT: cs/hcs/dev + GU commander
DROP POLICY IF EXISTS "gang_profiles_insert" ON gang_profiles;
CREATE POLICY "gang_profiles_insert" ON gang_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR (u.division::text = 'GU' AND u.is_commander = true)
      )
    )
  );

-- UPDATE: cs/hcs/dev + GU commander
DROP POLICY IF EXISTS "gang_profiles_update" ON gang_profiles;
CREATE POLICY "gang_profiles_update" ON gang_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR (u.division::text = 'GU' AND u.is_commander = true)
      )
    )
  );

-- DELETE: cs/hcs/dev + GU commander
DROP POLICY IF EXISTS "gang_profiles_delete" ON gang_profiles;
CREATE POLICY "gang_profiles_delete" ON gang_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()
      AND (
        u.role IN ('cs', 'hcs', 'dev')
        OR (u.division::text = 'GU' AND u.is_commander = true)
      )
    )
  );

-- (is_swat_operator already added at top of migration)
