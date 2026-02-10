'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDivisionMaterials } from './hooks/useDivisionMaterials';
import BackButton from '@/src/components/shared/BackButton';
import MaterialFilter from '@/src/components/shared/MaterialFilter';
import PageHeader from './PageHeader';
import EditModeInfo from './EditModeInfo';
import MaterialForm from './MaterialForm';
import MaterialCard from './MaterialCard';
import EmptyState from './EmptyState';
import LoadingState from '@/src/components/shared/LoadingState';

interface DivisionPageProps {
  divisionId: string;
  onBack: () => void;
}

/**
 * DivisionPage - Division materials orchestrator
 * - Division-specific materials (SWAT public, others require division/Commander/Admin)
 * - Add/Edit/Delete materials (Commander/Admin only)
 * - Edit mode toggle
 * - Material cards grid
 * - MaterialFilter (obowiązkowe/dodatkowe)
 */
export default function DivisionPage({ divisionId, onBack }: DivisionPageProps) {
  const { user, loading, division, isAdmin, isDev, isCommander } = useAuth();
  const [filter, setFilter] = useState<'all' | 'mandatory' | 'optional'>('all');
  const [devToolsBlocked, setDevToolsBlocked] = useState(false);

  // Block DevTools + right-click on division materials page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); setDevToolsBlocked(true); return; }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const key = e.key.toLowerCase();
        if (key === 'i' || key === 'j' || key === 'c') { e.preventDefault(); setDevToolsBlocked(true); return; }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') { e.preventDefault(); setDevToolsBlocked(true); return; }
    };
    const handleContextMenu = (e: MouseEvent) => { e.preventDefault(); };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);

  // Division config
  const divisionConfig: Record<string, { name: string; color: string; textColor: string }> = {
    SWAT: {
      name: 'Special Weapon And Tactics',
      color: '#c41e1e',
      textColor: '#c41e1e',
    },
    SS: {
      name: 'Supervisory Staff',
      color: '#ff8c00',
      textColor: '#ff8c00',
    },
    DTU: {
      name: 'Detective Task Unit',
      color: '#60a5fa',
      textColor: '#60a5fa',
    },
    GU: {
      name: 'Gang Unit',
      color: '#10b981',
      textColor: '#10b981',
    },
    FTO: {
      name: 'Training Staff',
      color: '#c9a227',
      textColor: '#c9a227',
    },
  };

  const currentDivision = divisionConfig[divisionId];

  // Access control
  const hasAccess = divisionId === 'SWAT' || division === divisionId || isAdmin || isDev;
  const canManage = isAdmin || isDev || (isCommander && division === divisionId);

  const {
    materials,
    loadingMaterials,
    editMode,
    showAddForm,
    isEditing,
    formTitle,
    formDescription,
    isMandatory,
    setFormTitle,
    setFormDescription,
    setIsMandatory,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    openEditForm,
    resetForm,
    handleToggleEditMode,
    handleToggleAddForm,
  } = useDivisionMaterials({ divisionId, hasAccess });

  // Computed: filtered materials
  const filteredMaterials = materials.filter((m) => {
    if (filter === 'all') return true;
    if (filter === 'mandatory') return m.is_mandatory;
    if (filter === 'optional') return !m.is_mandatory;
    return true;
  });

  const mandatoryCount = materials.filter((m) => m.is_mandatory).length;
  const optionalCount = materials.filter((m) => !m.is_mandatory).length;

  // Loading state
  if (loading || !user) {
    return <LoadingState message="Ładowanie..." />;
  }

  // Access denied (will be redirected by routing wrapper)
  if (!hasAccess) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={onBack} destination="Dywizji" />

        {/* Header */}
        <PageHeader
          divisionId={divisionId}
          divisionConfig={currentDivision}
          materialsCount={materials.length}
          canManage={canManage}
          editMode={editMode}
          showAddForm={showAddForm}
          onToggleEditMode={handleToggleEditMode}
          onToggleAddForm={handleToggleAddForm}
        />

        {/* Material Filter */}
        {materials.length > 0 && (
          <div className="mb-4">
            <MaterialFilter
              value={filter}
              onChange={setFilter}
              totalCount={materials.length}
              mandatoryCount={mandatoryCount}
              optionalCount={optionalCount}
            />
          </div>
        )}

        {/* Add/Edit Form */}
        {(showAddForm || isEditing) && canManage && (
          <MaterialForm
            isEditing={isEditing}
            formTitle={formTitle}
            formDescription={formDescription}
            isMandatory={isMandatory}
            onTitleChange={setFormTitle}
            onDescriptionChange={setFormDescription}
            onMandatoryChange={setIsMandatory}
            onSubmit={isEditing ? handleUpdateMaterial : handleAddMaterial}
            onCancel={resetForm}
          />
        )}

        {/* Edit Mode Info */}
        {canManage && editMode && <EditModeInfo />}

        {/* Materials Grid or Empty State */}
        {filteredMaterials.length === 0 ? (
          <EmptyState canManage={canManage} loading={loadingMaterials} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material, index) => (
              <MaterialCard
                key={material.id}
                material={material}
                divisionConfig={currentDivision}
                editMode={editMode}
                canManage={canManage}
                index={index}
                onEdit={openEditForm}
                onDelete={handleDeleteMaterial}
              />
            ))}
          </div>
        )}
      </div>

      {/* DevTools blocked overlay */}
      {devToolsBlocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="panel-raised p-8 text-center max-w-md" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase mb-4" style={{ color: 'var(--mdt-content-text)' }}>
              Dostęp zabroniony
            </p>
            <p className="font-mono text-sm mb-6" style={{ color: 'var(--mdt-muted-text)' }}>
              Narzędzia deweloperskie są zablokowane na stronie materiałów.
            </p>
            <button onClick={() => setDevToolsBlocked(false)} className="btn-win95 font-mono text-sm">
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
