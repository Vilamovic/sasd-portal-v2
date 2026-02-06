-- Migration 009: Create RPC function for active penalties with remaining time
-- This function calculates remaining seconds for active suspensions

-- DROP existing function if it exists
DROP FUNCTION IF EXISTS get_active_penalties(uuid);

-- CREATE RPC function to get active penalties with remaining_seconds
CREATE OR REPLACE FUNCTION get_active_penalties(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  created_by uuid,
  type penalty_type,
  description text,
  duration_hours integer,
  expires_at timestamptz,
  created_at timestamptz,
  remaining_seconds integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.id,
    up.user_id,
    up.created_by,
    up.type,
    up.description,
    up.duration_hours,
    up.expires_at,
    up.created_at,
    -- Calculate remaining seconds (server-side)
    CASE
      WHEN up.expires_at IS NOT NULL AND up.expires_at > NOW() THEN
        EXTRACT(EPOCH FROM (up.expires_at - NOW()))::integer
      ELSE
        0
    END AS remaining_seconds
  FROM user_penalties up
  WHERE up.user_id = p_user_id
    AND up.type IN ('zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe')
    AND up.expires_at IS NOT NULL
    AND up.expires_at > NOW()
  ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_active_penalties(uuid) TO authenticated;

-- Verification query (run manually to test):
-- SELECT * FROM get_active_penalties('c254fb57-72d4-450c-87b7-cd7ffad5b715');
