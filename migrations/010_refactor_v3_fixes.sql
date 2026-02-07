-- ================================================
-- Migration 010: System Refactor v3 - Database Fixes
-- Date: 2026-02-07
--
-- Fixes required for new role hierarchy and features:
-- 1. Add "Pościgowe" to permission_type ENUM
-- 2. Add is_commander column to users table
-- 3. Drop old role CHECK CONSTRAINT
-- 4. Migrate old roles (admin/user) to new hierarchy (trainee/deputy/cs/hcs/dev)
-- 5. Add new role CHECK CONSTRAINT with updated values
-- 6. Update RLS policies for new role hierarchy
-- ================================================

-- ================================================
-- 1. ADD "Pościgowe" TO permission_type ENUM
-- ================================================

-- Check if 'Pościgowe' already exists in the ENUM
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'Pościgowe'
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'permission_type')
  ) THEN
    -- Add new value to the ENUM
    ALTER TYPE permission_type ADD VALUE 'Pościgowe';
    RAISE NOTICE 'Added "Pościgowe" to permission_type ENUM';
  ELSE
    RAISE NOTICE '"Pościgowe" already exists in permission_type ENUM';
  END IF;
END $$;

-- ================================================
-- 2. ADD is_commander COLUMN TO users TABLE
-- ================================================

-- Add is_commander column if it doesn't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_commander BOOLEAN DEFAULT false NOT NULL;

-- Add comment to column
COMMENT ON COLUMN users.is_commander IS 'Commander flag - automatically set to true when user reaches Captain III with assigned division';

-- Create index for faster queries on commanders
CREATE INDEX IF NOT EXISTS idx_users_is_commander ON users(is_commander) WHERE is_commander = true;

-- ================================================
-- 3. DROP OLD ROLE CHECK CONSTRAINT
-- ================================================

-- Drop old role check constraint to allow role migration
ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_role_check;

-- ================================================
-- 4. MIGRATE OLD ROLES TO NEW HIERARCHY
-- ================================================

-- Update DEV user to have 'dev' role in database (for consistency)
UPDATE users
SET role = 'dev'
WHERE id = '2ab9b7ad-a32f-4219-b1fd-3c0e79628d75';

-- Convert old 'admin' roles to 'cs' (default)
-- Note: You can manually change specific users to 'hcs' after migration if needed
UPDATE users
SET role = 'cs'
WHERE role = 'admin';

-- Convert old 'user' roles to 'trainee' (if any exist)
UPDATE users
SET role = 'trainee'
WHERE role = 'user' OR role IS NULL;

-- ================================================
-- 5. ADD NEW ROLE CHECK CONSTRAINT
-- ================================================

-- Add new role check constraint with new hierarchy
-- (After all roles have been migrated)
ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('trainee', 'deputy', 'cs', 'hcs', 'dev'));

-- Verification: Check all users have valid roles
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM users
  WHERE role NOT IN ('trainee', 'deputy', 'cs', 'hcs', 'dev');

  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % users with invalid roles. Please check manually.', invalid_count;
  ELSE
    RAISE NOTICE 'All users have valid roles in new hierarchy';
  END IF;
END $$;

-- ================================================
-- 6. UPDATE RLS POLICIES FOR NEW ROLE HIERARCHY
-- ================================================

-- Drop ALL old policies (both old and new names, in case of re-run)
DROP POLICY IF EXISTS "Admins can view all penalties" ON user_penalties;
DROP POLICY IF EXISTS "Admins can insert penalties" ON user_penalties;
DROP POLICY IF EXISTS "Admins can update penalties" ON user_penalties;
DROP POLICY IF EXISTS "Admins can manage notes" ON user_notes;

-- Drop new policies in case migration was partially run before
DROP POLICY IF EXISTS "Staff can view all penalties" ON user_penalties;
DROP POLICY IF EXISTS "Staff can insert penalties" ON user_penalties;
DROP POLICY IF EXISTS "Senior staff can update penalties" ON user_penalties;
DROP POLICY IF EXISTS "CS can delete plus minus" ON user_penalties;
DROP POLICY IF EXISTS "Senior staff can delete all penalties" ON user_penalties;
DROP POLICY IF EXISTS "Staff can manage notes" ON user_notes;
DROP POLICY IF EXISTS "CS can update trainee deputy" ON users;
DROP POLICY IF EXISTS "Senior staff can update users" ON users;

-- ================================================
-- NEW RLS POLICIES FOR user_penalties
-- ================================================

-- CS/HCS/Dev can view all penalties
CREATE POLICY "Staff can view all penalties"
  ON user_penalties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- CS/HCS/Dev can insert penalties
CREATE POLICY "Staff can insert penalties"
  ON user_penalties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- HCS/Dev can update penalties (CS cannot)
CREATE POLICY "Senior staff can update penalties"
  ON user_penalties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('hcs', 'dev')
    )
  );

-- CS can delete ONLY plus/minus penalties
CREATE POLICY "CS can delete plus minus"
  ON user_penalties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'cs'
    )
    AND type IN ('plus', 'minus')
  );

-- HCS/Dev can delete ALL penalties
CREATE POLICY "Senior staff can delete all penalties"
  ON user_penalties
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('hcs', 'dev')
    )
  );

-- ================================================
-- NEW RLS POLICIES FOR users TABLE
-- ================================================

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- CS can update ONLY trainee/deputy users (not cs/hcs/dev)
CREATE POLICY "CS can update trainee deputy"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid()
      AND u.role = 'cs'
    )
    AND role IN ('trainee', 'deputy')
  );

-- HCS/Dev can update ALL users (except DEV cannot update other DEV)
CREATE POLICY "Senior staff can update users"
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users AS u
      WHERE u.id = auth.uid()
      AND u.role IN ('hcs', 'dev')
    )
  );

-- ================================================
-- NEW RLS POLICIES FOR user_notes
-- ================================================

-- CS/HCS/Dev can manage notes
CREATE POLICY "Staff can manage notes"
  ON user_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('cs', 'hcs', 'dev')
    )
  );

-- ================================================
-- 7. VERIFICATION QUERIES (Run manually to verify)
-- ================================================

-- Check permission_type ENUM values:
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'permission_type')
-- ORDER BY enumsortorder;

-- Check is_commander column:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'is_commander';

-- Check RLS policies on user_penalties:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'user_penalties';

-- Check RLS policies on user_notes:
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'user_notes';

-- ================================================
-- NOTES FOR DEV:
-- ================================================

-- After running this migration:
-- 1. All users are migrated to new roles:
--    - DEV (2ab9b7ad...) → 'dev'
--    - Old 'admin' → 'cs' (you can manually change some to 'hcs' if needed)
--    - Old 'user'/NULL → 'trainee'
-- 2. Test permissions in Personnel page (CS should only manage Trainee/Deputy)
-- 3. Test Captain III auto-Commander logic (Captain III + Division → is_commander = true)
-- 4. Test new "Pościgowe" permission assignment

-- To manually promote CS users to HCS:
-- UPDATE users SET role = 'hcs' WHERE id = 'user_uuid_here';

-- ================================================
-- DONE!
-- ================================================
