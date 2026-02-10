import { useState, useEffect, useRef } from 'react';
import {
  getDivisionMaterials,
  addDivisionMaterial,
  updateDivisionMaterial,
  deleteDivisionMaterial,
} from '@/src/lib/db/divisions';

interface Material {
  id: string;
  title: string;
  description?: string;
  file_url: string | null;
  file_type: string | null;
  thumbnail_url?: string;
  is_mandatory?: boolean;
}

interface UseDivisionMaterialsParams {
  divisionId: string;
  hasAccess: boolean;
}

interface UseDivisionMaterialsReturn {
  materials: Material[];
  loadingMaterials: boolean;
  editMode: boolean;
  showAddForm: boolean;
  selectedMaterial: Material | null;
  isEditing: boolean;
  formTitle: string;
  formDescription: string;
  formFileUrl: string;
  formFileType: string;
  formThumbnailUrl: string;
  isMandatory: boolean;
  setEditMode: (value: boolean) => void;
  setShowAddForm: (value: boolean) => void;
  setFormTitle: (value: string) => void;
  setFormDescription: (value: string) => void;
  setFormFileUrl: (value: string) => void;
  setFormFileType: (value: string) => void;
  setFormThumbnailUrl: (value: string) => void;
  setIsMandatory: (value: boolean) => void;
  handleAddMaterial: () => Promise<void>;
  handleUpdateMaterial: () => Promise<void>;
  handleDeleteMaterial: (materialId: string, materialTitle: string) => Promise<void>;
  openEditForm: (material: Material) => void;
  resetForm: () => void;
  handleToggleEditMode: () => void;
  handleToggleAddForm: () => void;
}

/**
 * useDivisionMaterials - Division materials state and logic
 * - Load materials by division
 * - Add/Edit/Delete materials
 * - Form state management
 * - Edit mode toggle
 */
export function useDivisionMaterials({
  divisionId,
  hasAccess,
}: UseDivisionMaterialsParams): UseDivisionMaterialsReturn {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileType, setFormFileType] = useState('pdf');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [isMandatory, setIsMandatory] = useState(false);

  const submittingRef = useRef(false);

  // Load materials
  useEffect(() => {
    if (hasAccess) {
      loadMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionId, hasAccess]);

  const loadMaterials = async () => {
    try {
      setLoadingMaterials(true);
      const { data, error } = await getDivisionMaterials(divisionId);
      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading division materials:', error);
      alert('Błąd podczas ładowania materiałów.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleAddMaterial = async () => {
    if (submittingRef.current) return;
    if (!formTitle.trim()) {
      alert('Tytuł jest wymagany.');
      return;
    }

    submittingRef.current = true;
    try {
      const materialData = {
        division: divisionId,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        file_url: formFileUrl.trim() || null,
        file_type: formFileType || null,
        thumbnail_url: formThumbnailUrl.trim() || null,
        is_mandatory: isMandatory,
        order_index: materials.length,
      };

      const { error } = await addDivisionMaterial(materialData);
      if (error) throw error;

      await loadMaterials();
      resetForm();
      setShowAddForm(false);
      alert('Materiał dodany.');
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Błąd podczas dodawania materiału.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleUpdateMaterial = async () => {
    if (submittingRef.current || !selectedMaterial) return;
    if (!formTitle.trim()) {
      alert('Tytuł jest wymagany.');
      return;
    }

    submittingRef.current = true;
    try {
      const materialData = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        file_url: formFileUrl.trim() || null,
        file_type: formFileType || null,
        thumbnail_url: formThumbnailUrl.trim() || null,
        is_mandatory: isMandatory,
      };

      const { error } = await updateDivisionMaterial(selectedMaterial.id, materialData);
      if (error) throw error;

      await loadMaterials();
      resetForm();
      setSelectedMaterial(null);
      setIsEditing(false);
      alert('Materiał zaktualizowany.');
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Błąd podczas aktualizacji materiału.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleDeleteMaterial = async (materialId: string, materialTitle: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć materiał: "${materialTitle}"?`)) return;

    try {
      const { error } = await deleteDivisionMaterial(materialId);
      if (error) throw error;

      await loadMaterials();
      alert('Materiał usunięty.');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Błąd podczas usuwania materiału.');
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormFileUrl('');
    setFormFileType('pdf');
    setFormThumbnailUrl('');
    setIsMandatory(false);
    setShowAddForm(false);
    setIsEditing(false);
    setSelectedMaterial(null);
  };

  const openEditForm = (material: Material) => {
    setSelectedMaterial(material);
    setFormTitle(material.title);
    setFormDescription(material.description || '');
    setFormFileUrl(material.file_url || '');
    setFormFileType(material.file_type || 'pdf');
    setFormThumbnailUrl(material.thumbnail_url || '');
    setIsMandatory(material.is_mandatory || false);
    setIsEditing(true);
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleToggleAddForm = () => {
    resetForm();
    setShowAddForm(!showAddForm);
    setIsEditing(false);
    setSelectedMaterial(null);
  };

  return {
    materials,
    loadingMaterials,
    editMode,
    showAddForm,
    selectedMaterial,
    isEditing,
    formTitle,
    formDescription,
    formFileUrl,
    formFileType,
    formThumbnailUrl,
    isMandatory,
    setEditMode,
    setShowAddForm,
    setFormTitle,
    setFormDescription,
    setFormFileUrl,
    setFormFileType,
    setFormThumbnailUrl,
    setIsMandatory,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    openEditForm,
    resetForm,
    handleToggleEditMode,
    handleToggleAddForm,
  };
}
