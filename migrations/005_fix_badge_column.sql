-- Migration 005: Fix badge column type and set default
-- Changes badge column from TEXT to rank_type ENUM with default 'Trainee'

-- 1. Update all NULL badges to 'Trainee' (everyone starts as Trainee)
UPDATE users
SET badge = 'Trainee'
WHERE badge IS NULL;

-- 2. Change badge column type to rank_type ENUM
ALTER TABLE users
ALTER COLUMN badge TYPE rank_type
USING badge::rank_type;

-- 3. Set default value to 'Trainee' for new users
ALTER TABLE users
ALTER COLUMN badge SET DEFAULT 'Trainee'::rank_type;

-- 4. Make badge NOT NULL (everyone must have a rank)
ALTER TABLE users
ALTER COLUMN badge SET NOT NULL;

-- 5. Add comment to column
COMMENT ON COLUMN users.badge IS 'User rank using rank_type ENUM (19 levels from Trainee to Sheriff). Default: Trainee';

-- Verification queries (run manually to verify):
-- Check column structure:
-- SELECT column_name, data_type, udt_name, column_default, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'badge';

-- Check all users have badges now:
-- SELECT username, badge FROM users ORDER BY badge;
