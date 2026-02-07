'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { getAllMaterials, upsertMaterial, deleteMaterialFromDb } from '@/src/lib/db/materials';
import { BookOpen, Edit3, Trash2, Plus, Save, X, Maximize2, Minimize2, ChevronDown, ChevronLeft } from 'lucide-react';

// Dynamic import React-Quill (client-side only)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

/**
 * Materials - WYSIWYG editor dla materiałów szkoleniowych
 * - React-Quill editor dla adminów
 * - Materiały w Supabase (tabela materials)
 * - localStorage jako cache
 * - Dropdown "Zarządzaj" (dodawanie/usuwanie materiałów)
 * - Pełnoekranowy widok edycji
 * - Auto-render obrazów
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-badge-gold-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Ładowanie materiałów...</p>
        </div>
      </div>
    );
  }

  // Fullscreen mode
  if (fullscreen && editing) {
    return (
      <div className="fixed inset-0 bg-police-dark-900 z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-police-dark-700 border-b border-white/10">
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
              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              title="Wyjdź z pełnego ekranu"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={cancelEdit}
              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">
              MATERIAŁY SZKOLENIOWE
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full"></div>
            <p className="text-gray-400 mt-4">
              Przeglądaj i edytuj materiały szkoleniowe
            </p>
          </div>

          {/* Manage Dropdown (Admin only) */}
          {isAdmin && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowManageDropdown(!showManageDropdown)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 text-police-dark-900 font-bold rounded-xl hover:from-badge-gold-400 hover:to-badge-gold-600 transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                Zarządzaj
                <ChevronDown className={`w-4 h-4 transition-transform ${showManageDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showManageDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-police-dark-700 rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      setShowManageDropdown(false);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/10 transition-colors text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Dodaj Materiał</span>
                  </button>

                  <div className="border-t border-white/10 my-2"></div>

                  {materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => handleDelete(material.id, material.title)}
                      className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-red-500/20 transition-colors text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
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
          <div className="mb-6 bg-police-dark-700 backdrop-blur-sm rounded-xl border border-badge-gold-400 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Dodaj Nowy Materiał</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tytuł materiału..."
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-badge-gold-400 transition-colors mb-4"
            />
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddMaterial}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                Dodaj
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewTitle('');
                }}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Material List */}
          <div className="lg:col-span-1">
            <div className="bg-police-dark-700 backdrop-blur-sm rounded-xl border border-white/10 p-4 shadow-xl">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-badge-gold-600" />
                Lista Materiałów
              </h3>
              <div className="space-y-2">
                {materials.length === 0 ? (
                  <p className="text-gray-400 text-sm">Brak materiałów</p>
                ) : (
                  materials.map((material) => (
                    <button
                      key={material.id}
                      onClick={() => {
                        setSelectedMaterial(material);
                        setEditing(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedMaterial?.id === material.id
                          ? 'bg-badge-gold-600/20 text-badge-gold-400 border border-badge-gold-400 shadow-lg'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <span className="text-sm font-medium">{material.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {!selectedMaterial ? (
              <div className="bg-police-dark-700 backdrop-blur-sm rounded-xl border border-white/10 p-12 text-center shadow-xl">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Wybierz materiał z listy</p>
              </div>
            ) : editing ? (
              <div className="bg-police-dark-700 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-xl">
                {/* Edit Header */}
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 flex-grow mr-4 focus:outline-none focus:border-badge-gold-400 transition-colors"
                    placeholder="Tytuł materiału..."
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFullscreen(true)}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      title="Pełny ekran"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Zapisz
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
              <div className="bg-police-dark-700 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-xl">
                {/* View Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">{selectedMaterial.title}</h3>
                  {isAdmin && (
                    <button
                      onClick={startEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edytuj
                    </button>
                  )}
                </div>

                {/* Content */}
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
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
          background: rgba(255, 255, 255, 0.05);
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
        }

        .quill-editor .ql-toolbar {
          background: rgba(255, 255, 255, 0.1);
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: rgba(255, 255, 255, 0.2);
        }

        .quill-editor .ql-editor {
          color: white;
          font-size: 16px;
          line-height: 1.6;
        }

        .quill-fullscreen .ql-container {
          height: calc(100vh - 140px) !important;
        }

        .prose-invert {
          color: #e5e7eb;
        }

        .prose-invert h1,
        .prose-invert h2,
        .prose-invert h3,
        .prose-invert h4,
        .prose-invert h5,
        .prose-invert h6 {
          color: white;
        }

        .prose-invert a {
          color: #fbbf24;
        }

        .prose-invert img {
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
