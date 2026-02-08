import { supabase } from '@/src/supabaseClient';

// ============================================
// SUBMISSIONS - Zgłoszenia System
// ============================================

export interface SubmissionData {
  user_id: string;
  type: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Tworzy nowe zgłoszenie
 */
export async function createSubmission(data: SubmissionData) {
  try {
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: submission, error: null };
  } catch (error) {
    console.error('createSubmission error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera zgłoszenia użytkownika
 */
export async function getUserSubmissions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        reviewed_by_user:users!submissions_reviewed_by_fkey(username, mta_nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserSubmissions error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera wszystkie zgłoszenia (CS+) z opcjonalnymi filtrami
 */
export async function getAllSubmissions(filters?: { type?: string; status?: string }) {
  try {
    let query = supabase
      .from('submissions')
      .select(`
        *,
        user:users!submissions_user_id_fkey(username, mta_nick, avatar_url),
        reviewed_by_user:users!submissions_reviewed_by_fkey(username, mta_nick)
      `)
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllSubmissions error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera pojedyncze zgłoszenie
 */
export async function getSubmissionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        user:users!submissions_user_id_fkey(username, mta_nick, avatar_url),
        reviewed_by_user:users!submissions_reviewed_by_fkey(username, mta_nick)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getSubmissionById error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje status zgłoszenia (approve/reject)
 */
export async function updateSubmissionStatus(
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  adminResponse?: string
) {
  try {
    const { data, error } = await supabase
      .from('submissions')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        admin_response: adminResponse || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateSubmissionStatus error:', error);
    return { data: null, error };
  }
}
