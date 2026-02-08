import { supabase } from '@/src/supabaseClient';

// ============================================
// EXAM ACCESS TOKENS - One-Time Access
// ============================================

/**
 * Tworzy nowy token dostępu do egzaminu (Admin/Dev only)
 */
export async function createExamAccessToken(
  userId: string,
  examTypeId: number,
  createdBy: string,
  expiresInDays: number = 7
) {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Generate unique token (UUID v4)
    const token = crypto.randomUUID();

    const { data, error } = await supabase
      .from('exam_access_tokens')
      .insert({
        token: token,
        user_id: userId,
        exam_type_id: examTypeId,
        created_by: createdBy,
        used: false,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createExamAccessToken error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera wszystkie tokeny (Admin/Dev only) - single query with JOINs
 */
export async function getAllExamTokens() {
  try {
    const { data, error } = await supabase
      .from('exam_access_tokens')
      .select(`
        *,
        users!exam_access_tokens_user_id_fkey(username, mta_nick, email),
        exam_types(name),
        created_by_user:users!exam_access_tokens_created_by_fkey(username, mta_nick)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map joined data to flat format expected by consumers
    const enrichedData = (data || []).map((token: any) => ({
      ...token,
      user_username: token.users?.username || null,
      user_mta_nick: token.users?.mta_nick || null,
      user_email: token.users?.email || null,
      exam_type_name: token.exam_types?.name || 'Unknown',
      created_by_username: token.created_by_user?.username || null,
      created_by_mta_nick: token.created_by_user?.mta_nick || null,
    }));

    return { data: enrichedData, error: null };
  } catch (error) {
    console.error('getAllExamTokens error:', error);
    return { data: null, error };
  }
}

/**
 * Weryfikuje i konsumuje token (RPC)
 */
export async function verifyAndConsumeExamToken(
  token: string,
  userId: string,
  examTypeId: number
) {
  try {
    const { data, error } = await supabase.rpc('verify_and_consume_exam_token', {
      p_token: token,
      p_user_id: userId,
      p_exam_type_id: examTypeId,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('verifyAndConsumeExamToken error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa token (Admin/Dev only)
 */
export async function deleteExamAccessToken(tokenId: number) {
  try {
    const { error } = await supabase
      .from('exam_access_tokens')
      .delete()
      .eq('id', tokenId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteExamAccessToken error:', error);
    return { error };
  }
}

