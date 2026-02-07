import { supabase } from '@/src/supabaseClient';

// ============================================
// PENALTIES - User Penalties & Rewards
// ============================================

/**
 * Dodaje karę/nagrodę/zawieszenie dla użytkownika
 */
export async function addPenalty(penaltyData: any) {
  try {
    const { data, error } = await supabase
      .from('user_penalties')
      .insert(penaltyData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addPenalty error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera wszystkie kary użytkownika (historia)
 */
export async function getUserPenalties(userId: string | null) {
  try {
    const { data, error } = await supabase
      .from('user_penalties')
      .select(`
        *,
        created_by_user:users!user_penalties_created_by_fkey(username, mta_nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserPenalties error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera aktywne kary użytkownika (RPC function)
 */
export async function getActivePenalties(userId: string | null) {
  try {
    const { data, error } = await supabase.rpc('get_active_penalties', {
      p_user_id: userId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getActivePenalties error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa karę (Admin/Dev only)
 */
export async function deletePenalty(penaltyId: number | string) {
  try {
    const { error } = await supabase
      .from('user_penalties')
      .delete()
      .eq('id', penaltyId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deletePenalty error:', error);
    return { error };
  }
}

/**
 * Czyści wszystkie PLUS/MINUS użytkownika (Dev only)
 */
export async function clearUserPlusMinusPenalties(userId: string | null) {
  try {
    // Delete all PLUS/MINUS penalties
    const { error: deleteError } = await supabase
      .from('user_penalties')
      .delete()
      .eq('user_id', userId)
      .in('type', ['plus', 'minus']);

    if (deleteError) throw deleteError;

    // Reset plus_count and minus_count to 0
    const { error: updateError } = await supabase
      .from('users')
      .update({ plus_count: 0, minus_count: 0 })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { error: null };
  } catch (error) {
    console.error('clearUserPlusMinusPenalties error:', error);
    return { error };
  }
}

/**
 * Czyści wszystkie zawieszenia użytkownika (Dev only)
 */
export async function clearUserSuspensions(userId: string | null) {
  try {
    const { error } = await supabase
      .from('user_penalties')
      .delete()
      .eq('user_id', userId)
      .in('type', ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe']);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('clearUserSuspensions error:', error);
    return { error };
  }
}

/**
 * Czyści wszystkie upomnienia pisemne użytkownika (Dev only)
 */
export async function clearUserWrittenWarnings(userId: string | null) {
  try {
    const { error } = await supabase
      .from('user_penalties')
      .delete()
      .eq('user_id', userId)
      .eq('type', 'upomnienie_pisemne');

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('clearUserWrittenWarnings error:', error);
    return { error };
  }
}
