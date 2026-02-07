import { supabase } from '@/src/supabaseClient';

// ============================================
// USER NOTES - Private Admin Notes
// ============================================

/**
 * Dodaje prywatną notatkę o użytkowniku (Admin/Dev only)
 */
export async function addUserNote(noteData: any) {
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .insert(noteData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addUserNote error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera wszystkie notatki o użytkowniku (Admin/Dev only)
 */
export async function getUserNotes(userId: string | null) {
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select(`
        *,
        created_by_user:users!user_notes_created_by_fkey(username, mta_nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false});

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserNotes error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa notatkę (Admin/Dev only)
 */
export async function deleteUserNote(noteId: number | string) {
  try {
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteUserNote error:', error);
    return { error };
  }
}

/**
 * Czyści wszystkie notatki użytkownika (Dev only)
 */
export async function clearUserNotes(userId: string | null) {
  try {
    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('clearUserNotes error:', error);
    return { error };
  }
}
