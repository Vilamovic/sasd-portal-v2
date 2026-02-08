import { supabase } from '@/src/supabaseClient';

export async function createPracticalExamResult(data: {
  slot_id?: string | null;
  exam_type: string;
  examinee_id: string;
  examiner_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  checklist: { item: string; checked: boolean }[];
  notes?: string;
}) {
  try {
    const { data: result, error } = await supabase
      .from('practical_exam_results')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('createPracticalExamResult error:', error);
    return { data: null, error };
  }
}

export async function getAllPracticalExamResults(filters?: {
  exam_type?: string;
  examinee_id?: string;
}) {
  try {
    let query = supabase
      .from('practical_exam_results')
      .select(`
        *,
        examinee:users!practical_exam_results_examinee_id_fkey(username, mta_nick),
        examiner:users!practical_exam_results_examiner_id_fkey(username, mta_nick)
      `)
      .order('created_at', { ascending: false });

    if (filters?.exam_type) {
      query = query.eq('exam_type', filters.exam_type);
    }
    if (filters?.examinee_id) {
      query = query.eq('examinee_id', filters.examinee_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllPracticalExamResults error:', error);
    return { data: null, error };
  }
}

export async function getPracticalExamResultById(id: string) {
  try {
    const { data, error } = await supabase
      .from('practical_exam_results')
      .select(`
        *,
        examinee:users!practical_exam_results_examinee_id_fkey(username, mta_nick),
        examiner:users!practical_exam_results_examiner_id_fkey(username, mta_nick)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getPracticalExamResultById error:', error);
    return { data: null, error };
  }
}
