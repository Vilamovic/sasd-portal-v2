import { supabase } from '@/src/supabaseClient';

// ============================================
// TRAINING GROUPS
// ============================================

export async function getTrainingGroups() {
  try {
    const { data, error } = await supabase
      .from('fto_training_groups')
      .select(`
        *,
        fto1:users!fto_training_groups_fto1_id_fkey(id, username, mta_nick),
        fto2:users!fto_training_groups_fto2_id_fkey(id, username, mta_nick),
        members:fto_group_members(
          id,
          user_id,
          user:users!fto_group_members_user_id_fkey(id, username, mta_nick, badge, plus_count, minus_count)
        )
      `)
      .order('name');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getTrainingGroups error:', error);
    return { data: null, error };
  }
}

export async function createTrainingGroup(data: {
  name: string;
  fto1_id?: string | null;
  fto2_id?: string | null;
  created_by?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('fto_training_groups')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('createTrainingGroup error:', error);
    return { data: null, error };
  }
}

export async function updateTrainingGroup(id: string, updates: {
  name?: string;
  fto1_id?: string | null;
  fto2_id?: string | null;
}) {
  try {
    const { data, error } = await supabase
      .from('fto_training_groups')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateTrainingGroup error:', error);
    return { data: null, error };
  }
}

export async function deleteTrainingGroup(id: string) {
  try {
    const { error } = await supabase
      .from('fto_training_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteTrainingGroup error:', error);
    return { error };
  }
}

// ============================================
// GROUP MEMBERS
// ============================================

export async function addGroupMember(groupId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('fto_group_members')
      .insert({ group_id: groupId, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addGroupMember error:', error);
    return { data: null, error };
  }
}

export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('fto_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('removeGroupMember error:', error);
    return { error };
  }
}

// ============================================
// ATTENDANCE
// ============================================

export async function getAttendanceByDate(groupId: string, date: string) {
  try {
    const { data, error } = await supabase
      .from('fto_attendance')
      .select('*')
      .eq('group_id', groupId)
      .eq('date', date);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAttendanceByDate error:', error);
    return { data: null, error };
  }
}

export async function getAttendanceRange(groupId: string, startDate: string, endDate: string) {
  try {
    const { data, error } = await supabase
      .from('fto_attendance')
      .select('*')
      .eq('group_id', groupId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAttendanceRange error:', error);
    return { data: null, error };
  }
}

export async function upsertAttendance(data: {
  group_id: string;
  user_id: string;
  date: string;
  status: 'OB' | 'NB' | 'U';
  marked_by?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('fto_attendance')
      .upsert(
        { ...data, updated_at: new Date().toISOString() },
        { onConflict: 'group_id,user_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('upsertAttendance error:', error);
    return { data: null, error };
  }
}

// ============================================
// TRAINEES LIST (for member picker)
// ============================================

export async function getTrainees() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, mta_nick, role')
      .in('role', ['trainee', 'deputy'])
      .order('username');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getTrainees error:', error);
    return { data: null, error };
  }
}

export async function getFTOMembers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, mta_nick')
      .eq('division', 'FTO')
      .order('username');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getFTOMembers error:', error);
    return { data: null, error };
  }
}
