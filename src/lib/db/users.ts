import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

// ============================================
// USERS - Database Operations
// ============================================

/**
 * Pobiera użytkownika z bazy po ID
 */
export function getUserById(userId: string) {
  return dbQuery(
    () => supabase.from('users').select('*').eq('id', userId).single(),
    'getUserById'
  );
}

/**
 * Pobiera użytkownika z bazy po username
 */
export function getUserByUsername(username: string) {
  return dbQuery(
    () => supabase.from('users').select('*').eq('username', username).single(),
    'getUserByUsername'
  );
}

/**
 * Upsert użytkownika do bazy
 */
export function upsertUser(userData: any) {
  return dbQuery(
    () => supabase.from('users').upsert(userData, { onConflict: 'id' }).select().single(),
    'upsertUser'
  );
}

/**
 * Usuwa użytkownika z bazy (z czyszczeniem FK dependencies)
 */
export async function deleteUser(userId: string) {
  try {
    // Clean up FK references that block user deletion
    await supabase.from('exam_access_tokens').delete().eq('created_by', userId);
    await supabase.from('user_penalties').delete().eq('user_id', userId);
    await supabase.from('user_notes').delete().eq('user_id', userId);

    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return { data: null, error: null };
  } catch (error) {
    console.error('deleteUser:', error);
    return { data: null, error };
  }
}

/**
 * Ustawia force logout timestamp dla pojedynczego użytkownika
 */
export function setForceLogoutForUser(userId: string) {
  const timestamp = new Date().toISOString();
  return dbMutate(
    () => supabase.from('users').update({ force_logout_after: timestamp }).eq('id', userId),
    'setForceLogoutForUser'
  );
}

/**
 * Ustawia force logout timestamp dla wielu użytkowników (role-based)
 * @param {string} scope - 'all' (dev only) | 'user' (admin can kick trainee/deputy)
 */
export async function setForceLogoutTimestamp(scope: 'all' | 'user') {
  const timestamp = new Date().toISOString();
  let query = supabase
    .from('users')
    .update({ force_logout_after: timestamp });

  if (scope === 'user') {
    query = query.in('role', ['trainee', 'deputy']);
  }
  // scope === 'all' → brak filtra (wszyscy oprócz dev - handled by RLS)

  return dbMutate(() => query, 'setForceLogoutTimestamp');
}

/**
 * Pobiera wszystkich użytkowników z pełnymi danymi (Kartoteka)
 */
export function getAllUsersWithDetails() {
  return dbQuery(
    () => supabase.from('users').select('*').order('created_at', { ascending: false }),
    'getAllUsersWithDetails'
  );
}

/**
 * Pobiera użytkownika z pełnymi danymi (Kartoteka)
 * Alias dla getUserById (dla spójności nazewnictwa)
 */
export async function getUserWithDetails(userId: string) {
  return getUserById(userId);
}

/**
 * Aktualizuje badge (stopień) użytkownika
 */
export function updateUserBadge(userId: string | null, badge: string | null) {
  return dbQuery(
    () => supabase.from('users').update({ badge }).eq('id', userId).select().single(),
    'updateUserBadge'
  );
}

/**
 * Aktualizuje dywizję użytkownika
 */
export function updateUserDivision(userId: string | null, division: string | null) {
  return dbQuery(
    () => supabase.from('users').update({ division }).eq('id', userId).select().single(),
    'updateUserDivision'
  );
}

/**
 * Aktualizuje uprawnienia użytkownika
 */
export function updateUserPermissions(userId: string | null, permissions: string[]) {
  return dbQuery(
    () => supabase.from('users').update({ permissions }).eq('id', userId).select().single(),
    'updateUserPermissions'
  );
}

/**
 * Aktualizuje status Commander użytkownika
 */
export function updateIsCommander(userId: string | null, isCommander: boolean) {
  return dbQuery(
    () => supabase.from('users').update({ is_commander: isCommander }).eq('id', userId).select().single(),
    'updateIsCommander'
  );
}

export function updateIsSwatOperator(userId: string, isSwatOperator: boolean) {
  return dbQuery(
    () => supabase.from('users').update({ is_swat_operator: isSwatOperator }).eq('id', userId).select().single(),
    'updateIsSwatOperator'
  );
}

// Complex multi-query function (removes existing commander first) — kept with manual try-catch
export async function updateIsSwatCommander(userId: string, isSwatCommander: boolean) {
  try {
    // If setting to true, first remove from any existing SWAT Commander (max 1)
    if (isSwatCommander) {
      await supabase
        .from('users')
        .update({ is_swat_commander: false })
        .eq('is_swat_commander', true);
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_swat_commander: isSwatCommander })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateIsSwatCommander:', error);
    return { data: null, error };
  }
}
