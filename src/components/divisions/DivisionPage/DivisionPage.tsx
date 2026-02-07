'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useDivisionMaterials } from './hooks/useDivisionMaterials';
import BackButton from './BackButton';
import PageHeader from './PageHeader';
import EditModeInfo from './EditModeInfo';
import MaterialForm from './MaterialForm';
import MaterialCard from './MaterialCard';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

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
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-400',
    },
    SS: {
      name: 'Supervisory Staff',
      color: 'from-[#ff8c00] to-[#ff7700]',
      textColor: 'text-[#ff8c00]',
    },
    DTU: {
      name: 'Detective Task Unit',
      color: 'from-[#1e3a8a] to-[#1e40af]',
      textColor: 'text-[#1e3a8a]',
    },
    GU: {
      name: 'Gang Unit',
      color: 'from-[#10b981] to-[#059669]',
      textColor: 'text-[#10b981]',
    },
    FTO: {
      name: 'Training Staff',
      color: 'from-[#c9a227] to-[#e6b830]',
      textColor: 'text-[#c9a227]',
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
    return <LoadingState />;
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
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={onBack} />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
