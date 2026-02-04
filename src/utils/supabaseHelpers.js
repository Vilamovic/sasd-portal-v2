import { supabase } from '@/src/supabaseClient';

// ============================================
// USERS
// ============================================

/**
 * Pobiera użytkownika z bazy po ID
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserById error:', error);
    return { data: null, error };
  }
}

/**
 * Upsert użytkownika do bazy
 */
export async function upsertUser(userData) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('upsertUser error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje MTA nick użytkownika
 */
export async function updateMtaNick(userId, mtaNick) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ mta_nick: mtaNick })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateMtaNick error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje rolę użytkownika
 */
export async function updateUserRole(userId, role) {
  try {
    const { data, error } = await supabase.rpc('update_user_role', {
      target_user_id: userId,
      new_role: role,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateUserRole error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa użytkownika z bazy
 */
export async function deleteUser(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteUser error:', error);
    return { error };
  }
}

/**
 * Ustawia force logout timestamp dla pojedynczego użytkownika
 */
export async function setForceLogoutForUser(userId) {
  try {
    const timestamp = new Date().toISOString();
    const { error } = await supabase
      .from('users')
      .update({ force_logout_after: timestamp })
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('setForceLogoutForUser error:', error);
    return { error };
  }
}

/**
 * Ustawia force logout timestamp dla wielu użytkowników (role-based)
 * @param {string} scope - 'all' (dev only) | 'user' (admin can kick users)
 */
export async function setForceLogoutTimestamp(scope) {
  try {
    const timestamp = new Date().toISOString();
    let query = supabase
      .from('users')
      .update({ force_logout_after: timestamp });

    if (scope === 'user') {
      query = query.eq('role', 'user');
    }
    // scope === 'all' → brak filtra (wszyscy oprócz dev - handled by RLS)

    const { error } = await query;
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('setForceLogoutTimestamp error:', error);
    return { error };
  }
}

// ============================================
// EXAM TYPES
// ============================================

/**
 * Pobiera wszystkie typy egzaminów
 */
export async function getAllExamTypes() {
  try {
    const { data, error } = await supabase
      .from('exam_types')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllExamTypes error:', error);
    return { data: null, error };
  }
}

// ============================================
// EXAM QUESTIONS
// ============================================

/**
 * Pobiera pytania dla danego typu egzaminu
 */
export async function getQuestionsByExamType(examTypeId) {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_type_id', examTypeId)
      .order('id', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getQuestionsByExamType error:', error);
    return { data: null, error };
  }
}

/**
 * Dodaje nowe pytanie egzaminacyjne
 */
export async function addExamQuestion(questionData) {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .insert(questionData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addExamQuestion error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje pytanie egzaminacyjne
 */
export async function updateExamQuestion(questionId, questionData) {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateExamQuestion error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa pytanie egzaminacyjne
 */
export async function deleteExamQuestion(questionId) {
  try {
    const { error } = await supabase
      .from('exam_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteExamQuestion error:', error);
    return { error };
  }
}

// ============================================
// EXAM RESULTS
// ============================================

/**
 * Pobiera wszystkie wyniki egzaminów
 */
export async function getAllExamResults() {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exam_types (name),
        users (username, mta_nick, badge)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllExamResults error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera niezarchiwizowane wyniki egzaminów
 */
export async function getAllExamResultsNonArchived() {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exam_types (name),
        users (username, mta_nick, badge)
      `)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllExamResultsNonArchived error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera zarchiwizowane wyniki egzaminów
 */
export async function getAllExamResultsArchived() {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .select(`
        *,
        exam_types (name),
        users (username, mta_nick, badge)
      `)
      .eq('is_archived', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllExamResultsArchived error:', error);
    return { data: null, error };
  }
}

/**
 * Zapisuje wynik egzaminu
 */
export async function saveExamResult(resultData) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .insert({
        ...resultData,
        is_archived: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('saveExamResult error:', error);
    return { data: null, error };
  }
}

/**
 * Archiwizuje wynik egzaminu
 */
export async function archiveExamResult(examId) {
  try {
    const { data, error } = await supabase
      .from('exam_results')
      .update({ is_archived: true })
      .eq('exam_id', examId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('archiveExamResult error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa wynik egzaminu (trwale)
 */
export async function deleteExamResult(examId) {
  try {
    const { error } = await supabase
      .from('exam_results')
      .delete()
      .eq('exam_id', examId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteExamResult error:', error);
    return { error };
  }
}

// ============================================
// MATERIALS
// ============================================

/**
 * Pobiera wszystkie materiały szkoleniowe
 */
export async function getAllMaterials() {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllMaterials error:', error);
    return { data: null, error };
  }
}

/**
 * Upsert materiału
 */
export async function upsertMaterial(materialData) {
  try {
    const { data, error } = await supabase
      .from('materials')
      .upsert(materialData, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('upsertMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa materiał
 */
export async function deleteMaterialFromDb(materialId) {
  try {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteMaterialFromDb error:', error);
    return { error };
  }
}

// ============================================
// EXAM ACCESS TOKENS (One-Time Access)
// ============================================

/**
 * Tworzy nowy token dostępu do egzaminu (Admin/Dev only)
 */
export async function createExamAccessToken(userId, examTypeId, createdBy, expiresInDays = 7) {
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
export async function getUserExamTokens(userId) {
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
      .select(`
        *,
        users(username, mta_nick, email),
        exam_types(name),
        created_by_user:users!exam_access_tokens_created_by_fkey(username, mta_nick)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten nested objects for easier access in UI
    const flattenedData = data?.map(token => ({
      ...token,
      user_username: token.users?.username || null,
      user_mta_nick: token.users?.mta_nick || null,
      user_email: token.users?.email || null,
      exam_type_name: token.exam_types?.name || null,
      created_by_username: token.created_by_user?.username || null,
      created_by_mta_nick: token.created_by_user?.mta_nick || null,
    }));

    return { data: flattenedData, error: null };
  } catch (error) {
    console.error('getAllExamTokens error:', error);
    return { data: null, error };
  }
}

/**
 * Weryfikuje i konsumuje token (RPC)
 */
export async function verifyAndConsumeExamToken(token, userId, examTypeId) {
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
export async function deleteExamAccessToken(tokenId) {
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
export async function hasActiveTokenForExam(userId, examTypeId) {
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
