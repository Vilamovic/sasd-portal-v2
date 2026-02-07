import { useState, useCallback } from 'react';
import { getAllMaterials, upsertMaterial, deleteMaterialFromDb } from '@/src/lib/db/materials';

/**
 * useMaterials - Hook dla zarządzania materiałami szkoleniowymi
 *
 * Features:
 * - Load materials from Supabase (z localStorage cache)
 * - Add new material
 * - Edit existing material
 * - Delete material
 * - Auto-refresh after mutations
 */
export function useMaterials(userId: string | undefined) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load materials from Supabase (with localStorage cache)
  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);

      // Try localStorage cache first
      const cached = localStorage.getItem('materials_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setMaterials(parsed);
      }

      // Fetch from Supabase
      const { data, error } = await getAllMaterials();
      if (error) throw error;

      const materialsData = (data || []).sort((a: any, b: any) =>
        a.title.localeCompare(b.title, 'pl', { sensitivity: 'base' })
      );
      setMaterials(materialsData);

      // Cache in localStorage
      localStorage.setItem('materials_cache', JSON.stringify(materialsData));
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new material
  const addMaterial = useCallback(async (title: string) => {
    if (!title.trim()) {
      throw new Error('Tytuł nie może być pusty.');
    }

    if (!userId) {
      throw new Error('Brak ID użytkownika.');
    }

    const materialData = {
      title: title.trim(),
      content: '<p>Treść materiału...</p>',
      author_id: userId,
    };

    const { error } = await upsertMaterial(materialData);
    if (error) throw error;

    // Reload materials
    await loadMaterials();
  }, [userId, loadMaterials]);

  // Edit material
  const editMaterial = useCallback(async (
    materialId: number,
    title: string,
    content: string
  ) => {
    if (!title.trim()) {
      throw new Error('Tytuł nie może być pusty.');
    }

    if (!userId) {
      throw new Error('Brak ID użytkownika.');
    }

    const materialData = {
      id: materialId,
      title: title.trim(),
      content,
      author_id: userId,
    };

    const { error } = await upsertMaterial(materialData);
    if (error) throw error;

    // Reload materials
    await loadMaterials();
  }, [userId, loadMaterials]);

  // Delete material
  const deleteMaterial = useCallback(async (materialId: number) => {
    const { error } = await deleteMaterialFromDb(materialId);
    if (error) throw error;

    // Reload materials
    await loadMaterials();
  }, [loadMaterials]);

  return {
    materials,
    loading,
    loadMaterials,
    addMaterial,
    editMaterial,
    deleteMaterial,
  };
}
