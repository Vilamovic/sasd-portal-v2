'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { Edit3, Plus, Users } from 'lucide-react';
import { useGangs } from './hooks/useGangs';
import GangCard from './GangCard';
import GangForm from './GangForm';
import LoadingState from '@/src/components/shared/LoadingState';

interface GangsPageProps {
  onBack: () => void;
}

export default function GangsPage({ onBack }: GangsPageProps) {
  const { user, isCS, isDev, division, isCommander } = useAuth();

  const canManage = isCS || isDev || (division === 'GU' && isCommander);

  const {
    gangs,
    loading,
    editMode,
    showAddForm,
    isEditing,
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
  } = useGangs(user?.id);

  if (loading) {
    return <LoadingState message="Ładowanie gangów..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: '#10b981' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              Gangi
            </span>
          </div>
          <span className="font-mono text-xs text-white opacity-80">
            {gangs.length} gangów
          </span>
        </div>

        {canManage && (
          <div className="p-3 flex items-center gap-2">
            <button
              onClick={handleToggleEditMode}
              className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
              style={editMode ? { backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#a33 #511 #511 #a33' } : {}}
            >
              <Edit3 className="w-3 h-3" />
              {editMode ? 'Zakończ edycję' : 'Tryb edycji'}
            </button>
            {editMode && (
              <button
                onClick={handleToggleAddForm}
                className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
                style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
              >
                <Plus className="w-3 h-3" />
                {showAddForm ? 'Schowaj formularz' : 'Dodaj gang'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <GangForm
          isEditing={isEditing}
          formTitle={formTitle}
          formDescription={formDescription}
          onTitleChange={setFormTitle}
          onDescriptionChange={setFormDescription}
          onSubmit={isEditing ? handleUpdateGang : handleAddGang}
          onCancel={resetForm}
        />
      )}

      {/* Gangs Grid */}
      {gangs.length === 0 ? (
        <div className="panel-raised p-8 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <Users className="w-10 h-10" style={{ color: 'var(--mdt-muted-text)' }} />
          <p className="font-[family-name:var(--font-vt323)] text-lg tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
            BRAK GANGÓW
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            {canManage ? 'Włącz tryb edycji aby dodać gang.' : 'Baza danych gangów jest pusta.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gangs.map((gang) => (
            <GangCard
              key={gang.id}
              gang={gang}
              editMode={editMode}
              canManage={canManage}
              onEdit={openEditForm}
              onDelete={handleDeleteGang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
