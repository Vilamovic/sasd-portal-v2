import { supabase } from '@/src/supabaseClient';
import { dbQuery, dbMutate } from './queryWrapper';

// ============================================
// EXAMS - Types, Questions, Results
// ============================================

/**
 * Pobiera wszystkie typy egzaminów
 */
export function getAllExamTypes() {
  return dbQuery(
    () => supabase
      .from('exam_types')
      .select('*')
      .order('id', { ascending: true }),
    'getAllExamTypes'
  );
}

/**
 * Pobiera pytania dla danego typu egzaminu
 */
export function getQuestionsByExamType(examTypeId: number) {
  return dbQuery(
    () => supabase
      .from('exam_questions')
      .select('*')
      .eq('exam_type_id', examTypeId)
      .order('id', { ascending: true }),
    'getQuestionsByExamType'
  );
}

/**
 * Dodaje nowe pytanie egzaminacyjne
 */
export function addExamQuestion(questionData: any) {
  return dbQuery(
    () => supabase
      .from('exam_questions')
      .insert(questionData)
      .select()
      .single(),
    'addExamQuestion'
  );
}

/**
 * Aktualizuje pytanie egzaminacyjne
 */
export function updateExamQuestion(questionId: number, questionData: any) {
  return dbQuery(
    () => supabase
      .from('exam_questions')
      .update(questionData)
      .eq('id', questionId)
      .select()
      .single(),
    'updateExamQuestion'
  );
}

/**
 * Usuwa pytanie egzaminacyjne
 */
export function deleteExamQuestion(questionId: number) {
  return dbMutate(
    () => supabase
      .from('exam_questions')
      .delete()
      .eq('id', questionId),
    'deleteExamQuestion'
  );
}

/**
 * Pobiera niezarchiwizowane wyniki egzaminów
 */
export function getAllExamResultsNonArchived() {
  return dbQuery(
    () => supabase
      .from('exam_results')
      .select(`
        *,
        exam_types (name),
        users (username, mta_nick, badge)
      `)
      .eq('is_archived', false)
      .order('created_at', { ascending: false }),
    'getAllExamResultsNonArchived'
  );
}

/**
 * Pobiera zarchiwizowane wyniki egzaminów
 */
export function getAllExamResultsArchived() {
  return dbQuery(
    () => supabase
      .from('exam_results')
      .select(`
        *,
        exam_types (name),
        users (username, mta_nick, badge)
      `)
      .eq('is_archived', true)
      .order('created_at', { ascending: false }),
    'getAllExamResultsArchived'
  );
}

/**
 * Zapisuje wynik egzaminu
 */
export function saveExamResult(resultData: any) {
  return dbQuery(
    () => supabase
      .from('exam_results')
      .insert({
        ...resultData,
        is_archived: false,
      })
      .select()
      .single(),
    'saveExamResult'
  );
}

/**
 * Archiwizuje wynik egzaminu
 */
export function archiveExamResult(examId: string) {
  return dbQuery(
    () => supabase
      .from('exam_results')
      .update({ is_archived: true })
      .eq('exam_id', examId)
      .select()
      .single(),
    'archiveExamResult'
  );
}

/**
 * Archiwizuje wiele wyników egzaminów naraz (batch)
 */
export function archiveBatchExamResults(examIds: string[]) {
  return dbQuery(
    () => supabase
      .from('exam_results')
      .update({ is_archived: true })
      .in('exam_id', examIds)
      .select(),
    'archiveBatchExamResults'
  );
}

/**
 * Usuwa wynik egzaminu (trwale)
 */
export function deleteExamResult(examId: string) {
  return dbMutate(
    () => supabase
      .from('exam_results')
      .delete()
      .eq('exam_id', examId),
    'deleteExamResult'
  );
}
