import { supabase } from '@/src/supabaseClient';

// ============================================
// USERS - Database Operations
// ============================================

/**
 * Pobiera użytkownika z bazy po ID
 */
export async function getUserById(userId: string) {
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
export async function getUserByUsername(username: string) {
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
export async function upsertUser(userData: any) {
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
export async function updateMtaNick(userId: string, mtaNick: string) {
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
 * Aktualizuje rolę użytkownika (RPC)
 */
export async function updateUserRole(userId: string, role: string) {
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
export async function deleteUser(userId: string) {
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
export async function setForceLogoutForUser(userId: string) {
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
export async function setForceLogoutTimestamp(scope: 'all' | 'user') {
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
export async function getUserWithDetails(userId: string) {
  return getUserById(userId);
}

/**
 * Aktualizuje badge (stopień) użytkownika
 */
export async function updateUserBadge(userId: string | null, badge: string | null) {
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
export async function updateUserDivision(userId: string | null, division: string | null) {
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
export async function updateUserPermissions(userId: string | null, permissions: string[]) {
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
export async function updateIsCommander(userId: string | null, isCommander: boolean) {
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
