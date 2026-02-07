'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { getDivisionMaterials, addDivisionMaterial, updateDivisionMaterial, deleteDivisionMaterial } from '@/src/utils/supabaseHelpers';
import { ChevronLeft, FileText, Plus, Trash2, Edit3, Save, X, Image as ImageIcon, Video, Link as LinkIcon, File, Sparkles, ArrowRight } from 'lucide-react';

/**
 * Division Materials Page - Materiały dla konkretnej dywizji
 * SWAT dostępny dla wszystkich, inne tylko dla użytkowników z dywizją/admin/dev
 */
export default function DivisionMaterialsPage() {
  const { user, loading, division, isAdmin, isDev, isCommander } = useAuth();
  const router = useRouter();
  const params = useParams();
  const divisionId = params.divisionId as string;

  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileType, setFormFileType] = useState('pdf');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const submittingRef = useRef(false);

  // Division config
  const divisionConfig: Record<string, { name: string; color: string; textColor: string }> = {
    SWAT: { name: 'Special Weapon And Tactics', color: 'from-red-500 to-red-600', textColor: 'text-red-400' },
    SS: { name: 'Supervisory Staff', color: 'from-[#ff8c00] to-[#ff7700]', textColor: 'text-[#ff8c00]' },
    DTU: { name: 'Detective Task Unit', color: 'from-[#1e3a8a] to-[#1e40af]', textColor: 'text-[#1e3a8a]' },
    GU: { name: 'Gang Unit', color: 'from-[#10b981] to-[#059669]', textColor: 'text-[#10b981]' },
    FTO: { name: 'Training Staff', color: 'from-[#c9a227] to-[#e6b830]', textColor: 'text-[#c9a227]' },
  };

  const currentDivision = divisionConfig[divisionId];

  // Check access
  const hasAccess = divisionId === 'SWAT' || division === divisionId || isAdmin || isDev;
  const canManage = isAdmin || isDev || (isCommander && division === divisionId);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !hasAccess) {
      router.push('/divisions');
    }
  }, [hasAccess, loading, user, router]);

  useEffect(() => {
    if (user && hasAccess) {
      loadMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasAccess, divisionId]);

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
    if (!formTitle.trim() || !formFileUrl.trim()) {
      alert('Tytuł i URL pliku są wymagane.');
      return;
    }

    submittingRef.current = true;
    try {
      const materialData = {
        division: divisionId,
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        file_url: formFileUrl.trim(),
        file_type: formFileType,
        thumbnail_url: formThumbnailUrl.trim() || null,
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
    if (!formTitle.trim() || !formFileUrl.trim()) {
      alert('Tytuł i URL pliku są wymagane.');
      return;
    }

    submittingRef.current = true;
    try {
      const materialData = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        file_url: formFileUrl.trim(),
        file_type: formFileType,
        thumbnail_url: formThumbnailUrl.trim() || null,
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
  };

  const openEditForm = (material: any) => {
    setSelectedMaterial(material);
    setFormTitle(material.title);
    setFormDescription(material.description || '');
    setFormFileUrl(material.file_url);
    setFormFileType(material.file_type || 'pdf');
    setFormThumbnailUrl(material.thumbnail_url || '');
    setIsEditing(true);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-7 h-7 text-white" />;
      case 'image':
        return <ImageIcon className="w-7 h-7 text-white" />;
      case 'video':
        return <Video className="w-7 h-7 text-white" />;
      case 'link':
        return <LinkIcon className="w-7 h-7 text-white" />;
      default:
        return <File className="w-7 h-7 text-white" />;
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8fb5a0] text-lg">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <Navbar />

      {/* Back Button - Top Left (STANDARD) */}
      <button
        onClick={() => router.push('/divisions')}
        className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-[#8fb5a0] hover:text-white hover:border-[#c9a227] transition-all z-10"
      >
        <ChevronLeft className="w-5 h-5" />
        Powrót do Dywizji
      </button>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${currentDivision.color} bg-opacity-20 border border-white/20 text-white text-sm font-medium mb-4`}>
              <Sparkles className="w-4 h-4" />
              <span>{divisionId}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              <span className={currentDivision.textColor}>{currentDivision.name}</span>
            </h2>
            <div className={`w-24 h-1 bg-gradient-to-r ${currentDivision.color} rounded-full mb-3`} />
            <div className="flex items-center gap-3">
              <p className="text-[#8fb5a0]">
                Materiały specjalistyczne dla {divisionId}
              </p>
              {materials.length > 0 && (
                <span className={`px-3 py-1 bg-gradient-to-r ${currentDivision.color} bg-opacity-10 border border-white/30 rounded-full text-white text-xs font-bold`}>
                  {materials.length} {materials.length === 1 ? 'materiał' : materials.length < 5 ? 'materiały' : 'materiałów'}
                </span>
              )}
            </div>
          </div>

          {/* Admin Controls */}
          {canManage && (
            <div className="flex items-center gap-3">
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

              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(!showAddForm);
                  setIsEditing(false);
                  setSelectedMaterial(null);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#c9a227]/20"
              >
                <Plus className="w-4 h-4" />
                Dodaj Materiał
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || isEditing) && canManage && (
          <div className="mb-6 glass-strong rounded-2xl border border-[#c9a227]/30 p-6 shadow-xl animate-border-glow">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#c9a227]" />
              {isEditing ? 'Edytuj Materiał' : 'Dodaj Nowy Materiał'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Tytuł materiału..."
                className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
              />
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Opis (opcjonalny)..."
                rows={3}
                className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
              />
              <input
                type="url"
                value={formFileUrl}
                onChange={(e) => setFormFileUrl(e.target.value)}
                placeholder="URL pliku (https://...)..."
                className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
              />
              <select
                value={formFileType}
                onChange={(e) => setFormFileType(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
              >
                <option value="pdf">PDF</option>
                <option value="image">Obraz</option>
                <option value="video">Wideo</option>
                <option value="link">Link</option>
                <option value="other">Inne</option>
              </select>
              <input
                type="url"
                value={formThumbnailUrl}
                onChange={(e) => setFormThumbnailUrl(e.target.value)}
                placeholder="URL miniaturki (opcjonalny)..."
                className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
              />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={isEditing ? handleUpdateMaterial : handleAddMaterial}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Zapisz' : 'Dodaj'}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                  setIsEditing(false);
                  setSelectedMaterial(null);
                }}
                className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Edit Mode Info */}
        {canManage && editMode && (
          <div className="mb-6 glass-strong rounded-xl border border-red-500/30 p-4 shadow-lg bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Tryb zarządzania aktywny</p>
                <p className="text-[#8fb5a0] text-xs">Kliknij "Edytuj" lub "Usuń" na kafelku aby zarządzać materiałami</p>
              </div>
            </div>
          </div>
        )}

        {/* Materials Grid */}
        {loadingMaterials ? (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
            <p className="text-[#8fb5a0] text-lg">Ładowanie materiałów...</p>
          </div>
        ) : materials.length === 0 ? (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
            <FileText className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
            <p className="text-[#8fb5a0] text-lg">
              {canManage ? 'Brak materiałów. Kliknij "Dodaj Materiał" aby stworzyć pierwszy.' : 'Brak materiałów dla tej dywizji.'}
            </p>
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
                <div className="relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl overflow-hidden">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 left-0 w-[2px] h-16 bg-gradient-to-b from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Edit/Delete Buttons (Edit Mode Only) */}
                  {canManage && editMode && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                      <button
                        onClick={() => openEditForm(material)}
                        className="p-2.5 bg-[#14b8a6]/20 hover:bg-[#14b8a6] border border-[#14b8a6]/50 hover:border-[#14b8a6] rounded-xl transition-all duration-200 group/edit animate-fadeIn shadow-lg shadow-[#14b8a6]/20"
                        title="Edytuj materiał"
                      >
                        <Edit3 className="w-4 h-4 text-[#14b8a6] group-hover/edit:text-white group-hover/edit:scale-110 transition-all" />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(material.id, material.title)}
                        className="p-2.5 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:border-red-500 rounded-xl transition-all duration-200 group/delete animate-fadeIn shadow-lg shadow-red-500/20"
                        title="Usuń materiał"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 group-hover/delete:text-white group-hover/delete:scale-110 transition-all" />
                      </button>
                    </div>
                  )}

                  {/* Icon Container */}
                  <div className="mb-5">
                    <div className={`w-14 h-14 bg-gradient-to-br ${currentDivision.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      {getFileIcon(material.file_type)}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors line-clamp-2">
                    {material.title}
                  </h3>

                  {material.description && (
                    <p className="text-[#8fb5a0] text-sm leading-relaxed line-clamp-3 mb-4">
                      {material.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-[#1a4d32]/50 flex items-center justify-between">
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-[#c9a227] hover:text-[#e6b830] transition-colors group/link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Otwórz materiał</span>
                      <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
