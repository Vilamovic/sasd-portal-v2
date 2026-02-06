-- Migration 007: Add DELETE policies for DEV/Admin users
-- Allows DEV and Admin to delete penalties and notes

-- DELETE policy for user_penalties (DEV and Admin can delete any penalty)
CREATE POLICY "Dev and admin can delete penalties"
  ON user_penalties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('dev', 'admin')
    )
  );

-- DELETE policy for user_notes (DEV and Admin can delete any note)
CREATE POLICY "Dev and admin can delete notes"
  ON user_notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('dev', 'admin')
    )
  );

-- Verification queries (run manually to verify):
-- Check policies for user_penalties:
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'user_penalties';

-- Check policies for user_notes:
-- SELECT schemaname, tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename = 'user_notes';
