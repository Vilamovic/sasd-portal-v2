'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { formatDate } from '@/src/components/shared/constants';
import { deletePenalty, clearUserPlusMinusPenalties, clearUserSuspensions, clearUserWrittenWarnings } from '@/src/lib/db/penalties';
import { deleteUserNote, clearUserNotes } from '@/src/lib/db/notes';
import AddNoteModal from './Modals/AddNoteModal';
import AddPlusMinusModal from './Modals/AddPlusMinusModal';
import AddPenaltyModal from './Modals/AddPenaltyModal';
import AddWrittenWarningModal from './Modals/AddWrittenWarningModal';
import ProfileHeader from './ProfileHeader';
import ProfileStats from './ProfileStats';
import ActiveSuspensions from './ActiveSuspensions';
import PenaltiesTable from './Tables/PenaltiesTable';
import NotesTable from './Tables/NotesTable';
import { useUserProfile } from './hooks/useUserProfile';
import { usePenaltyTimers } from './hooks/usePenaltyTimers';
import { ChevronLeft, User, Plus, AlertTriangle, FileText } from 'lucide-react';

interface UserProfilePageProps {
  username: string;
}

/**
 * User Profile Page - Orchestrator komponent profilu użytkownika
 * Tylko dla CS/HCS/Dev
 */
export default function UserProfilePage({ username }: UserProfilePageProps) {
  const { user: currentUser, loading, isAdmin, isDev, isHCS, isCS, role, refreshUserData } = useAuth();
  const router = useRouter();

  // User profile data (via hook)
  const { user, userId, penalties, notes, loadingData, activePenalties, loadUserData } = useUserProfile(username);

  // Penalty timers (via hook)
  const penaltyTimers = usePenaltyTimers(activePenalties);

  // Modal states
  const [showAddPlusMinusModal, setShowAddPlusMinusModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [showAddWrittenWarningModal, setShowAddWrittenWarningModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Selection state for batch delete
  const [selectedPenaltyIds, setSelectedPenaltyIds] = useState<Set<string>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    // Only redirect if role is loaded and user is not admin
    if (!loading && currentUser && role && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, currentUser, role, router]);

  // Format functions
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };


  // Clear functions
  const handleClearPlusMinusPenalties = async () => {
    if (!isCS || !confirm('Czy na pewno chcesz wyzerować całą historię PLUS/MINUS tego użytkownika?')) return;
    try {
      const { error } = await clearUserPlusMinusPenalties(userId);
      if (error) throw error;
      await loadUserData();
      if (refreshUserData) await refreshUserData();
      alert('Historia PLUS/MINUS wyzerowana.');
    } catch (error) {
      console.error('Error clearing PLUS/MINUS:', error);
      alert('Błąd podczas zerowania historii.');
    }
  };

  const handleClearSuspensions = async () => {
    if (!isHCS || !confirm('Czy na pewno chcesz wyzerować całą historię zawieszeń tego użytkownika?')) return;
    try {
      const { error } = await clearUserSuspensions(userId);
      if (error) throw error;
      await loadUserData();
      if (refreshUserData) await refreshUserData();
      alert('Historia zawieszeń wyzerowana.');
    } catch (error) {
      console.error('Error clearing suspensions:', error);
      alert('Błąd podczas zerowania historii.');
    }
  };

  const handleClearWrittenWarnings = async () => {
    if (!isCS || !confirm('Czy na pewno chcesz wyzerować całą historię upomnienia pisemnych tego użytkownika?')) return;
    try {
      const { error } = await clearUserWrittenWarnings(userId);
      if (error) throw error;
      await loadUserData();
      alert('Historia upomnienia pisemnych wyzerowana.');
    } catch (error) {
      console.error('Error clearing written warnings:', error);
      alert('Błąd podczas zerowania historii.');
    }
  };

  const handleClearUserNotes = async () => {
    if (!isCS || !confirm('Czy na pewno chcesz wyzerować wszystkie notatki tego użytkownika?')) return;
    try {
      const { error } = await clearUserNotes(userId);
      if (error) throw error;
      await loadUserData();
      alert('Notatki wyzerowane.');
    } catch (error) {
      console.error('Error clearing notes:', error);
      alert('Błąd podczas zerowania notatek.');
    }
  };

  // Toggle selection
  const togglePenaltySelection = (penaltyId: string) => {
    setSelectedPenaltyIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(penaltyId)) {
        newSet.delete(penaltyId);
      } else {
        newSet.add(penaltyId);
      }
      return newSet;
    });
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  // Delete selected
  const handleDeleteSelectedPenalties = async () => {
    if (selectedPenaltyIds.size === 0) {
      alert('Nie wybrano żadnych pozycji do usunięcia.');
      return;
    }
    if (!confirm(`Czy na pewno chcesz usunąć ${selectedPenaltyIds.size} zaznaczonych pozycji?`)) return;

    try {
      const deletePromises = Array.from(selectedPenaltyIds).map((id) => deletePenalty(id));
      await Promise.all(deletePromises);
      await loadUserData();
      if (refreshUserData) await refreshUserData();
      setSelectedPenaltyIds(new Set());
      alert(`Usunięto ${selectedPenaltyIds.size} pozycji.`);
    } catch (error) {
      console.error('Error deleting selected penalties:', error);
      alert('Błąd podczas usuwania pozycji.');
    }
  };

  const handleDeleteSelectedNotes = async () => {
    if (selectedNoteIds.size === 0) {
      alert('Nie wybrano żadnych notatek do usunięcia.');
      return;
    }
    if (!confirm(`Czy na pewno chcesz usunąć ${selectedNoteIds.size} zaznaczonych notatek?`)) return;

    try {
      const deletePromises = Array.from(selectedNoteIds).map((id) => deleteUserNote(id));
      await Promise.all(deletePromises);
      await loadUserData();
      setSelectedNoteIds(new Set());
      alert(`Usunięto ${selectedNoteIds.size} notatek.`);
    } catch (error) {
      console.error('Error deleting selected notes:', error);
      alert('Błąd podczas usuwania notatek.');
    }
  };

  // Loading state
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="panel-raised p-8 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || loadingData) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="panel-raised p-8 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--mdt-muted-text)' }} />
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Użytkownik nie znaleziony.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/personnel')}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Kartoteki</span>
        </button>

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          currentUser={currentUser}
          userId={userId!}
          isHCS={isHCS}
          isCS={isCS}
          isDev={isDev}
          onUpdate={loadUserData}
        />

        {/* Statistics Grid */}
        <ProfileStats
          user={user}
          activePenaltiesCount={activePenalties.length}
          formatDate={formatDate}
        />

        {/* Active Suspensions */}
        <ActiveSuspensions
          activePenalties={activePenalties}
          penaltyTimers={penaltyTimers}
          isHCS={isHCS}
          onClear={handleClearSuspensions}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        {/* PLUS/MINUS History */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <button
            onClick={() => setShowAddPlusMinusModal(true)}
            className="btn-win95 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Dodaj PLUS/MINUS
          </button>
        </div>
        <PenaltiesTable
          penalties={penalties.filter((p) => p.penalty_type === 'plus' || p.penalty_type === 'minus')}
          section="plusminus"
          selectedIds={selectedPenaltyIds}
          onToggleSelection={togglePenaltySelection}
          onClear={handleClearPlusMinusPenalties}
          onDeleteSelected={handleDeleteSelectedPenalties}
          isDev={isDev}
          isHCS={isHCS}
          isCS={isCS}
        />

        {/* Suspensions History */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <button
            onClick={() => setShowAddPenaltyModal(true)}
            className="btn-win95 flex items-center gap-2"
            style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
          >
            <AlertTriangle className="w-4 h-4" />
            Nadaj Karę
          </button>
        </div>
        <PenaltiesTable
          penalties={penalties.filter((p) => ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe'].includes(p.penalty_type))}
          section="suspensions"
          selectedIds={selectedPenaltyIds}
          onToggleSelection={togglePenaltySelection}
          onClear={handleClearSuspensions}
          onDeleteSelected={handleDeleteSelectedPenalties}
          isDev={isDev}
          isHCS={isHCS}
          isCS={isCS}
        />

        {/* Written Warnings History */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <button
            onClick={() => setShowAddWrittenWarningModal(true)}
            className="btn-win95 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Nadaj Upomnienie
          </button>
        </div>
        <PenaltiesTable
          penalties={penalties.filter((p) => p.penalty_type === 'upomnienie_pisemne')}
          section="warnings"
          selectedIds={selectedPenaltyIds}
          onToggleSelection={togglePenaltySelection}
          onClear={handleClearWrittenWarnings}
          onDeleteSelected={handleDeleteSelectedPenalties}
          isDev={isDev}
          isHCS={isHCS}
          isCS={isCS}
        />

        {/* Private Notes */}
        <NotesTable
          notes={notes}
          selectedIds={selectedNoteIds}
          onToggleSelection={toggleNoteSelection}
          onClear={handleClearUserNotes}
          onDeleteSelected={handleDeleteSelectedNotes}
          onAddNote={() => setShowAddNoteModal(true)}
          isCS={isCS}
        />
      </div>

      {/* Modals */}
      <AddPlusMinusModal
        isOpen={showAddPlusMinusModal}
        onClose={() => setShowAddPlusMinusModal(false)}
        userId={userId}
        currentUser={currentUser}
        user={user}
        onSuccess={loadUserData}
        refreshUserData={refreshUserData}
      />
      <AddPenaltyModal
        isOpen={showAddPenaltyModal}
        onClose={() => setShowAddPenaltyModal(false)}
        userId={userId}
        currentUser={currentUser}
        user={user}
        onSuccess={loadUserData}
        refreshUserData={refreshUserData}
      />
      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        userId={userId}
        currentUserId={currentUser?.id}
        onSuccess={loadUserData}
      />
      <AddWrittenWarningModal
        isOpen={showAddWrittenWarningModal}
        onClose={() => setShowAddWrittenWarningModal(false)}
        userId={userId}
        currentUser={currentUser}
        user={user}
        onSuccess={loadUserData}
        refreshUserData={refreshUserData}
      />
    </div>
  );
}
