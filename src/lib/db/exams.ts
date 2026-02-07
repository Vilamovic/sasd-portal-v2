import { supabase } from '@/src/supabaseClient';

// ============================================
// EXAMS - Types, Questions, Results
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

/**
 * Pobiera pytania dla danego typu egzaminu
 */
export async function getQuestionsByExamType(examTypeId: number) {
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
export async function addExamQuestion(questionData: any) {
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
export async function updateExamQuestion(questionId: number, questionData: any) {
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
export async function deleteExamQuestion(questionId: number) {
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
export async function saveExamResult(resultData: any) {
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
export async function archiveExamResult(examId: string) {
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
export async function deleteExamResult(examId: string) {
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
