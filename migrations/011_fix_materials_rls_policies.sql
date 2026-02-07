-- ================================================
-- Migration 011: Fix Materials RLS Policies for New Role Hierarchy
-- Date: 2026-02-07
--
-- Problem: CS/HCS get errors when accessing division materials
-- Root Cause: RLS policies still check for old 'admin' role
-- Fix: Update policies to use new role hierarchy (cs, hcs, dev)
-- ================================================

-- ================================================
-- 1. DROP OLD POLICIES FOR materials TABLE
-- ================================================

-- Drop old policies that reference 'admin' role
DROP POLICY IF EXISTS "Admins can view all materials" ON materials;
DROP POLICY IF EXISTS "Admins can manage materials" ON materials;
DROP POLICY IF EXISTS "Admins can insert materials" ON materials;
DROP POLICY IF EXISTS "Admins can update materials" ON materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON materials;
DROP POLICY IF EXISTS "Users can view materials" ON materials;
DROP POLICY IF EXISTS "Anyone can view materials" ON materials;

-- ================================================
-- 2. CREATE NEW POLICIES FOR materials TABLE
-- ================================================

-- Everyone can view materials (authenticated users)
CREATE POLICY "Authenticated users can view materials"
  ON materials
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- CS/HCS/Dev can insert materials
CREATE POLICY "Staff can insert materials"
  ON materials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- CS/HCS/Dev can update materials
CREATE POLICY "Staff can update materials"
  ON materials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- HCS/Dev can delete materials (CS cannot)
CREATE POLICY "Senior staff can delete materials"
  ON materials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('hcs', 'dev')
    )
  );

-- ================================================
-- 3. DROP OLD POLICIES FOR division_materials TABLE
-- ================================================

DROP POLICY IF EXISTS "Admins can view division materials" ON division_materials;
DROP POLICY IF EXISTS "Admins can manage division materials" ON division_materials;
DROP POLICY IF EXISTS "Admins can insert division materials" ON division_materials;
DROP POLICY IF EXISTS "Admins can update division materials" ON division_materials;
DROP POLICY IF EXISTS "Admins can delete division materials" ON division_materials;
DROP POLICY IF EXISTS "Users can view division materials" ON division_materials;
DROP POLICY IF EXISTS "Anyone can view division materials" ON division_materials;
DROP POLICY IF EXISTS "Commanders can manage division materials" ON division_materials;

-- ================================================
-- 4. CREATE NEW POLICIES FOR division_materials TABLE
-- ================================================

-- Everyone can view division materials (authenticated users)
CREATE POLICY "Authenticated users can view division materials"
  ON division_materials
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- CS/HCS/Dev/Commanders can insert division materials
CREATE POLICY "Staff and commanders can insert division materials"
  ON division_materials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role IN ('cs', 'hcs', 'dev')
        OR users.is_commander = true
      )
    )
  );

-- CS/HCS/Dev/Commanders can update division materials
CREATE POLICY "Staff and commanders can update division materials"
  ON division_materials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND (
        users.role IN ('cs', 'hcs', 'dev')
        OR users.is_commander = true
      )
    )
  );

-- HCS/Dev can delete division materials (CS/Commanders cannot)
CREATE POLICY "Senior staff can delete division materials"
  ON division_materials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('hcs', 'dev')
    )
  );

-- ================================================
-- 5. UPDATE RPC FUNCTION get_division_materials (IF EXISTS)
-- ================================================

-- Note: If RPC function has role checks, they need to be updated too
-- This is just a comment - actual RPC update requires checking the function definition

-- To check RPC function:
-- SELECT routine_name, routine_definition
-- FROM information_schema.routines
-- WHERE routine_name = 'get_division_materials';

-- If the RPC has role checks like "WHERE role = 'admin'",
-- they should be updated to "WHERE role IN ('cs', 'hcs', 'dev')"

-- ================================================
-- 6. VERIFICATION QUERIES (Run manually to verify)
-- ================================================

-- Check materials RLS policies:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'materials';

-- Check division_materials RLS policies:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'division_materials';

-- Test query as CS user:
-- SELECT * FROM materials LIMIT 1;
-- SELECT * FROM division_materials LIMIT 1;

-- ================================================
-- NOTES FOR DEV:
-- ================================================

-- After running this migration:
-- 1. Test accessing /materials as CS/HCS - should work
-- 2. Test accessing /divisions/[divisionId] as CS/HCS - should work
-- 3. Test adding materials as CS - should work
-- 4. Test deleting materials as CS - should fail (only HCS/Dev can delete)
-- 5. Check if RPC function get_division_materials needs updating

-- ================================================
-- DONE!
-- ================================================
