import { supabase } from '@/src/supabaseClient';

// ============================================
// GANGS - Gang Profiles Management (GU)
// ============================================

/**
 * Pobiera wszystkie profile gangów
 */
export async function getGangProfiles() {
  try {
    const { data, error } = await supabase
      .from('gang_profiles')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getGangProfiles error:', error);
    return { data: null, error };
  }
}

/**
 * Dodaje profil gangu
 */
export async function addGangProfile(profileData: {
  title: string;
  description?: string;
  order_index?: number;
  created_by?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('gang_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addGangProfile error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje profil gangu
 */
export async function updateGangProfile(profileId: string, data: {
  title?: string;
  description?: string;
  order_index?: number;
}) {
  try {
    const { data: result, error } = await supabase
      .from('gang_profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('updateGangProfile error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa profil gangu
 */
export async function deleteGangProfile(profileId: string) {
  try {
    const { error } = await supabase
      .from('gang_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteGangProfile error:', error);
    return { error };
  }
}
