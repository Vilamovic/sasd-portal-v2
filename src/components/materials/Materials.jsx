'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { getAllMaterials, upsertMaterial, deleteMaterialFromDb } from '@/src/utils/supabaseHelpers';
import { BookOpen, Edit3, Trash2, Plus, Save, X, Maximize2, Minimize2, ChevronLeft, FileText, Sparkles, ArrowRight } from 'lucide-react';

// Dynamic import React-Quill (client-side only)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

/**
 * Materials - Premium Sheriff-themed WYSIWYG editor
 * For training materials with glassmorphism design
 * - React-Quill editor for admins
 * - Materials in Supabase (materials table)
 * - localStorage as cache
 * - Manage dropdown (add/delete materials)
 * - Fullscreen edit mode
 * - Auto-render images
 * OPTIMIZED: React.memo to prevent unnecessary re-renders
 */
export default function Materials({ onBack }) {
  const { user, role, isAdmin } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editMode, setEditMode] = useState(false); // Toggle for delete buttons
  const submittingRef = useRef(false);

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

  // Define loadMaterials BEFORE useEffect to avoid initialization order issues
  const loadMaterials = async () => {
    try {
      setLoading(true);

      // Try localStorage cache first
      const cached = localStorage.getItem('materials_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setMaterials(parsed);
        if (parsed.length > 0) {
          setSelectedMaterial(parsed[0]);
        }
      }

      // Fetch from Supabase
      const { data, error } = await getAllMaterials();
      if (error) throw error;

      const materialsData = data || [];
      setMaterials(materialsData);

      // Cache in localStorage
      localStorage.setItem('materials_cache', JSON.stringify(materialsData));

      // Select first material if none selected
      if (!selectedMaterial && materialsData.length > 0) {
        setSelectedMaterial(materialsData[0]);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load materials
  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const materialData = {
        id: selectedMaterial.id,
        title: editTitle.trim(),
        content: editContent,
        author_id: user.id,
      };

      const { error } = await upsertMaterial(materialData);
      if (error) throw error;

      // Reload materials
      await loadMaterials();
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
      const materialData = {
        title: newTitle.trim(),
        content: '<p>Treść materiału...</p>',
        author_id: user.id,
      };

      const { error } = await upsertMaterial(materialData);
      if (error) throw error;

      // Reload materials
      await loadMaterials();
      setShowAddForm(false);
      setNewTitle('');
      setShowManageDropdown(false);
      alert('Materiał dodany.');
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Błąd podczas dodawania materiału.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Delete material
  const handleDelete = async (materialId, materialTitle) => {
    if (!confirm(`Czy na pewno chcesz usunąć materiał: "${materialTitle}"?`)) return;

    try {
      const { error } = await deleteMaterialFromDb(materialId);
      if (error) throw error;

      // Close modal if deleted material is selected
      if (selectedMaterial?.id === materialId) {
        setSelectedMaterial(null);
        setEditing(false);
      }

      // Reload materials
      await loadMaterials();
      alert('Materiał usunięty.');
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Błąd podczas usuwania materiału.');
    }
  };

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

  // Fullscreen mode
  if (fullscreen && editing) {
    return (
      <div className="fixed inset-0 bg-[#020a06] z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#051a0f] border-b border-[#1a4d32]">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent text-white border-none focus:outline-none flex-grow"
            placeholder="Tytuł materiału..."
          />
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setFullscreen(false)}
              className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
              title="Wyjdź z pełnego ekranu"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={cancelEdit}
              className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-grow overflow-hidden p-6">
          <ReactQuill
            theme="snow"
            value={editContent}
            onChange={setEditContent}
            modules={modules}
            className="h-full quill-fullscreen"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(201, 162, 39, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 162, 39, 0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
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
            <p className="text-[#8fb5a0]">
              Przeglądaj i edytuj materiały szkoleniowe
            </p>
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

        {/* Materials Grid */}
        {materials.length === 0 ? (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
            <BookOpen className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
            <p className="text-[#8fb5a0] text-lg">Brak materiałów. Kliknij "Dodaj Materiał" aby stworzyć pierwszy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <div
                key={material.id}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Glow effect */}
                <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 bg-[#c9a227]/20" />

                {/* Main Card */}
                <button
                  onClick={() => {
                    setSelectedMaterial(material);
                    setEditing(false);
                  }}
                  className="relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl text-left overflow-hidden"
                >
                  {/* Corner accents */}
                  <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-0 w-[2px] h-16 bg-gradient-to-b from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Delete Button (Edit Mode Only) */}
                  {isAdmin && editMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(material.id, material.title);
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl transition-all duration-200 group/delete"
                      title="Usuń materiał"
                    >
                      <Trash2 className="w-4 h-4 text-red-400 group-hover/delete:scale-110 transition-transform" />
                    </button>
                  )}

                  {/* Icon Container */}
                  <div className="mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <FileText className="w-7 h-7 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors line-clamp-2">
                    {material.title}
                  </h3>

                  {/* Content Preview */}
                  <div
                    className="text-[#8fb5a0] text-sm leading-relaxed line-clamp-3 prose prose-invert prose-p:text-[#8fb5a0] prose-p:text-sm"
                    dangerouslySetInnerHTML={{
                      __html: material.content.replace(/<[^>]*>/g, ' ').substring(0, 150) + '...'
                    }}
                  />

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[#1a4d32]/50 flex items-center justify-between">
                    <span className="text-xs text-[#8fb5a0]">Kliknij aby otworzyć</span>
                    <ArrowRight className="w-4 h-4 text-[#c9a227] group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Material View/Edit Modal */}
        {selectedMaterial && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl">
              {editing ? (
                <div className="glass-strong border border-[#1a4d32]/50">
                  {/* Edit Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#1a4d32]/50 bg-[#051a0f]/50">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-2xl font-bold bg-[#0a2818]/50 text-white border border-[#1a4d32] rounded-xl px-4 py-3 flex-grow focus:outline-none focus:border-[#c9a227] transition-colors"
                      placeholder="Tytuł materiału..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFullscreen(true)}
                        className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                        title="Pełny ekran"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        Zapisz
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={editContent}
                        onChange={setEditContent}
                        modules={modules}
                        className="quill-editor"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-strong border border-[#1a4d32]/50">
                  {/* View Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#1a4d32]/50 bg-[#051a0f]/50">
                    <h3 className="text-2xl font-bold text-white">{selectedMaterial.title}</h3>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button
                          onClick={startEdit}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edytuj
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMaterial(null);
                          setEditing(false);
                        }}
                        className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div
                      className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#8fb5a0] prose-a:text-[#c9a227] prose-strong:text-white prose-li:text-[#8fb5a0]"
                      dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Dashboard</span>
        </button>
      </div>

      {/* Quill Styles */}
      <style jsx global>{`
        .quill-wrapper {
          height: 500px;
        }

        .quill-editor .ql-container {
          height: 450px;
        }

        .quill-editor .ql-toolbar {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
        }

        .quill-fullscreen .ql-container {
          height: calc(100vh - 140px) !important;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}

