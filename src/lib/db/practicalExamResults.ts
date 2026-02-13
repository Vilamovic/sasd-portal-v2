import { supabase } from '@/src/supabaseClient';
import { dbQuery } from './queryWrapper';
import type { PracticalExamChecklist, LegacyChecklist } from '@/src/components/zgloszenia/types';

export function createPracticalExamResult(data: {
  slot_id?: string | null;
  exam_type: string;
  examinee_id: string;
  examiner_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  checklist: PracticalExamChecklist | LegacyChecklist;
  notes?: string;
}) {
  return dbQuery(
    () => supabase
      .from('practical_exam_results')
      .insert(data)
      .select()
      .single(),
    'createPracticalExamResult'
  );
}

export async function getAllPracticalExamResults(filters?: {
  exam_type?: string;
  examinee_id?: string;
  include_archived?: boolean;
}) {
  let query = supabase
    .from('practical_exam_results')
    .select(`
      *,
      examinee:users!practical_exam_results_examinee_id_fkey(username, mta_nick),
      examiner:users!practical_exam_results_examiner_id_fkey(username, mta_nick),
      archived_by_user:users!practical_exam_results_archived_by_fkey(username, mta_nick)
    `)
    .order('created_at', { ascending: false });

  // Exclude archived by default
  if (!filters?.include_archived) {
    query = query.eq('is_archived', false);
  }

  if (filters?.exam_type) {
    query = query.eq('exam_type', filters.exam_type);
  }
  if (filters?.examinee_id) {
    query = query.eq('examinee_id', filters.examinee_id);
  }

  return dbQuery(() => query, 'getAllPracticalExamResults');
}

export function getPracticalExamResultById(id: string) {
  return dbQuery(
    () => supabase
      .from('practical_exam_results')
      .select(`
        *,
        examinee:users!practical_exam_results_examinee_id_fkey(username, mta_nick),
        examiner:users!practical_exam_results_examiner_id_fkey(username, mta_nick),
        archived_by_user:users!practical_exam_results_archived_by_fkey(username, mta_nick)
      `)
      .eq('id', id)
      .single(),
    'getPracticalExamResultById'
  );
}

/**
 * Archiwizuje wynik egzaminu praktycznego
 */
export function archiveExamResult(id: string, archivedBy: string) {
  return dbQuery(
    () => supabase
      .from('practical_exam_results')
      .update({
        is_archived: true,
        archived_at: new Date().toISOString(),
        archived_by: archivedBy,
      })
      .eq('id', id)
      .select()
      .single(),
    'archiveExamResult'
  );
}

/**
 * Pobiera wszystkie zarchiwizowane wyniki egzaminów
 */
export async function getArchivedExamResults(filters?: {
  exam_type?: string;
  examinee_id?: string;
}) {
  let query = supabase
    .from('practical_exam_results')
    .select(`
      *,
      examinee:users!practical_exam_results_examinee_id_fkey(username, mta_nick),
      examiner:users!practical_exam_results_examiner_id_fkey(username, mta_nick),
      archived_by_user:users!practical_exam_results_archived_by_fkey(username, mta_nick)
    `)
    .eq('is_archived', true)
    .order('archived_at', { ascending: false });

  if (filters?.exam_type) {
    query = query.eq('exam_type', filters.exam_type);
  }
  if (filters?.examinee_id) {
    query = query.eq('examinee_id', filters.examinee_id);
  }

  return dbQuery(() => query, 'getArchivedExamResults');
}
