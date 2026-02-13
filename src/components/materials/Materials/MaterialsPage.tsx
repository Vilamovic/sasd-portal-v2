'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import {
  Edit3,
  Plus,
  Save,
  Search,
  Trash2,
} from 'lucide-react';

// Components
import MaterialsList from './MaterialsList';
import MaterialModal from './MaterialModal';
import BackButton from '@/src/components/shared/BackButton';
import MaterialFilter from '@/src/components/shared/MaterialFilter';

// Hooks
import { useMaterials } from './hooks/useMaterials';

/**
 * MaterialsPage - Orchestrator dla materiałów szkoleniowych
 */
export default function MaterialsPage({ onBack }: { onBack?: () => void }) {
  const { user, isAdmin } = useAuth();

  // ==================== STATE ====================
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMandatory, setEditMandatory] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('<p><br></p>');
  const [newMandatory, setNewMandatory] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [devToolsBlocked, setDevToolsBlocked] = useState(false);
  const submittingRef = useRef(false);

  // ==================== CUSTOM HOOKS ====================
  const { materials, loading, loadMaterials, addMaterial, editMaterial, deleteMaterial } = useMaterials(user?.id);

  // ==================== COMPUTED VALUES ====================
  const filteredMaterials = materials.filter((m) => {
    // Filter by mandatory/optional
    if (filter === 'mandatory' && !m.is_mandatory) return false;
    if (filter === 'optional' && m.is_mandatory) return false;
    // Filter by search query
    if (searchQuery.trim()) {
      return m.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }
    return true;
  });

  const mandatoryCount = materials.filter((m) => m.is_mandatory).length;
  const optionalCount = materials.filter((m) => !m.is_mandatory).length;

  // ==================== EFFECTS ====================
  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Block DevTools on entire /materials page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        setDevToolsBlocked(true);
        return;
      }
      // Ctrl+Shift+I / J / C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'i' || key === 'j' || key === 'c') {
          e.preventDefault();
          setDevToolsBlocked(true);
          return;
        }
      }
      // Ctrl+U (view source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        setDevToolsBlocked(true);
        return;
      }
    };

    // Block right-click context menu (prevents "Zbadaj element")
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // ==================== BUSINESS LOGIC ====================

  // Start editing
  const startEdit = () => {
    if (!selectedMaterial) return;
    setEditTitle(selectedMaterial.title);
    setEditContent(selectedMaterial.content);
    setEditMandatory(selectedMaterial.is_mandatory || false);
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
      await editMaterial(selectedMaterial.id, editTitle.trim(), editContent, editMandatory);
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

  // Cancel edit (with unsaved changes confirmation)
  const cancelEdit = () => {
    const hasChanges = selectedMaterial && (
      editTitle !== selectedMaterial.title ||
      editContent !== selectedMaterial.content ||
      editMandatory !== (selectedMaterial.is_mandatory || false)
    );
    if (hasChanges && !confirm('Masz niezapisane zmiany. Czy na pewno chcesz wyjść?')) return;
    setEditing(false);
    setEditTitle('');
    setEditContent('');
    setEditMandatory(false);
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
      await addMaterial(newTitle.trim(), newMandatory);
      setShowAddForm(false);
      setNewTitle('');
      setNewContent('<p><br></p>');
      setNewMandatory(false);
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="text-center panel-raised p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie materiałów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={onBack || (() => {})} destination="Dashboard" />

        {/* Header */}
        <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              Materiały Szkoleniowe
            </span>
          </div>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
                  Przeglądaj i edytuj materiały szkoleniowe
                </p>
                {materials.length > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 panel-inset" style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}>
                    {materials.length}{' '}
                    {materials.length === 1
                      ? 'materiał'
                      : materials.length < 5
                      ? 'materiały'
                      : 'materiałów'}
                  </span>
                )}
              </div>

              {/* Material Filter */}
              {materials.length > 0 && (
                <MaterialFilter
                  value={filter}
                  onChange={setFilter}
                  totalCount={materials.length}
                  mandatoryCount={mandatoryCount}
                  optionalCount={optionalCount}
                />
              )}

              {/* Search */}
              {materials.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--mdt-muted-text)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj materiału..."
                    className="panel-inset w-full max-w-xs pl-7 pr-3 py-1.5 font-mono text-xs"
                    style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Admin Controls */}
            {isAdmin && (
              <div className="flex items-center gap-3">
                {/* Edit Mode Toggle */}
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn-win95 flex items-center gap-2"
                  style={editMode ? { backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' } : {}}
                >
                  <Edit3 className="w-4 h-4" />
                  {editMode ? 'Zakończ Edycję' : 'Tryb Edycji'}
                </button>

                {/* Add Material Button */}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="btn-win95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj Materiał
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && isAdmin && (
          <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
                Dodaj Nowy Materiał
              </span>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Tytuł materiału..."
                className="panel-inset w-full px-3 py-2 font-mono text-sm mb-3"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
              />

              {/* Mandatory Checkbox */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMandatory}
                    onChange={(e) => setNewMandatory(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
                    Materiał obowiązkowy
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddMaterial}
                  className="btn-win95 flex items-center gap-2"
                  style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                >
                  <Save className="w-4 h-4" />
                  Dodaj
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTitle('');
                    setNewContent('<p><br></p>');
                    setNewMandatory(false);
                  }}
                  className="btn-win95"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode Info */}
        {isAdmin && editMode && (
          <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="p-3 flex items-center gap-3">
              <Trash2 className="w-4 h-4" style={{ color: '#c41e1e' }} />
              <div>
                <p className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>
                  Tryb usuwania aktywny
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                  Kliknij ikonę kosza na kafelku aby usunąć materiał
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        <MaterialsList
          materials={filteredMaterials}
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
          editMandatory={editMandatory}
          setEditMandatory={setEditMandatory}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
          isAdmin={isAdmin || false}
          username={user?.user_metadata?.full_name || user?.user_metadata?.username || 'Użytkownik'}
          onStartEdit={startEdit}
          onSave={handleSave}
          onCancel={cancelEdit}
          onClose={() => {
            setSelectedMaterial(null);
            setEditing(false);
          }}
        />
      </div>

      {/* DevTools blocked overlay (fullscreen, above everything) */}
      {devToolsBlocked && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
        >
          <div className="panel-raised p-8 text-center max-w-md" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase mb-4" style={{ color: 'var(--mdt-content-text)' }}>
              Dostęp zabroniony
            </p>
            <p className="font-mono text-sm mb-6" style={{ color: 'var(--mdt-muted-text)' }}>
              Narzędzia deweloperskie są zablokowane na stronie materiałów szkoleniowych.
            </p>
            <button
              onClick={() => setDevToolsBlocked(false)}
              className="btn-win95 font-mono text-sm"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
