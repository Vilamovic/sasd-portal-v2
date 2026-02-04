'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { getAllMaterials, upsertMaterial, deleteMaterialFromDb } from '@/src/utils/supabaseHelpers';
import { BookOpen, Edit3, Trash2, Plus, Save, X, Maximize2, Minimize2, ChevronDown, ChevronLeft, FileText, Sparkles } from 'lucide-react';

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
  const [showManageDropdown, setShowManageDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const dropdownRef = useRef(null);
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

  // Load materials
  useEffect(() => {
    loadMaterials();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowManageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      // Reload materials
      await loadMaterials();
      setShowManageDropdown(false);
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

          {/* Manage Dropdown (Admin only) */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowManageDropdown(!showManageDropdown)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#c9a227]/20"
              >
                Zarządzaj
                <ChevronDown className={`w-4 h-4 transition-transform ${showManageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showManageDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[#051a0f] rounded-2xl shadow-2xl border border-[#1a4d32] py-2 z-50 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a227] to-transparent" />

                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setShowManageDropdown(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#0a2818] transition-colors text-white"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
                      <Plus className="w-4 h-4 text-[#22c55e]" />
                    </div>
                    <span className="text-sm font-medium">Dodaj Materiał</span>
                  </button>

                  <div className="border-t border-[#1a4d32]/50 my-2" />

                  <div className="px-4 py-2">
                    <span className="text-xs text-[#8fb5a0] uppercase tracking-wide">Usuń materiał</span>
                  </div>

                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => handleDelete(material.id, material.title)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-500/10 transition-colors text-red-400"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium truncate">{material.title}</span>
                    </button>
                  ))}
                </div>
              )}
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Material List */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-4 shadow-xl sticky top-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2 px-2">
                <BookOpen className="w-5 h-5 text-[#c9a227]" />
                Lista Materiałów
              </h3>
              <div className="space-y-2">
                {materials.length === 0 ? (
                  <p className="text-[#8fb5a0] text-sm px-2">Brak materiałów</p>
                ) : (
                  materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setEditing(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        selectedMaterial?.id === material.id
                          ? 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/50 shadow-lg'
                          : 'bg-[#0a2818]/30 text-[#8fb5a0] hover:bg-[#0a2818]/50 hover:text-white border border-transparent'
                      }`}
                    >
                      <FileText className={`w-4 h-4 ${selectedMaterial?.id === material.id ? 'text-[#c9a227]' : 'text-[#8fb5a0]'}`} />
                      <span className="text-sm font-medium truncate">{material.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {!selectedMaterial ? (
              <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
                <BookOpen className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Wybierz materiał z listy</p>
              </div>
            ) : editing ? (
              <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-6 shadow-xl">
                {/* Edit Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
            ) : (
              <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-6 shadow-xl">
                {/* View Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#1a4d32]/50">
                  <h3 className="text-2xl font-bold text-white">{selectedMaterial.title}</h3>
                  {isAdmin && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edytuj
                    </button>
                  )}
                </div>

                {/* Content */}
                <div
                  className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#8fb5a0] prose-a:text-[#c9a227] prose-strong:text-white prose-li:text-[#8fb5a0]"
                  dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                />
              </div>
            )}
          </div>
        </div>

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
      `}</style>
    </div>
  );
}

