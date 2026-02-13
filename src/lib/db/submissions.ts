import { supabase } from '@/src/supabaseClient';
import { dbQuery } from './queryWrapper';

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
export function createSubmission(data: SubmissionData) {
  return dbQuery(
    () => supabase
      .from('submissions')
      .insert(data)
      .select()
      .single(),
    'createSubmission'
  );
}

/**
 * Pobiera zgłoszenia użytkownika
 */
export function getUserSubmissions(userId: string) {
  return dbQuery(
    () => supabase
      .from('submissions')
      .select(`
        *,
        reviewed_by_user:users!submissions_reviewed_by_fkey(username, mta_nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    'getUserSubmissions'
  );
}

/**
 * Pobiera wszystkie zgłoszenia (CS+) z opcjonalnymi filtrami
 */
export async function getAllSubmissions(filters?: { type?: string; status?: string }) {
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

  return dbQuery(() => query, 'getAllSubmissions');
}

/**
 * Pobiera pojedyncze zgłoszenie
 */
export function getSubmissionById(id: string) {
  return dbQuery(
    () => supabase
      .from('submissions')
      .select(`
        *,
        user:users!submissions_user_id_fkey(username, mta_nick, avatar_url),
        reviewed_by_user:users!submissions_reviewed_by_fkey(username, mta_nick)
      `)
      .eq('id', id)
      .single(),
    'getSubmissionById'
  );
}

/**
 * Aktualizuje status zgłoszenia (approve/reject)
 */
export function updateSubmissionStatus(
  id: string,
  status: 'approved' | 'rejected',
  reviewedBy: string,
  adminResponse?: string
) {
  return dbQuery(
    () => supabase
      .from('submissions')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        admin_response: adminResponse || null,
      })
      .eq('id', id)
      .select()
      .single(),
    'updateSubmissionStatus'
  );
}

/**
 * Archiwizuje zgłoszenie (zachowuje oryginalny status w metadata)
 * NOTE: Complex multi-query logic — kept as manual try-catch
 */
export async function archiveSubmission(id: string) {
  try {
    console.log('🔍 Archive attempt for ID:', id);

    // Get current submission to preserve original status
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('status, metadata')
      .eq('id', id)
      .single();

    console.log('📥 Fetch result:', { submission, fetchError });

    if (fetchError) {
      console.error('❌ Fetch error:', JSON.stringify(fetchError, null, 2));
      throw fetchError;
    }
    if (!submission) throw new Error('Submission not found');

    // Save original status in metadata (handle null metadata)
    const updatedMetadata = {
      ...(submission.metadata || {}),
      original_status: submission.status,
    };

    console.log('📝 Updating with metadata:', updatedMetadata);

    // Update to archived
    const { data, error } = await supabase
      .from('submissions')
      .update({
        status: 'archived',
        metadata: updatedMetadata,
      })
      .eq('id', id)
      .select()
      .single();

    console.log('📤 Update result:', { data, error });

    if (error) {
      console.error('❌ Update error:', JSON.stringify(error, null, 2));
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('💥 archiveSubmission error:', error);
    console.error('💥 Error details:', JSON.stringify(error, null, 2));
    return { data: null, error };
  }
}
