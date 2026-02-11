import { supabase } from '@/src/supabaseClient';

// ============================================
// REPORTS - Division Reports Management
// ============================================

/**
 * Pobiera raporty dla dywizji z danymi autora
 */
export async function getDivisionReports(division: string, filters?: { reportType?: string; status?: string }) {
  try {
    let query = supabase
      .from('division_reports')
      .select('*, author:users!division_reports_author_id_fkey(id, username, mta_nick, avatar_url, badge)')
      .eq('division', division)
      .order('created_at', { ascending: false });

    if (filters?.reportType) {
      query = query.eq('report_type', filters.reportType);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getDivisionReports error:', error);
    return { data: null, error };
  }
}

/**
 * Tworzy nowy raport dywizji
 */
export async function createDivisionReport(reportData: {
  division: string;
  report_type: string;
  author_id: string;
  participants: string[];
  form_data: Record<string, any>;
}) {
  try {
    const { data, error } = await supabase
      .from('division_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('createDivisionReport error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje raport dywizji
 */
export async function updateDivisionReport(reportId: string, data: {
  form_data?: Record<string, any>;
  participants?: string[];
  updated_at?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('division_reports')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('updateDivisionReport error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa raport dywizji (CS+ only)
 */
export async function deleteDivisionReport(reportId: string) {
  try {
    const { error } = await supabase
      .from('division_reports')
      .delete()
      .eq('id', reportId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteDivisionReport error:', error);
    return { error };
  }
}

/**
 * Archiwizuje raport dywizji
 */
export async function archiveDivisionReport(reportId: string, archivedBy: string) {
  try {
    const { data, error } = await supabase
      .from('division_reports')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: archivedBy,
      })
      .eq('id', reportId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('archiveDivisionReport error:', error);
    return { data: null, error };
  }
}
