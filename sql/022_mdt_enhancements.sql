-- ============================================
-- MDT ENHANCEMENTS: record_number, record_level, GU access
-- ============================================

-- 1. Auto-increment record_number for SASD-XXXXXX IDs
ALTER TABLE mdt_records ADD COLUMN IF NOT EXISTS record_number SERIAL;

-- 2. Record level field (Kartoteka poziomu I / II)
ALTER TABLE mdt_records ADD COLUMN IF NOT EXISTS record_level INTEGER DEFAULT 1;

-- ============================================
-- UPDATE RLS POLICIES: Add GU division access to MDT
-- ============================================

-- mdt_records
DROP POLICY IF EXISTS "mdt_records_select" ON mdt_records;
CREATE POLICY "mdt_records_select" ON mdt_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_records_insert" ON mdt_records;
CREATE POLICY "mdt_records_insert" ON mdt_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_records_update" ON mdt_records;
CREATE POLICY "mdt_records_update" ON mdt_records FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_records_delete" ON mdt_records;
CREATE POLICY "mdt_records_delete" ON mdt_records FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

-- mdt_criminal_records
DROP POLICY IF EXISTS "mdt_criminal_records_select" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_select" ON mdt_criminal_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_insert" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_insert" ON mdt_criminal_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_update" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_update" ON mdt_criminal_records FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_delete" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_delete" ON mdt_criminal_records FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

-- mdt_notes
DROP POLICY IF EXISTS "mdt_notes_select" ON mdt_notes;
CREATE POLICY "mdt_notes_select" ON mdt_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_notes_insert" ON mdt_notes;
CREATE POLICY "mdt_notes_insert" ON mdt_notes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_notes_update" ON mdt_notes;
CREATE POLICY "mdt_notes_update" ON mdt_notes FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_notes_delete" ON mdt_notes;
CREATE POLICY "mdt_notes_delete" ON mdt_notes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

-- mdt_warrants
DROP POLICY IF EXISTS "mdt_warrants_select" ON mdt_warrants;
CREATE POLICY "mdt_warrants_select" ON mdt_warrants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_warrants_insert" ON mdt_warrants;
CREATE POLICY "mdt_warrants_insert" ON mdt_warrants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_warrants_update" ON mdt_warrants;
CREATE POLICY "mdt_warrants_update" ON mdt_warrants FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_warrants_delete" ON mdt_warrants;
CREATE POLICY "mdt_warrants_delete" ON mdt_warrants FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

-- mdt_bolo_vehicles
DROP POLICY IF EXISTS "mdt_bolo_select" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_select" ON mdt_bolo_vehicles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_bolo_insert" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_insert" ON mdt_bolo_vehicles FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_bolo_update" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_update" ON mdt_bolo_vehicles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);

DROP POLICY IF EXISTS "mdt_bolo_delete" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_delete" ON mdt_bolo_vehicles FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text IN ('DTU', 'GU'))
  )
);
