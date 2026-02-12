'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Users, Plus, Settings, Trash2, UserPlus, UserMinus, ChevronDown } from 'lucide-react';
import { useFtoAttendance } from './hooks/useFtoAttendance';
import AttendanceTable from './AttendanceTable';
import LoadingState from '@/src/components/shared/LoadingState';

export default function FtoAttendancePage() {
  const { user, isCS } = useAuth();
  const {
    groups,
    selectedGroup,
    selectedGroupId,
    setSelectedGroupId,
    attendance,
    selectedDate,
    setSelectedDate,
    trainees,
    ftoMembers,
    loading,
    saving,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleAddMember,
    handleRemoveMember,
    handleMarkAttendance,
  } = useFtoAttendance(user?.id);

  // Group management state
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupFto1, setGroupFto1] = useState('');
  const [groupFto2, setGroupFto2] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (loading) {
    return <LoadingState message="Ładowanie systemu obecności..." />;
  }

  const resetGroupForm = () => {
    setGroupName('');
    setGroupFto1('');
    setGroupFto2('');
    setShowGroupForm(false);
    setEditingGroup(null);
  };

  const onSubmitGroup = async () => {
    if (!groupName.trim()) return;
    if (editingGroup) {
      await handleUpdateGroup(editingGroup, {
        name: groupName,
        fto1_id: groupFto1 || null,
        fto2_id: groupFto2 || null,
      });
    } else {
      await handleCreateGroup(groupName, groupFto1 || null, groupFto2 || null);
    }
    resetGroupForm();
  };

  const openEditGroup = (group: typeof selectedGroup) => {
    if (!group) return;
    setGroupName(group.name);
    setGroupFto1(group.fto1_id || '');
    setGroupFto2(group.fto2_id || '');
    setEditingGroup(group.id);
    setShowGroupForm(true);
  };

  const onAddMember = async () => {
    if (!selectedGroupId || !newMemberId) return;
    await handleAddMember(selectedGroupId, newMemberId);
    setNewMemberId('');
    setShowAddMember(false);
  };

  // Members already in this group (to filter out from picker)
  const existingMemberIds = selectedGroup?.members.map((m) => m.user_id) || [];

  return (
    <div>
      {/* Header */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: '#c9a227' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              System Obecności FTO
            </span>
          </div>
          <span className="font-mono text-xs text-white opacity-80">
            {groups.length} grup
          </span>
        </div>

        {/* Controls */}
        <div className="p-3 flex flex-wrap items-center gap-3">
          {/* Group selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>Grupa:</span>
            <div className="relative">
              <select
                value={selectedGroupId || ''}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                className="panel-inset px-2 py-1 font-mono text-xs pr-6 min-w-[160px]"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">-- wybierz grupę --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--mdt-muted-text)' }} />
            </div>
          </div>

          {/* Date picker */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>Data:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="panel-inset px-2 py-1 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
            />
          </div>

          {/* CS+ actions */}
          {isCS && (
            <div className="flex items-center gap-2 ml-auto">
              {selectedGroup && (
                <>
                  <button
                    onClick={() => openEditGroup(selectedGroup)}
                    className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
                  >
                    <Settings className="w-3 h-3" />
                    Edytuj grupę
                  </button>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
                    style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                  >
                    <UserPlus className="w-3 h-3" />
                    Dodaj osobę
                  </button>
                </>
              )}
              <button
                onClick={() => { resetGroupForm(); setShowGroupForm(true); }}
                className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
                style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
              >
                <Plus className="w-3 h-3" />
                Nowa grupa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Group Form (CS+ only) */}
      {showGroupForm && isCS && (
        <div className="panel-raised mb-4 p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-sm tracking-widest mb-3" style={{ color: 'var(--mdt-content-text)' }}>
            {editingGroup ? 'EDYTUJ GRUPĘ' : 'NOWA GRUPA'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Nazwa grupy</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
                placeholder="np. Grupa A"
              />
            </div>
            <div>
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>FTO #1</label>
              <select
                value={groupFto1}
                onChange={(e) => setGroupFto1(e.target.value)}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">-- brak --</option>
                {ftoMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.mta_nick || m.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>FTO #2</label>
              <select
                value={groupFto2}
                onChange={(e) => setGroupFto2(e.target.value)}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">-- brak --</option>
                {ftoMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.mta_nick || m.username}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSubmitGroup} className="btn-win95 text-xs" style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}>
              {editingGroup ? 'ZAPISZ' : 'UTWÓRZ'}
            </button>
            <button onClick={resetGroupForm} className="btn-win95 text-xs">ANULUJ</button>
            {editingGroup && (
              <button
                onClick={() => setConfirmDelete(editingGroup)}
                className="btn-win95 text-xs ml-auto"
                style={{ backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#a33 #511 #511 #a33' }}
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                USUŃ GRUPĘ
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && selectedGroup && isCS && (
        <div className="panel-raised mb-4 p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-sm tracking-widest mb-3" style={{ color: 'var(--mdt-content-text)' }}>
            DODAJ OSOBĘ DO GRUPY
          </h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Wybierz osobę</label>
              <select
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">-- wybierz --</option>
                {trainees.filter((t) => !existingMemberIds.includes(t.id)).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.mta_nick || t.username} ({t.role})
                  </option>
                ))}
              </select>
            </div>
            <button onClick={onAddMember} className="btn-win95 text-xs" style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}>
              DODAJ
            </button>
            <button onClick={() => { setShowAddMember(false); setNewMemberId(''); }} className="btn-win95 text-xs">
              ANULUJ
            </button>
          </div>
        </div>
      )}

      {/* Selected Group Info */}
      {selectedGroup && (
        <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1" style={{ backgroundColor: '#c9a227' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest text-white uppercase">
              {selectedGroup.name}
            </span>
          </div>
          <div className="p-3">
            <div className="flex flex-wrap items-center gap-4 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              <span>
                FTO: <strong style={{ color: 'var(--mdt-content-text)' }}>
                  {selectedGroup.fto1?.mta_nick || selectedGroup.fto1?.username || '—'}
                </strong>
                {selectedGroup.fto2 && (
                  <>, <strong style={{ color: 'var(--mdt-content-text)' }}>
                    {selectedGroup.fto2.mta_nick || selectedGroup.fto2.username}
                  </strong></>
                )}
              </span>
              <span>
                Członkowie: <strong style={{ color: 'var(--mdt-content-text)' }}>{selectedGroup.members.length}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {selectedGroup ? (
        <AttendanceTable
          group={selectedGroup}
          attendance={attendance}
          selectedDate={selectedDate}
          saving={saving}
          isCS={isCS}
          onMarkAttendance={(userId, status) =>
            handleMarkAttendance(selectedGroup.id, userId, selectedDate, status)
          }
          onRemoveMember={(userId) => handleRemoveMember(selectedGroup.id, userId)}
        />
      ) : (
        <div className="panel-raised p-8 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <Users className="w-10 h-10" style={{ color: 'var(--mdt-muted-text)' }} />
          <p className="font-[family-name:var(--font-vt323)] text-lg tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
            {groups.length === 0 ? 'BRAK GRUP SZKOLENIOWYCH' : 'WYBIERZ GRUPĘ'}
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            {groups.length === 0 && isCS
              ? 'Kliknij "Nowa grupa" aby utworzyć pierwszą grupę.'
              : groups.length === 0
              ? 'Brak grup szkoleniowych. Skontaktuj się z CS+.'
              : 'Wybierz grupę z listy powyżej.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="panel-raised w-full max-w-sm mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="px-3 py-1" style={{ backgroundColor: '#8b1a1a' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest text-white uppercase">
                Potwierdź usunięcie
              </span>
            </div>
            <div className="p-4">
              <p className="font-mono text-xs mb-4" style={{ color: 'var(--mdt-content-text)' }}>
                Czy na pewno chcesz usunąć tę grupę? Wszystkie dane obecności zostaną usunięte.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    await handleDeleteGroup(confirmDelete);
                    setConfirmDelete(null);
                    resetGroupForm();
                  }}
                  className="btn-win95 text-xs"
                  style={{ backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#a33 #511 #511 #a33' }}
                >
                  USUŃ
                </button>
                <button onClick={() => setConfirmDelete(null)} className="btn-win95 text-xs">
                  ANULUJ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
