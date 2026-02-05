-- ================================================
-- SASD Portal - Kartoteka System Migration
-- Adds: divisions, permissions, penalties, notes
-- ================================================

-- 1. Create ENUM types for divisions and permissions
CREATE TYPE division_type AS ENUM ('FTO', 'SS', 'DTU', 'GU');

CREATE TYPE permission_type AS ENUM ('SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch');

CREATE TYPE penalty_type AS ENUM (
  'plus',
  'minus',
  'zawieszenie_sluzba',
  'zawieszenie_dywizja',
  'zawieszenie_uprawnienia',
  'upomnienie_pisemne'
);

CREATE TYPE rank_type AS ENUM (
  'Trainee',
  'Deputy Sheriff I',
  'Deputy Sheriff II',
  'Deputy Sheriff III',
  'Senior Deputy Sheriff',
  'Sergeant I',
  'Sergeant II',
  'Detective I',
  'Detective II',
  'Detective III',
  'Lieutenant',
  'Captain I',
  'Captain II',
  'Captain III',
  'Area Commander',
  'Division Chief',
  'Assistant Sheriff',
  'Undersheriff',
  'Sheriff'
);

-- 2. Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS division division_type;
ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions permission_type[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS plus_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS minus_count INTEGER DEFAULT 0;

-- Update badge column to use rank_type (if not already)
-- Note: This will fail if badge column has values not in the ENUM
-- Run this manually after cleaning data if needed
-- ALTER TABLE users ALTER COLUMN badge TYPE rank_type USING badge::rank_type;

-- 3. Create user_penalties table
CREATE TABLE IF NOT EXISTS user_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type penalty_type NOT NULL,
  description TEXT NOT NULL,
  evidence_link TEXT,

  -- For time-based penalties (zawieszenia)
  duration_hours INTEGER,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,

  -- Visibility control (upomnienia pisemne are hidden from user)
  visible_to_user BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_penalties_user_id ON user_penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_user_penalties_type ON user_penalties(type);
CREATE INDEX IF NOT EXISTS idx_user_penalties_active ON user_penalties(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_penalties_expires_at ON user_penalties(expires_at) WHERE expires_at IS NOT NULL;

-- 4. Create user_notes table (private notes for admin/dev only)
CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);

-- 5. Create function to auto-expire penalties
CREATE OR REPLACE FUNCTION expire_penalties()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE user_penalties
  SET is_active = false
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at <= NOW();
END;
$$;

-- 6. Create function to update plus/minus counts
CREATE OR REPLACE FUNCTION update_user_penalty_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update plus_count and minus_count for the user
  IF NEW.type = 'plus' THEN
    UPDATE users
    SET plus_count = (
      SELECT COUNT(*)
      FROM user_penalties
      WHERE user_id = NEW.user_id AND type = 'plus'
    )
    WHERE id = NEW.user_id;
  ELSIF NEW.type = 'minus' THEN
    UPDATE users
    SET minus_count = (
      SELECT COUNT(*)
      FROM user_penalties
      WHERE user_id = NEW.user_id AND type = 'minus'
    )
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Create trigger to auto-update counts
DROP TRIGGER IF EXISTS trigger_update_penalty_counts ON user_penalties;
CREATE TRIGGER trigger_update_penalty_counts
  AFTER INSERT OR DELETE ON user_penalties
  FOR EACH ROW
  EXECUTE FUNCTION update_user_penalty_counts();

-- 8. Enable Row Level Security (RLS)
ALTER TABLE user_penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_penalties
-- Users can see their own penalties (except upomnienia_pisemne)
CREATE POLICY "Users can view their own penalties"
  ON user_penalties
  FOR SELECT
  USING (
    user_id = auth.uid() AND visible_to_user = true
  );

-- Admin/dev can see all penalties
CREATE POLICY "Admins can view all penalties"
  ON user_penalties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- Admin/dev can insert penalties
CREATE POLICY "Admins can insert penalties"
  ON user_penalties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- Admin/dev can update penalties
CREATE POLICY "Admins can update penalties"
  ON user_penalties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- RLS Policies for user_notes (admin/dev only)
CREATE POLICY "Admins can manage notes"
  ON user_notes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- 9. Create helper function to get active penalties for user
CREATE OR REPLACE FUNCTION get_active_penalties(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type penalty_type,
  description TEXT,
  evidence_link TEXT,
  duration_hours INTEGER,
  expires_at TIMESTAMPTZ,
  remaining_seconds BIGINT,
  created_by UUID,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.type,
    p.description,
    p.evidence_link,
    p.duration_hours,
    p.expires_at,
    CASE
      WHEN p.expires_at IS NOT NULL
      THEN EXTRACT(EPOCH FROM (p.expires_at - NOW()))::BIGINT
      ELSE NULL
    END as remaining_seconds,
    p.created_by,
    p.created_at
  FROM user_penalties p
  WHERE p.user_id = p_user_id
    AND p.is_active = true
    AND p.visible_to_user = true
    AND p.type IN ('zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia')
  ORDER BY p.expires_at ASC;
END;
$$;

-- ================================================
-- DONE! Now you can use:
-- - division: FTO, SS, DTU, GU
-- - permissions: array of SWAT, SEU, AIR, Press Desk, Dispatch
-- - plus_count, minus_count: auto-updated counters
-- - user_penalties: plus/minus/kary z timerami
-- - user_notes: private notes for admins
-- ================================================
