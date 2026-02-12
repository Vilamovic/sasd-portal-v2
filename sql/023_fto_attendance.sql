-- ============================================
-- FTO Attendance System
-- Training groups + attendance tracking
-- ============================================

-- Training groups: pairs of 2 FTOs + assigned trainees
CREATE TABLE IF NOT EXISTS fto_training_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  fto1_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fto2_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Group members (trainees assigned to a group)
CREATE TABLE IF NOT EXISTS fto_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES fto_training_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Attendance records
CREATE TABLE IF NOT EXISTS fto_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES fto_training_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('OB', 'NB', 'U')),
  marked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_fto_group_members_group ON fto_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_fto_group_members_user ON fto_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_fto_attendance_group_date ON fto_attendance(group_id, date);
CREATE INDEX IF NOT EXISTS idx_fto_attendance_user ON fto_attendance(user_id);

-- RLS Policies
ALTER TABLE fto_training_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fto_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE fto_attendance ENABLE ROW LEVEL SECURITY;

-- Training groups: FTO members + CS+ can read, CS+ can manage
DROP POLICY IF EXISTS "fto_groups_select" ON fto_training_groups;
CREATE POLICY "fto_groups_select" ON fto_training_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'FTO' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "fto_groups_insert" ON fto_training_groups;
CREATE POLICY "fto_groups_insert" ON fto_training_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

DROP POLICY IF EXISTS "fto_groups_update" ON fto_training_groups;
CREATE POLICY "fto_groups_update" ON fto_training_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

DROP POLICY IF EXISTS "fto_groups_delete" ON fto_training_groups;
CREATE POLICY "fto_groups_delete" ON fto_training_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

-- Group members: same as groups
DROP POLICY IF EXISTS "fto_members_select" ON fto_group_members;
CREATE POLICY "fto_members_select" ON fto_group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'FTO' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "fto_members_insert" ON fto_group_members;
CREATE POLICY "fto_members_insert" ON fto_group_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

DROP POLICY IF EXISTS "fto_members_delete" ON fto_group_members;
CREATE POLICY "fto_members_delete" ON fto_group_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );

-- Attendance: FTO members can read+write, CS+ full access
DROP POLICY IF EXISTS "fto_attendance_select" ON fto_attendance;
CREATE POLICY "fto_attendance_select" ON fto_attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'FTO' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "fto_attendance_insert" ON fto_attendance;
CREATE POLICY "fto_attendance_insert" ON fto_attendance FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'FTO' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "fto_attendance_update" ON fto_attendance;
CREATE POLICY "fto_attendance_update" ON fto_attendance FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND (u.division::text = 'FTO' OR u.role IN ('cs', 'hcs', 'dev'))
    )
  );

DROP POLICY IF EXISTS "fto_attendance_delete" ON fto_attendance;
CREATE POLICY "fto_attendance_delete" ON fto_attendance FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid()
      AND u.role IN ('cs', 'hcs', 'dev')
    )
  );
