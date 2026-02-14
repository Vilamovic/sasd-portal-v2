-- ============================================
-- FIX: Users table RLS policies for CS/HCS/DEV
-- Problem: CS/HCS nie mogą edytować stopni, dywizji, uprawnień innych użytkowników
-- ============================================

-- 1. UPDATE policy - CS/HCS/DEV mogą aktualizować dowolnego użytkownika
DROP POLICY IF EXISTS "CS+ can update any user" ON users;
CREATE POLICY "CS+ can update any user" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- 2. Upewniamy się, że użytkownik może aktualizować swój własny rekord
-- (np. force_logout_after, last_login, etc.)
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. DELETE policy - CS/HCS/DEV mogą usuwać użytkowników
DROP POLICY IF EXISTS "CS+ can delete users" ON users;
CREATE POLICY "CS+ can delete users" ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- ============================================
-- FIX: Related tables - CS/HCS/DEV need DELETE access for cleanup operations
-- (deleteUser function cleans up FK dependencies)
-- ============================================

-- user_penalties: CS/HCS/DEV mogą usuwać
DROP POLICY IF EXISTS "CS+ can delete penalties" ON user_penalties;
CREATE POLICY "CS+ can delete penalties" ON user_penalties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- user_penalties: CS/HCS/DEV mogą dodawać
DROP POLICY IF EXISTS "CS+ can insert penalties" ON user_penalties;
CREATE POLICY "CS+ can insert penalties" ON user_penalties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- user_notes: CS/HCS/DEV mogą usuwać
DROP POLICY IF EXISTS "CS+ can delete notes" ON user_notes;
CREATE POLICY "CS+ can delete notes" ON user_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- user_notes: CS/HCS/DEV mogą dodawać
DROP POLICY IF EXISTS "CS+ can insert notes" ON user_notes;
CREATE POLICY "CS+ can insert notes" ON user_notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- submissions: CS/HCS/DEV mogą aktualizować (reviewed_by) i usuwać
DROP POLICY IF EXISTS "CS+ can update submissions" ON submissions;
CREATE POLICY "CS+ can update submissions" ON submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

DROP POLICY IF EXISTS "CS+ can delete submissions" ON submissions;
CREATE POLICY "CS+ can delete submissions" ON submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('cs', 'hcs', 'dev')
    )
  );

-- ============================================
-- VERIFY: Run this to check current policies
-- SELECT * FROM pg_policies WHERE tablename = 'users';
-- ============================================
