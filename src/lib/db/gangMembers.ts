import { supabase } from '@/src/supabaseClient';

// ============================================
// GANG MEMBERS
// ============================================

export async function getGangMembers(gangId?: string) {
  try {
    let query = supabase
      .from('gang_members')
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `)
      .order('last_name');

    if (gangId) {
      query = query.eq('gang_id', gangId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getGangMembers error:', error);
    return { data: null, error };
  }
}

export async function getGangMember(id: string) {
  try {
    const { data, error } = await supabase
      .from('gang_members')
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title),
        reports:gang_member_reports(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getGangMember error:', error);
    return { data: null, error };
  }
}

export async function searchGangMembers(query: string) {
  try {
    const terms = query.trim().split(/\s+/);
    let dbQuery = supabase
      .from('gang_members')
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `);

    if (terms.length >= 2) {
      // Search both name orders
      const [a, b] = terms;
      dbQuery = dbQuery.or(
        `first_name.ilike.%${a}%,last_name.ilike.%${a}%,alias.ilike.%${a}%,` +
        `first_name.ilike.%${b}%,last_name.ilike.%${b}%,alias.ilike.%${b}%`
      );
    } else {
      const term = terms[0];
      dbQuery = dbQuery.or(
        `first_name.ilike.%${term}%,last_name.ilike.%${term}%,alias.ilike.%${term}%`
      );
    }

    const { data, error } = await dbQuery.order('last_name').limit(50);
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('searchGangMembers error:', error);
    return { data: null, error };
  }
}

export async function createGangMember(data: {
  gang_id: string;
  first_name: string;
  last_name: string;
  alias?: string | null;
  dob?: string | null;
  gender?: string | null;
  race?: string | null;
  height?: string | null;
  weight?: string | null;
  description?: string | null;
  skin_id?: number | null;
  mugshot_url?: string | null;
  status?: string;
  created_by?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('gang_members')
      .insert(data)
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `)
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('createGangMember error:', error);
    return { data: null, error };
  }
}

export async function updateGangMember(id: string, updates: {
  gang_id?: string;
  first_name?: string;
  last_name?: string;
  alias?: string | null;
  dob?: string | null;
  gender?: string | null;
  race?: string | null;
  height?: string | null;
  weight?: string | null;
  description?: string | null;
  skin_id?: number | null;
  mugshot_url?: string | null;
  status?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('gang_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateGangMember error:', error);
    return { data: null, error };
  }
}

export async function deleteGangMember(id: string) {
  try {
    const { error } = await supabase
      .from('gang_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteGangMember error:', error);
    return { error };
  }
}

// ============================================
// GANG MEMBER REPORTS
// ============================================

export async function createMemberReport(data: {
  member_id: string;
  report_type: 'investigation' | 'autopsy';
  date?: string | null;
  location?: string | null;
  description?: string | null;
  result_status?: string | null;
  officers?: string[] | null;
  evidence_urls?: string[] | null;
  autopsy_data?: Record<string, unknown> | null;
  body_markers?: Array<{ x: number; y: number; side: string }> | null;
  signed_by: string;
  created_by?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('gang_member_reports')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('createMemberReport error:', error);
    return { data: null, error };
  }
}

export async function deleteMemberReport(id: string) {
  try {
    const { error } = await supabase
      .from('gang_member_reports')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteMemberReport error:', error);
    return { error };
  }
}
