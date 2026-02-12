-- ============================================
-- GU Gang Members + Reports System
-- Members database + investigation/autopsy reports
-- ============================================

-- Gang members: osoby powiązane z gangami
CREATE TABLE IF NOT EXISTS gang_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gang_id UUID NOT NULL REFERENCES gang_profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  alias TEXT,
  dob TEXT,
  gender TEXT,
  race TEXT,
  height TEXT,
  weight TEXT,
  description TEXT,
  skin_id INTEGER,
  mugshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Gang member reports: raporty śledcze + autopsje
CREATE TABLE IF NOT EXISTS gang_member_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES gang_members(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('investigation', 'autopsy')),
  date TEXT,
  location TEXT,
  description TEXT,
  result_status TEXT,
  officers TEXT[],
  evidence_urls TEXT[],
  autopsy_data JSONB,
  body_markers JSONB,
  signed_by TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gang_members_gang ON gang_members(gang_id);
CREATE INDEX IF NOT EXISTS idx_gang_members_status ON gang_members(status);
CREATE INDEX IF NOT EXISTS idx_gang_member_reports_member ON gang_member_reports(member_id);

-- RLS
ALTER TABLE gang_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE gang_member_reports ENABLE ROW LEVEL SECURITY;

-- gang_members: GU + CS/HCS/DEV can read and write
DROP POLICY IF EXISTS "gang_members_select" ON gang_members;
CREATE POLICY "gang_members_select" ON gang_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'GU' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "gang_members_insert" ON gang_members;
CREATE POLICY "gang_members_insert" ON gang_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'GU' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "gang_members_update" ON gang_members;
CREATE POLICY "gang_members_update" ON gang_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'GU' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "gang_members_delete" ON gang_members;
CREATE POLICY "gang_members_delete" ON gang_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

-- gang_member_reports: same access
DROP POLICY IF EXISTS "gang_reports_select" ON gang_member_reports;
CREATE POLICY "gang_reports_select" ON gang_member_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'GU' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "gang_reports_insert" ON gang_member_reports;
CREATE POLICY "gang_reports_insert" ON gang_member_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'GU' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "gang_reports_delete" ON gang_member_reports;
CREATE POLICY "gang_reports_delete" ON gang_member_reports FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );
