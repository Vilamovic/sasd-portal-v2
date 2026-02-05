-- ================================================
-- SASD Portal - Divisions Materials System
-- Adds: division_materials table with SWAT support
-- ================================================

-- 1. Extend division_type ENUM to include SWAT
-- Note: Cannot ALTER ENUM directly in PostgreSQL, need to handle carefully
-- If this fails, SWAT materials will use a separate approach

-- Create new division_or_swat type that includes SWAT
CREATE TYPE division_or_swat AS ENUM ('FTO', 'SS', 'DTU', 'GU', 'SWAT');

-- 2. Create division_materials table
CREATE TABLE IF NOT EXISTS division_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division division_or_swat NOT NULL,

  -- Material metadata
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT, -- 'pdf', 'image', 'video', 'link', etc.
  thumbnail_url TEXT,

  -- Organization
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_division_materials_division ON division_materials(division);
CREATE INDEX IF NOT EXISTS idx_division_materials_created_by ON division_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_division_materials_published ON division_materials(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_division_materials_order ON division_materials(division, order_index);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE division_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Everyone can view SWAT materials
CREATE POLICY "Everyone can view SWAT materials"
  ON division_materials
  FOR SELECT
  USING (division = 'SWAT');

-- RLS Policy: Users can view materials from their own division
CREATE POLICY "Users can view their division materials"
  ON division_materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.division::text = division_materials.division::text
    )
  );

-- RLS Policy: Admin/dev can view all materials
CREATE POLICY "Admins can view all division materials"
  ON division_materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- RLS Policy: Admin/dev can insert materials
CREATE POLICY "Admins can insert division materials"
  ON division_materials
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- RLS Policy: Admin/dev can update materials
CREATE POLICY "Admins can update division materials"
  ON division_materials
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- RLS Policy: Admin/dev can delete materials
CREATE POLICY "Admins can delete division materials"
  ON division_materials
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- 5. Add commander column to users table (for division commanders)
-- Commander can manage materials for their division
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_commander BOOLEAN DEFAULT false;

-- RLS Policy: Division commanders can manage their division's materials
CREATE POLICY "Commanders can manage their division materials"
  ON division_materials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_commander = true
      AND users.division::text = division_materials.division::text
    )
  );

-- 6. Create helper function to check division access
CREATE OR REPLACE FUNCTION check_division_access(p_user_id UUID, p_division TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  user_division TEXT;
  user_role TEXT;
  is_commander BOOLEAN;
BEGIN
  -- Get user data
  SELECT users.division::text, users.role, users.is_commander
  INTO user_division, user_role, is_commander
  FROM users
  WHERE users.id = p_user_id;

  -- SWAT is accessible to everyone
  IF p_division = 'SWAT' THEN
    RETURN true;
  END IF;

  -- Admin/dev have access to all divisions
  IF user_role IN ('admin', 'dev') THEN
    RETURN true;
  END IF;

  -- Commanders have access to their division
  IF is_commander AND user_division = p_division THEN
    RETURN true;
  END IF;

  -- Users have access to their own division
  IF user_division = p_division THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 7. Create function to get division materials with access check
CREATE OR REPLACE FUNCTION get_division_materials(p_division TEXT)
RETURNS TABLE (
  id UUID,
  division TEXT,
  title TEXT,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  thumbnail_url TEXT,
  order_index INTEGER,
  is_published BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  creator_username TEXT,
  creator_mta_nick TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check access
  IF NOT check_division_access(auth.uid(), p_division) THEN
    RAISE EXCEPTION 'Access denied to division %', p_division;
  END IF;

  RETURN QUERY
  SELECT
    dm.id,
    dm.division::text,
    dm.title,
    dm.description,
    dm.file_url,
    dm.file_type,
    dm.thumbnail_url,
    dm.order_index,
    dm.is_published,
    dm.created_by,
    dm.created_at,
    dm.updated_at,
    u.username,
    u.mta_nick
  FROM division_materials dm
  LEFT JOIN users u ON dm.created_by = u.id
  WHERE dm.division::text = p_division
    AND dm.is_published = true
  ORDER BY dm.order_index ASC, dm.created_at DESC;
END;
$$;

-- ================================================
-- DONE! Now you can use:
-- - division_materials: Materials for FTO, SS, DTU, GU, SWAT
-- - SWAT accessible to everyone
-- - Users can access their division materials
-- - Commanders can manage their division materials
-- - Admin/dev can manage all materials
-- ================================================
