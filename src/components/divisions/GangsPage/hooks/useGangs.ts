'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getGangProfiles, addGangProfile, updateGangProfile, deleteGangProfile } from '@/src/lib/db/gangs';

interface GangProfile {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UseGangsReturn {
  gangs: GangProfile[];
  loading: boolean;
  // UI State
  editMode: boolean;
  showAddForm: boolean;
  isEditing: boolean;
  selectedGang: GangProfile | null;
  // Form State
  formTitle: string;
  formDescription: string;
  // Setters
  setFormTitle: (v: string) => void;
  setFormDescription: (v: string) => void;
  // Handlers
  handleAddGang: () => Promise<void>;
  handleUpdateGang: () => Promise<void>;
  handleDeleteGang: (gangId: string, gangTitle: string) => Promise<void>;
  openEditForm: (gang: GangProfile) => void;
  resetForm: () => void;
  handleToggleEditMode: () => void;
  handleToggleAddForm: () => void;
}

export function useGangs(userId: string | undefined): UseGangsReturn {
  const [gangs, setGangs] = useState<GangProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedGang, setSelectedGang] = useState<GangProfile | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const submittingRef = useRef(false);

  const isEditing = selectedGang !== null;

  const loadGangs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getGangProfiles();
      setGangs(data || []);
    } catch (error) {
      console.error('Error loading gangs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGangs();
  }, [loadGangs]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setSelectedGang(null);
    setShowAddForm(false);
  };

  const openEditForm = (gang: GangProfile) => {
    setSelectedGang(gang);
    setFormTitle(gang.title);
    setFormDescription(gang.description || '');
    setShowAddForm(true);
  };

  const handleToggleEditMode = () => {
    setEditMode(!editMode);
    if (editMode) resetForm();
  };

  const handleToggleAddForm = () => {
    if (showAddForm) {
      resetForm();
    } else {
      setShowAddForm(true);
      setSelectedGang(null);
      setFormTitle('');
      setFormDescription('');
    }
  };

  const handleAddGang = async () => {
    if (submittingRef.current) return;
    if (!formTitle.trim()) {
      alert('Nazwa gangu jest wymagana.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addGangProfile({
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        order_index: gangs.length,
        created_by: userId,
      });

      if (error) throw error;
      await loadGangs();
      resetForm();
      alert('Gang dodany.');
    } catch (error) {
      console.error('Error adding gang:', error);
      alert('Błąd podczas dodawania gangu.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleUpdateGang = async () => {
    if (submittingRef.current || !selectedGang) return;
    if (!formTitle.trim()) {
      alert('Nazwa gangu jest wymagana.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await updateGangProfile(selectedGang.id, {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
      });

      if (error) throw error;
      await loadGangs();
      resetForm();
      alert('Gang zaktualizowany.');
    } catch (error) {
      console.error('Error updating gang:', error);
      alert('Błąd podczas aktualizacji gangu.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleDeleteGang = async (gangId: string, gangTitle: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć gang "${gangTitle}"?`)) return;

    try {
      const { error } = await deleteGangProfile(gangId);
      if (error) throw error;
      await loadGangs();
      alert('Gang usunięty.');
    } catch (error) {
      console.error('Error deleting gang:', error);
      alert('Błąd podczas usuwania gangu.');
    }
  };

  return {
    gangs,
    loading,
    editMode,
    showAddForm,
    isEditing,
    selectedGang,
    formTitle,
    formDescription,
    setFormTitle,
    setFormDescription,
    handleAddGang,
    handleUpdateGang,
    handleDeleteGang,
    openEditForm,
    resetForm,
    handleToggleEditMode,
    handleToggleAddForm,
  };
}
