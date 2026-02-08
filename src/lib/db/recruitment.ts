import { supabase } from '@/src/supabaseClient';

// ============================================
// RECRUITMENT - Division Recruitment Status
// ============================================

/**
 * Pobiera status rekrutacji wszystkich dywizji
 */
export async function getRecruitmentStatus() {
  try {
    const { data, error } = await supabase
      .from('division_recruitment')
      .select('*')
      .order('division');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getRecruitmentStatus error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje status rekrutacji dywizji (CS+)
 */
export async function updateRecruitmentStatus(
  division: string,
  isOpen: boolean,
  updatedBy: string
) {
  try {
    const { data, error } = await supabase
      .from('division_recruitment')
      .update({
        is_open: isOpen,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('division', division)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateRecruitmentStatus error:', error);
    return { data: null, error };
  }
}
