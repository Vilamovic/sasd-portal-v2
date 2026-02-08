'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useDivisionMaterials } from './hooks/useDivisionMaterials';
import BackButton from '@/src/components/shared/BackButton';
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
 */
export default function DivisionPage({ divisionId, onBack }: DivisionPageProps) {
  const { user, loading, division, isAdmin, isDev, isCommander } = useAuth();

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
    formFileUrl,
    formFileType,
    formThumbnailUrl,
    setFormTitle,
    setFormDescription,
    setFormFileUrl,
    setFormFileType,
    setFormThumbnailUrl,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    openEditForm,
    resetForm,
    handleToggleEditMode,
    handleToggleAddForm,
  } = useDivisionMaterials({ divisionId, hasAccess });

  // Loading state
  if (loading || !user) {
    return <LoadingState message="Ładowanie..." />;
  }

  // Access denied (will be redirected by routing wrapper)
  if (!hasAccess) {
    return null;
  }

  const handleFormCancel = () => {
    resetForm();
    setFormTitle('');
    setFormDescription('');
    setFormFileUrl('');
    setFormFileType('pdf');
    setFormThumbnailUrl('');
  };

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

        {/* Add/Edit Form */}
        {(showAddForm || isEditing) && canManage && (
          <MaterialForm
            isEditing={isEditing}
            formTitle={formTitle}
            formDescription={formDescription}
            formFileUrl={formFileUrl}
            formFileType={formFileType}
            formThumbnailUrl={formThumbnailUrl}
            onTitleChange={setFormTitle}
            onDescriptionChange={setFormDescription}
            onFileUrlChange={setFormFileUrl}
            onFileTypeChange={setFormFileType}
            onThumbnailUrlChange={setFormThumbnailUrl}
            onSubmit={isEditing ? handleUpdateMaterial : handleAddMaterial}
            onCancel={handleFormCancel}
          />
        )}

        {/* Edit Mode Info */}
        {canManage && editMode && <EditModeInfo />}

        {/* Materials Grid or Empty State */}
        {materials.length === 0 ? (
          <EmptyState canManage={canManage} loading={loadingMaterials} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((material, index) => (
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
    </div>
  );
}
