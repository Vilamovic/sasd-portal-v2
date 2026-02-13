import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

// ============================================
// GANG MEMBERS
// ============================================

export async function getGangMembers(gangId?: string) {
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

  return dbQuery(() => query, 'getGangMembers');
}

export function getGangMember(id: string) {
  return dbQuery(
    () => supabase
      .from('gang_members')
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title),
        reports:gang_member_reports(*)
      `)
      .eq('id', id)
      .single(),
    'getGangMember'
  );
}

export async function searchGangMembers(query: string) {
  const terms = query.trim().split(/\s+/);
  let q = supabase
    .from('gang_members')
    .select(`
      *,
      gang:gang_profiles!gang_members_gang_id_fkey(id, title)
    `);

  if (terms.length >= 2) {
    // Search both name orders
    const [a, b] = terms;
    q = q.or(
      `first_name.ilike.%${a}%,last_name.ilike.%${a}%,alias.ilike.%${a}%,` +
      `first_name.ilike.%${b}%,last_name.ilike.%${b}%,alias.ilike.%${b}%`
    );
  } else {
    const term = terms[0];
    q = q.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,alias.ilike.%${term}%`
    );
  }

  return dbQuery(() => q.order('last_name').limit(50), 'searchGangMembers');
}

export function createGangMember(data: {
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
  return dbQuery(
    () => supabase
      .from('gang_members')
      .insert(data)
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `)
      .single(),
    'createGangMember'
  );
}

export function updateGangMember(id: string, updates: {
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
  return dbQuery(
    () => supabase
      .from('gang_members')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`
        *,
        gang:gang_profiles!gang_members_gang_id_fkey(id, title)
      `)
      .single(),
    'updateGangMember'
  );
}

export function deleteGangMember(id: string) {
  return dbMutate(
    () => supabase.from('gang_members').delete().eq('id', id),
    'deleteGangMember'
  );
}

// ============================================
// GANG MEMBER REPORTS
// ============================================

export function createMemberReport(data: {
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
  return dbQuery(
    () => supabase.from('gang_member_reports').insert(data).select().single(),
    'createMemberReport'
  );
}

export function updateMemberReport(id: string, updates: Partial<{
  report_type: 'investigation' | 'autopsy';
  date: string | null;
  location: string | null;
  description: string | null;
  result_status: string | null;
  officers: string[] | null;
  evidence_urls: string[] | null;
  autopsy_data: Record<string, unknown> | null;
  body_markers: Array<{ x: number; y: number; side: string }> | null;
  signed_by: string;
}>) {
  return dbQuery(
    () => supabase.from('gang_member_reports').update(updates).eq('id', id).select().single(),
    'updateMemberReport'
  );
}

export function deleteMemberReport(id: string) {
  return dbMutate(
    () => supabase.from('gang_member_reports').delete().eq('id', id),
    'deleteMemberReport'
  );
}
