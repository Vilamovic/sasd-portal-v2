import { supabase } from '@/src/supabaseClient';

// ============================================
// DIVISIONS - Division Materials Management
// ============================================

/**
 * Pobiera materiały dla dywizji (używa RPC z kontrolą dostępu)
 */
export async function getDivisionMaterials(division: string) {
  try {
    const { data, error } = await supabase.rpc('get_division_materials', {
      p_division: division,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getDivisionMaterials error:', error);
    return { data: null, error };
  }
}

/**
 * Dodaje materiał do dywizji (Admin/Dev/Commander only)
 */
export async function addDivisionMaterial(materialData: any) {
  try {
    const { data, error } = await supabase
      .from('division_materials')
      .insert(materialData)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('addDivisionMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Aktualizuje materiał dywizji
 */
export async function updateDivisionMaterial(materialId: number | string, materialData: any) {
  try {
    const { data, error } = await supabase
      .from('division_materials')
      .update(materialData)
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('updateDivisionMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa materiał dywizji
 */
export async function deleteDivisionMaterial(materialId: number | string) {
  try {
    const { error } = await supabase
      .from('division_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteDivisionMaterial error:', error);
    return { error };
  }
}
