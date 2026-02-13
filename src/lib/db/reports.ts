import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

// ============================================
// REPORTS - Division Reports Management
// ============================================

/**
 * Pobiera raporty dla dywizji z danymi autora
 */
export async function getDivisionReports(division: string, filters?: { reportType?: string; status?: string }) {
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

  return dbQuery(() => query, 'getDivisionReports');
}

/**
 * Tworzy nowy raport dywizji
 */
export function createDivisionReport(reportData: {
  division: string;
  report_type: string;
  author_id: string;
  participants: string[];
  form_data: Record<string, any>;
}) {
  return dbQuery(
    () => supabase
      .from('division_reports')
      .insert(reportData)
      .select()
      .single(),
    'createDivisionReport'
  );
}

/**
 * Aktualizuje raport dywizji
 */
export function updateDivisionReport(reportId: string, data: {
  form_data?: Record<string, any>;
  participants?: string[];
  updated_at?: string;
}) {
  return dbQuery(
    () => supabase
      .from('division_reports')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', reportId)
      .select()
      .single(),
    'updateDivisionReport'
  );
}

/**
 * Usuwa raport dywizji (CS+ only)
 */
export function deleteDivisionReport(reportId: string) {
  return dbMutate(
    () => supabase
      .from('division_reports')
      .delete()
      .eq('id', reportId),
    'deleteDivisionReport'
  );
}

/**
 * Archiwizuje raport dywizji
 */
export function archiveDivisionReport(reportId: string, archivedBy: string) {
  return dbQuery(
    () => supabase
      .from('division_reports')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: archivedBy,
      })
      .eq('id', reportId)
      .select()
      .single(),
    'archiveDivisionReport'
  );
}
