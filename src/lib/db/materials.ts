import { supabase } from '@/src/supabaseClient';

// ============================================
// MATERIALS - Training Materials
// ============================================

/**
 * Pobiera wszystkie materiały szkoleniowe
 */
export async function getAllMaterials() {
  try {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('getAllMaterials error:', error);
    return { data: null, error };
  }
}

/**
 * Upsert materiału
 */
export async function upsertMaterial(materialData: any) {
  try {
    const { data, error } = await supabase
      .from('materials')
      .upsert(materialData, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('upsertMaterial error:', error);
    return { data: null, error };
  }
}

/**
 * Usuwa materiał
 */
export async function deleteMaterialFromDb(materialId: number) {
  try {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('deleteMaterialFromDb error:', error);
    return { error };
  }
}
