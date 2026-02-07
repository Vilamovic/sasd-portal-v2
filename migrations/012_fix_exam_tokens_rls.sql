-- ================================================
-- Migration 012: Fix exam_access_tokens RLS Policies
-- Date: 2026-02-07
--
-- Problem: CS/HCS cannot generate exam tokens - RLS policy blocks INSERT
-- Root Cause: exam_access_tokens table has old policies checking 'admin' role
-- Fix: Update policies to use new role hierarchy (cs, hcs, dev)
-- ================================================

-- ================================================
-- 1. DROP OLD POLICIES FOR exam_access_tokens
-- ================================================

DROP POLICY IF EXISTS "Admins can view tokens" ON exam_access_tokens;
DROP POLICY IF EXISTS "Admins can insert tokens" ON exam_access_tokens;
DROP POLICY IF EXISTS "Admins can delete tokens" ON exam_access_tokens;
DROP POLICY IF EXISTS "Admins can manage tokens" ON exam_access_tokens;
DROP POLICY IF EXISTS "Only admins can create tokens" ON exam_access_tokens;
DROP POLICY IF EXISTS "Only admins can view tokens" ON exam_access_tokens;

-- ================================================
-- 2. CREATE NEW POLICIES FOR exam_access_tokens
-- ================================================

-- CS/HCS/Dev can view all tokens
CREATE POLICY "Staff can view exam tokens"
  ON exam_access_tokens
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- CS/HCS/Dev can insert tokens
CREATE POLICY "Staff can insert exam tokens"
  ON exam_access_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- CS/HCS/Dev can delete tokens
CREATE POLICY "Staff can delete exam tokens"
  ON exam_access_tokens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- Users can view their own tokens (to validate)
CREATE POLICY "Users can view own tokens"
  ON exam_access_tokens
  FOR SELECT
  USING (user_id = auth.uid());

-- ================================================
-- 3. VERIFICATION QUERIES (Run manually to verify)
-- ================================================

-- Check exam_access_tokens RLS policies:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'exam_access_tokens';

-- Test token generation as CS user:
-- INSERT INTO exam_access_tokens (user_id, exam_type_id, created_by)
-- VALUES ('test-user-id', 1, auth.uid());

-- ================================================
-- NOTES FOR DEV:
-- ================================================

-- After running this migration:
-- 1. Test token generation as CS - should work
-- 2. Test token generation as HCS - should work
-- 3. Test token validation by trainee/deputy - should work
-- 4. Verify tokens list shows in /admin/tokens

-- ================================================
-- DONE!
-- ================================================
