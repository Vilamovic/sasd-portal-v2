-- Migration 008: Add UPDATE policy for DEV/Admin to update user badges
-- Allows DEV and Admin to promote/demote users

-- DROP existing restrictive policy if exists
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Allow users to update their own basic profile
CREATE POLICY "Users can update own basic profile"
  ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow DEV and Admin to update any user's badge, division, permissions, etc.
CREATE POLICY "Dev and admin can update all users"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('dev', 'admin')
    )
  );

-- Verification query (run manually to verify):
-- SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'users' AND cmd = 'UPDATE';
