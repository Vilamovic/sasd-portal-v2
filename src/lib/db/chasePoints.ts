import { supabase } from '@/src/supabaseClient';

// ============================================
// CHASE POINTS CRUD
// ============================================

/**
 * Get all chase points with target user info, grouped for summary
 */
export async function getAllChasePoints() {
  try {
    const { data, error } = await supabase
      .from('ss_chase_points')
      .select(`
        *,
        target:users!ss_chase_points_target_user_id_fkey(id, username, mta_nick, badge),
        giver:users!ss_chase_points_given_by_fkey(id, username, mta_nick)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllChasePoints error:', error);
    return { data: null, error };
  }
}

/**
 * Get chase points for a specific user
 */
export async function getPointsForUser(userId: string) {
  try {
    const { data, error } = await supabase
      .from('ss_chase_points')
      .select(`
        *,
        giver:users!ss_chase_points_given_by_fkey(id, username, mta_nick)
      `)
      .eq('target_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getPointsForUser error:', error);
    return { data: null, error };
  }
}

/**
 * Add chase points to a user
 */
export async function addChasePoints(data: {
  target_user_id: string;
  points: number;
  reason: string;
  evidence_url?: string | null;
  given_by: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('ss_chase_points')
      .insert({
        target_user_id: data.target_user_id,
        points: data.points,
        reason: data.reason,
        evidence_url: data.evidence_url || null,
        given_by: data.given_by,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('addChasePoints error:', error);
    return { data: null, error };
  }
}

/**
 * Delete a chase point entry (CS+ only)
 */
export async function deleteChasePoint(id: string) {
  try {
    const { error } = await supabase
      .from('ss_chase_points')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteChasePoint error:', error);
    return { error };
  }
}

/**
 * Get all deputies (for user picker in add form)
 */
export async function getAllDeputies() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, mta_nick, badge, role')
      .in('role', ['trainee', 'deputy', 'cs', 'hcs'])
      .order('username');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllDeputies error:', error);
    return { data: null, error };
  }
}
