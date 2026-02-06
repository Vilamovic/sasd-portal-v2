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
 * Pobiera użytkownika z bazy po username
 */
export async function getUserByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getUserByUsername error:', error);
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

// ============================================
// KARTOTEKA - USER MANAGEMENT
// ============================================

/**
 * Pobiera wszystkich użytkowników z pełnymi danymi (Kartoteka)
 */
export async function getAllUsersWithDetails() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllUsersWithDetails error:', error);
    return { data: null, error };
  }
}

/**
 * Pobiera użytkownika z pełnymi danymi (Kartoteka)
 * Alias dla getUserById (dla spójności nazewnictwa)
 */
export async function getUserWithDetails(userId) {
  return getUserById(userId);
}

/**
 * Aktualizuje badge (stopień) użytkownika
 */
export async function updateUserBadge(userId, badge) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ badge })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateUserBadge error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje dywizję użytkownika
 */
export async function updateUserDivision(userId, division) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ division })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateUserDivision error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje uprawnienia użytkownika
 */
export async function updateUserPermissions(userId, permissions) {
  try {
    const { data, error} = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateUserPermissions error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje status Commander użytkownika
 */
export async function updateIsCommander(userId, isCommander) {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_commander: isCommander })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateIsCommander error:', error);
    return { data: null, error };
  }
}

// ============================================
// KARTOTEKA - PENALTIES & REWARDS
// ============================================

/**
 * Dodaje karę/nagrodę/zawieszenie dla użytkownika
 */
export async function addPenalty(penaltyData) {
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
export async function getUserPenalties(userId) {
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
export async function getActivePenalties(userId) {
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
export async function deletePenalty(penaltyId) {
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

// ============================================
// KARTOTEKA - PRIVATE NOTES
// ============================================

/**
 * Dodaje prywatną notatkę o użytkowniku (Admin/Dev only)
 */
export async function addUserNote(noteData) {
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
export async function getUserNotes(userId) {
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
export async function deleteUserNote(noteId) {
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

// ============================================
// DIVISIONS - MATERIALS MANAGEMENT
// ============================================

/**
 * Pobiera materiały dla dywizji (używa RPC z kontrolą dostępu)
 */
export async function getDivisionMaterials(division) {
  try {
    const { data, error } = await supabase.rpc('get_division_materials', {
      p_division: division,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getDivisionMaterials error:', error);
    return { data: null, error };
  }
}

/**
 * Dodaje materiał do dywizji (Admin/Dev/Commander only)
 */
export async function addDivisionMaterial(materialData) {
  try {
    const { data, error } = await supabase
      .from('division_materials')
      .insert(materialData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addDivisionMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje materiał dywizji
 */
export async function updateDivisionMaterial(materialId, materialData) {
  try {
    const { data, error } = await supabase
      .from('division_materials')
      .update(materialData)
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateDivisionMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa materiał dywizji
 */
export async function deleteDivisionMaterial(materialId) {
  try {
    const { error } = await supabase
      .from('division_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteDivisionMaterial error:', error);
    return { error };
  }
}
