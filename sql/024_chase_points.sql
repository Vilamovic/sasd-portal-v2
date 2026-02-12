-- ============================================
-- SS Chase Points System
-- Track pursuit-related penalty points
-- ============================================

CREATE TABLE IF NOT EXISTS ss_chase_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  given_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ss_chase_points_target ON ss_chase_points(target_user_id);
CREATE INDEX IF NOT EXISTS idx_ss_chase_points_given_by ON ss_chase_points(given_by);

-- RLS
ALTER TABLE ss_chase_points ENABLE ROW LEVEL SECURITY;

-- SELECT: SS division + CS/HCS/DEV only (target user CANNOT see their own points)
DROP POLICY IF EXISTS "chase_points_select" ON ss_chase_points;
CREATE POLICY "chase_points_select" ON ss_chase_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'SS' OR u.role IN ('cs', 'hcs', 'dev'))
    )
    AND target_user_id != auth.uid()
  );

-- INSERT: SS division + CS/HCS/DEV
DROP POLICY IF EXISTS "chase_points_insert" ON ss_chase_points;
CREATE POLICY "chase_points_insert" ON ss_chase_points FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'SS' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

-- DELETE: CS/HCS/DEV only
DROP POLICY IF EXISTS "chase_points_delete" ON ss_chase_points;
CREATE POLICY "chase_points_delete" ON ss_chase_points FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );
