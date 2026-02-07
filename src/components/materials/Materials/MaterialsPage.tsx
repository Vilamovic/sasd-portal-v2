'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import 'react-quill-new/dist/quill.snow.css';
import { upsertMaterial, deleteMaterialFromDb } from '@/src/lib/db/materials';
import {
  ChevronLeft,
  Sparkles,
  Edit3,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

// Components
import MaterialsList from './MaterialsList';
import MaterialModal from './MaterialModal';

// Hooks
import { useMaterials } from './hooks/useMaterials';

/**
 * MaterialsPage - Orchestrator dla materiałów szkoleniowych
 *
 * Odpowiedzialności:
 * - State management (editing, selectedMaterial, forms)
 * - Business logic (startEdit, handleSave, handleAddMaterial, handleDelete)
 * - Component composition (MaterialsList + MaterialModal)
 *
 * Struktura:
 * 1. Header + Controls (Add Material, Edit Mode)
 * 2. Add Form (inline)
 * 3. Edit Mode Info
 * 4. MaterialsList (grid)
 * 5. MaterialModal (view/edit/fullscreen)
 */
export default function MaterialsPage({ onBack }: { onBack?: () => void }) {
  const { user, isAdmin } = useAuth();

  // ==================== STATE ====================
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const submittingRef = useRef(false);

  // ==================== CUSTOM HOOKS ====================
  const { materials, loading, loadMaterials, addMaterial, editMaterial, deleteMaterial } = useMaterials(user?.id);

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== BUSINESS LOGIC ====================

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // Start editing
  const startEdit = () => {
    if (!selectedMaterial) return;
    setEditTitle(selectedMaterial.title);
    setEditContent(selectedMaterial.content);
    setEditing(true);
  };

  // Save changes
  const handleSave = async () => {
    if (submittingRef.current) return;

    if (!editTitle.trim()) {
      alert('Tytuł nie może być pusty.');
      return;
    }

    submittingRef.current = true;

    try {
      await editMaterial(selectedMaterial.id, editTitle.trim(), editContent);
      setEditing(false);
      setFullscreen(false);
      alert('Materiał zapisany.');
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Błąd podczas zapisywania materiału.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditing(false);
    setEditTitle('');
    setEditContent('');
    setFullscreen(false);
  };

  // Add new material
  const handleAddMaterial = async () => {
    if (submittingRef.current) return;

    if (!newTitle.trim()) {
      alert('Tytuł nie może być pusty.');
      return;
    }

    submittingRef.current = true;

    try {
      await addMaterial(newTitle.trim());
      setShowAddForm(false);
      setNewTitle('');
      alert('Materiał dodany.');
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Błąd podczas dodawania materiału.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Delete material
  const handleDelete = async (materialId: number, materialTitle: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć materiał: "${materialTitle}"?`))
      return;

    try {
      await deleteMaterial(materialId);

      // Close modal if deleted material is selected
      if (selectedMaterial?.id === materialId) {
        setSelectedMaterial(null);
        setEditing(false);
      }

      alert('Materiał usunięty.');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Błąd podczas usuwania materiału.');
    }
  };

  // ==================== CONDITIONAL RENDERING ====================

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
          <p className="text-[#8fb5a0]">Ładowanie materiałów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Baza wiedzy</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Materiały <span className="text-gold-gradient">Szkoleniowe</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-3" />
            <div className="flex items-center gap-3">
              <p className="text-[#8fb5a0]">
                Przeglądaj i edytuj materiały szkoleniowe
              </p>
              {materials.length > 0 && (
                <span className="px-3 py-1 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full text-[#c9a227] text-xs font-bold">
                  {materials.length}{' '}
                  {materials.length === 1
                    ? 'materiał'
                    : materials.length < 5
                    ? 'materiały'
                    : 'materiałów'}
                </span>
              )}
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              {/* Edit Mode Toggle */}
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg ${
                  editMode
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20'
                    : 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-[#14b8a6]/20'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                {editMode ? 'Zakończ Edycję' : 'Tryb Edycji'}
              </button>

              {/* Add Material Button */}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#c9a227]/20"
              >
                <Plus className="w-4 h-4" />
                Dodaj Materiał
              </button>
            </div>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && isAdmin && (
          <div className="mb-6 glass-strong rounded-2xl border border-[#c9a227]/30 p-6 shadow-xl animate-border-glow">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#c9a227]" />
              Dodaj Nowy Materiał
            </h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tytuł materiału..."
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors mb-4"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMaterial}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                Dodaj
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTitle('');
                }}
                className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode Info */}
        {isAdmin && editMode && (
          <div className="mb-6 glass-strong rounded-xl border border-red-500/30 p-4 shadow-lg bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  Tryb usuwania aktywny
                </p>
                <p className="text-[#8fb5a0] text-xs">
                  Kliknij ikonę kosza na kafelku aby usunąć materiał
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        <MaterialsList
          materials={materials}
          editMode={editMode}
          isAdmin={isAdmin || false}
          onSelectMaterial={(material) => {
            setSelectedMaterial(material);
            setEditing(false);
          }}
          onDelete={handleDelete}
        />

        {/* Material View/Edit Modal */}
        <MaterialModal
          selectedMaterial={selectedMaterial}
          editing={editing}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editContent={editContent}
          setEditContent={setEditContent}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
          isAdmin={isAdmin || false}
          onStartEdit={startEdit}
          onSave={handleSave}
          onCancel={cancelEdit}
          onClose={() => {
            setSelectedMaterial(null);
            setEditing(false);
          }}
          modules={modules}
        />
      </div>
    </div>
  );
}
