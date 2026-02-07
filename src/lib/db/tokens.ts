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
 * Pobiera wszystkie tokeny dla użytkownika
 */
export async function getUserExamTokens(userId: string) {
  try {
    const { data, error } = await supabase
      .from('exam_access_tokens')
      .select(`
        *,
        exam_types(name),
        created_by_user:users!exam_access_tokens_created_by_fkey(username, mta_nick)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserExamTokens error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera wszystkie tokeny (Admin/Dev only)
 */
export async function getAllExamTokens() {
  try {
    const { data, error } = await supabase
      .from('exam_access_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Load related data separately to avoid JOIN failures
    const enrichedData = await Promise.all(
      (data || []).map(async (token) => {
        // Get user data
        const { data: userData } = await supabase
          .from('users')
          .select('username, mta_nick, email')
          .eq('id', token.user_id)
          .single();

        // Get exam type
        const { data: examType } = await supabase
          .from('exam_types')
          .select('name')
          .eq('id', token.exam_type_id)
          .single();

        // Get created by user
        const { data: createdByUser } = await supabase
          .from('users')
          .select('username, mta_nick')
          .eq('id', token.created_by)
          .single();

        return {
          ...token,
          user_username: userData?.username || null,
          user_mta_nick: userData?.mta_nick || null,
          user_email: userData?.email || null,
          exam_type_name: examType?.name || 'Unknown',
          created_by_username: createdByUser?.username || null,
          created_by_mta_nick: createdByUser?.mta_nick || null,
        };
      })
    );

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

/**
 * Sprawdza czy użytkownik ma aktywny (nieużyty) token dla danego typu egzaminu
 */
export async function hasActiveTokenForExam(userId: string, examTypeId: number) {
  try {
    const { data, error } = await supabase
      .from('exam_access_tokens')
      .select('id, token, expires_at')
      .eq('user_id', userId)
      .eq('exam_type_id', examTypeId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return { data, error: null, hasToken: !!data };
  } catch (error) {
    console.error('hasActiveTokenForExam error:', error);
    return { data: null, error, hasToken: false };
  }
}
