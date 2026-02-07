'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import {
  getUserByUsername,
} from '@/src/lib/db/users';
import {
  getUserPenalties,
  deletePenalty,
  clearUserPlusMinusPenalties,
  clearUserSuspensions,
  clearUserWrittenWarnings,
} from '@/src/lib/db/penalties';
import {
  getUserNotes,
  deleteUserNote,
  clearUserNotes,
} from '@/src/lib/db/notes';
import AddNoteModal from '@/src/components/personnel/UserProfile/Modals/AddNoteModal';
import AddPlusMinusModal from '@/src/components/personnel/UserProfile/Modals/AddPlusMinusModal';
import AddPenaltyModal from '@/src/components/personnel/UserProfile/Modals/AddPenaltyModal';
import AddWrittenWarningModal from '@/src/components/personnel/UserProfile/Modals/AddWrittenWarningModal';
import BadgeEditor from '@/src/components/personnel/UserProfile/InlineEditors/BadgeEditor';
import DivisionEditor from '@/src/components/personnel/UserProfile/InlineEditors/DivisionEditor';
import PermissionsEditor from '@/src/components/personnel/UserProfile/InlineEditors/PermissionsEditor';
import {
  ChevronLeft,
  User,
  Award,
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  FileText,
  TrendingUp,
  TrendingDown,
  Trash2,
} from 'lucide-react';

/**
 * User Profile Page - Pełny profil użytkownika
 * Tylko dla CS/HCS/Dev
 */
export default function UserProfilePage() {
  const { user: currentUser, loading, isAdmin, isDev, isHCS, isCS, role, refreshUserData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activePenalties, setActivePenalties] = useState<any[]>([]);
  const [penaltyTimers, setPenaltyTimers] = useState<Record<string, number>>({});

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
    // This prevents redirect during initial load when role might be null
    if (!loading && currentUser && role && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, currentUser, role, router]);

  useEffect(() => {
    if (currentUser && isAdmin && username) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isAdmin, username]);

  // Countdown timers for penalties
  useEffect(() => {
    if (!activePenalties || activePenalties.length === 0) {
      setPenaltyTimers({});
      return;
    }

    const updateTimers = () => {
      const newTimers: Record<string, number> = {};
      activePenalties.forEach((penalty) => {
        if (penalty.remaining_seconds && penalty.remaining_seconds > 0) {
          newTimers[penalty.id] = penalty.remaining_seconds;
        }
      });
      setPenaltyTimers(newTimers);
    };

    updateTimers();

    const interval = setInterval(() => {
      setPenaltyTimers((prev) => {
        const updated: Record<string, number> = {};
        Object.keys(prev).forEach((id) => {
          const remaining = prev[id] - 1;
          if (remaining > 0) {
            updated[id] = remaining;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePenalties]);

  const loadUserData = async () => {
    try {
      setLoadingData(true);

      // First get user by username to get the ID
      const { data: userData, error: userError } = await getUserByUsername(username);
      if (userError) throw userError;
      if (!userData) {
        router.push('/personnel');
        return;
      }

      // Set userId for subsequent operations
      setUserId(userData.id);
      setUser(userData);

      if (userData) {
        // Load penalties
        const { data: penaltiesData, error: penaltiesError } = await getUserPenalties(userData.id);
        if (penaltiesError) throw penaltiesError;

        // Map created_by_user to admin_username and fix column names for display
        const mappedPenalties = (penaltiesData || []).map((p: any) => ({
          ...p,
          penalty_type: p.type,        // Map 'type' to 'penalty_type' for UI
          reason: p.description,       // Map 'description' to 'reason' for UI
          admin_username: p.created_by_user?.username || 'Unknown',
        }));
        setPenalties(mappedPenalties);

        // Active suspensions
        const active = mappedPenalties.filter((p: any) => {
          const suspensionTypes = ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe'];
          if (suspensionTypes.includes(p.penalty_type) && p.duration_hours) {
            const createdAt = new Date(p.created_at).getTime();
            const expiresAt = createdAt + p.duration_hours * 60 * 60 * 1000;
            return Date.now() < expiresAt;
          }
          return false;
        });
        setActivePenalties(active);
      }

      // Load notes
      const { data: notesData, error: notesError } = await getUserNotes(userData.id);
      if (notesError) throw notesError;

      // Map created_by_user to admin_username for display
      const mappedNotes = (notesData || []).map((n: any) => ({
        ...n,
        admin_username: n.created_by_user?.username || 'Unknown',
      }));
      setNotes(mappedNotes);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Błąd podczas ładowania danych użytkownika.');
    } finally {
      setLoadingData(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPenaltyTypeDisplay = (type: string) => {
    switch (type) {
      case 'plus':
        return 'PLUS';
      case 'minus':
        return 'MINUS';
      case 'suspension':
        return 'Zawieszenie';
      default:
        return type;
    }
  };

  const getPenaltyTypeColor = (type: string) => {
    switch (type) {
      case 'plus':
        return 'text-green-400';
      case 'minus':
        return 'text-red-400';
      case 'suspension':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  // Clear functions (CS can clear +/-, HCS+ can clear everything)
  const handleClearPlusMinusPenalties = async () => {
    if (!isCS || !confirm('Czy na pewno chcesz wyzerować całą historię PLUS/MINUS tego użytkownika?')) return;

    try {
      const { error } = await clearUserPlusMinusPenalties(userId);
      if (error) throw error;
      await loadUserData();
      // Refresh navbar data
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
      // Refresh navbar data
      if (refreshUserData) await refreshUserData();
      alert('Historia zawieszeń wyzerowana.');
    } catch (error) {
      console.error('Error clearing suspensions:', error);
      alert('Błąd podczas zerowania historii.');
    }
  };

  const handleClearWrittenWarnings = async () => {
    if (!isDev || !confirm('Czy na pewno chcesz wyzerować całą historię upomnienia pisemnych tego użytkownika?')) return;

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
    if (!isDev || !confirm('Czy na pewno chcesz wyzerować wszystkie notatki tego użytkownika?')) return;

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

  // Toggle penalty selection
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

  // Toggle note selection
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

  // Delete selected penalties
  const handleDeleteSelectedPenalties = async () => {
    if (selectedPenaltyIds.size === 0) {
      alert('Nie wybrano żadnych pozycji do usunięcia.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedPenaltyIds.size} zaznaczonych pozycji?`)) return;

    try {
      // Delete all selected penalties
      const deletePromises = Array.from(selectedPenaltyIds).map((id) => deletePenalty(id));
      await Promise.all(deletePromises);

      // Reload data
      await loadUserData();
      // Refresh navbar data
      if (refreshUserData) await refreshUserData();

      setSelectedPenaltyIds(new Set());
      alert(`Usunięto ${selectedPenaltyIds.size} pozycji.`);
    } catch (error) {
      console.error('Error deleting selected penalties:', error);
      alert('Błąd podczas usuwania pozycji.');
    }
  };

  // Delete selected notes
  const handleDeleteSelectedNotes = async () => {
    if (selectedNoteIds.size === 0) {
      alert('Nie wybrano żadnych notatek do usunięcia.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedNoteIds.size} zaznaczonych notatek?`)) return;

    try {
      // Delete all selected notes
      const deletePromises = Array.from(selectedNoteIds).map((id) => deleteUserNote(id));
      await Promise.all(deletePromises);

      // Reload data
      await loadUserData();

      setSelectedNoteIds(new Set());
      alert(`Usunięto ${selectedNoteIds.size} notatek.`);
    } catch (error) {
      console.error('Error deleting selected notes:', error);
      alert('Błąd podczas usuwania notatek.');
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#8fb5a0] text-lg">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || loadingData) {
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
          <p className="text-[#8fb5a0] text-lg">Użytkownik nie znaleziony.</p>
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
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/personnel')}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Kartoteki</span>
        </button>

        {/* User Header */}
        <div className="mb-8 glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 shadow-xl">
          <div className="flex items-start gap-6">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-24 h-24 rounded-2xl border-4 border-[#1a4d32] shadow-lg"
              />
            )}
            <div className="flex-grow">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-bold text-white">{user.mta_nick || user.username}</h2>
                  <p className="text-[#8fb5a0] text-sm">@{user.username}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold ${
                  user.role === 'dev' ? 'bg-purple-600' :
                  user.role === 'hcs' ? 'bg-red-600' :
                  user.role === 'cs' ? 'bg-[#c9a227]' :
                  user.role === 'deputy' ? 'bg-blue-600' :
                  'bg-green-600'
                } text-white`}>
                  {user.role?.toUpperCase()}
                </span>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <BadgeEditor
                  user={user}
                  currentUser={currentUser}
                  userId={userId!}
                  isHCS={isHCS}
                  isCS={isCS}
                  onUpdate={loadUserData}
                />
                <DivisionEditor
                  user={user}
                  currentUser={currentUser}
                  userId={userId!}
                  isHCS={isHCS}
                  isCS={isCS}
                  onUpdate={loadUserData}
                />
                <PermissionsEditor
                  user={user}
                  currentUser={currentUser}
                  userId={userId!}
                  isHCS={isHCS}
                  isCS={isCS}
                  onUpdate={loadUserData}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* PLUS Count */}
          <div className="glass-strong rounded-2xl border border-green-500/30 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-green-400">+{user.plus_count || 0}</span>
            </div>
            <p className="text-[#8fb5a0] text-sm">PLUS otrzymane</p>
          </div>

          {/* MINUS Count */}
          <div className="glass-strong rounded-2xl border border-red-500/30 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <TrendingDown className="w-8 h-8 text-red-400" />
              <span className="text-3xl font-bold text-red-400">-{user.minus_count || 0}</span>
            </div>
            <p className="text-[#8fb5a0] text-sm">MINUS otrzymane</p>
          </div>

          {/* Active Penalties */}
          <div className="glass-strong rounded-2xl border border-orange-500/30 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-orange-400">{activePenalties.length}</span>
            </div>
            <p className="text-[#8fb5a0] text-sm">Aktywne zawieszenia</p>
          </div>

          {/* Last Seen */}
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-8 h-8 text-[#c9a227]" />
            </div>
            <p className="text-white text-sm font-semibold mb-1">Ostatnio widziany</p>
            <p className="text-[#8fb5a0] text-xs">{formatDate(user.last_seen || user.created_at)}</p>
          </div>
        </div>

        {/* Active Suspensions */}
        {activePenalties.length > 0 && (
          <div className="mb-8">
            {isHCS && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleClearSuspensions}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
                  title="Wyzeruj wszystkie zawieszenia (HCS+)"
                >
                  <Trash2 className="w-3 h-3" />
                  Wyzeruj
                </button>
              </div>
            )}
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Aktywne Zawieszenia
            </h3>
            <div className="glass-strong rounded-2xl border border-orange-500/30 overflow-hidden shadow-xl">
              {activePenalties.map((penalty) => (
                <div
                  key={penalty.id}
                  className="p-4 border-b border-[#1a4d32]/30 last:border-b-0 hover:bg-[#0a2818]/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold mb-1">{penalty.reason}</p>
                      <p className="text-[#8fb5a0] text-xs">
                        Nadane: {formatDate(penalty.created_at)} przez {penalty.admin_username}
                      </p>
                    </div>
                    {penaltyTimers[penalty.id] && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                        <Clock className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-mono font-bold">
                          {formatTime(penaltyTimers[penalty.id])}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLUS/MINUS History */}
        <div className="mb-8">
          {isCS && (
            <div className="flex justify-end gap-2 mb-2">
              {isDev && selectedPenaltyIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedPenalties}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
                  title={`Usuń ${selectedPenaltyIds.size} zaznaczonych pozycji (DEV)`}
                >
                  <Trash2 className="w-3 h-3" />
                  Usuń zaznaczone ({selectedPenaltyIds.size})
                </button>
              )}
              <button
                onClick={handleClearPlusMinusPenalties}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
                title="Wyzeruj całą historię PLUS/MINUS (CS+)"
              >
                <Trash2 className="w-3 h-3" />
                Wyzeruj +/-
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-[#c9a227]" />
              Historia PLUS/MINUS
            </h3>
            <button
              onClick={() => setShowAddPlusMinusModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Dodaj PLUS/MINUS
            </button>
          </div>
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
            {penalties.filter((p) => p.penalty_type === 'plus' || p.penalty_type === 'minus').length === 0 ? (
              <div className="p-12 text-center">
                <Award className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Brak historii PLUS/MINUS.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                    <tr>
                      {isDev && <th className="px-4 py-4 w-12"></th>}
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Typ</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Powód</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Nadane przez</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a4d32]/30">
                    {penalties
                      .filter((p) => p.penalty_type === 'plus' || p.penalty_type === 'minus')
                      .map((penalty) => (
                        <tr key={penalty.id} className="hover:bg-[#0a2818]/30 transition-colors">
                          {isDev && (
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPenaltyIds.has(penalty.id)}
                                onChange={() => togglePenaltySelection(penalty.id)}
                                className="w-4 h-4 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className={`font-bold ${getPenaltyTypeColor(penalty.penalty_type)}`}>
                              {getPenaltyTypeDisplay(penalty.penalty_type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white">{penalty.reason}</td>
                          <td className="px-6 py-4 text-[#8fb5a0]">{penalty.admin_username}</td>
                          <td className="px-6 py-4 text-[#8fb5a0] text-sm">{formatDate(penalty.created_at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Penalties History */}
        <div className="mb-8">
          {isHCS && (
            <div className="flex justify-end gap-2 mb-2">
              {isDev && selectedPenaltyIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedPenalties}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
                  title={`Usuń ${selectedPenaltyIds.size} zaznaczonych pozycji (DEV)`}
                >
                  <Trash2 className="w-3 h-3" />
                  Usuń zaznaczone ({selectedPenaltyIds.size})
                </button>
              )}
              <button
                onClick={handleClearSuspensions}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
                title="Wyzeruj całą historię zawieszeń (HCS+)"
              >
                <Trash2 className="w-3 h-3" />
                Wyzeruj wszystko
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Historia Kar (Zawieszenia)
            </h3>
            <button
              onClick={() => setShowAddPenaltyModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              Nadaj Karę
            </button>
          </div>
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
            {penalties.filter((p) => ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe'].includes(p.penalty_type)).length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Brak historii kar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                    <tr>
                      {isDev && <th className="px-4 py-4 w-12"></th>}
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Powód</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Czas trwania</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Nadane przez</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a4d32]/30">
                    {penalties
                      .filter((p) => ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia', 'zawieszenie_poscigowe'].includes(p.penalty_type))
                      .map((penalty) => (
                        <tr key={penalty.id} className="hover:bg-[#0a2818]/30 transition-colors">
                          {isDev && (
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPenaltyIds.has(penalty.id)}
                                onChange={() => togglePenaltySelection(penalty.id)}
                                className="w-4 h-4 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 text-white">{penalty.reason}</td>
                          <td className="px-6 py-4 text-orange-400 font-semibold">
                            {penalty.duration_hours ? `${penalty.duration_hours}h` : 'Permanentne'}
                          </td>
                          <td className="px-6 py-4 text-[#8fb5a0]">{penalty.admin_username}</td>
                          <td className="px-6 py-4 text-[#8fb5a0] text-sm">{formatDate(penalty.created_at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Written Warnings History */}
        <div className="mb-8">
          {isDev && (
            <div className="flex justify-end gap-2 mb-2">
              {selectedPenaltyIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedPenalties}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
                  title={`Usuń ${selectedPenaltyIds.size} zaznaczonych pozycji`}
                >
                  <Trash2 className="w-3 h-3" />
                  Usuń zaznaczone ({selectedPenaltyIds.size})
                </button>
              )}
              <button
                onClick={handleClearWrittenWarnings}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
                title="Wyzeruj całą historię upomnienia pisemnych (DEV)"
              >
                <Trash2 className="w-3 h-3" />
                Wyzeruj wszystko
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-400" />
              Historia Upomnienia Pisemne
            </h3>
            <button
              onClick={() => setShowAddWrittenWarningModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <FileText className="w-4 h-4" />
              Nadaj Upomnienie
            </button>
          </div>
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
            {penalties.filter((p) => p.penalty_type === 'upomnienie_pisemne').length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Brak upomnienia pisemnego.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                    <tr>
                      {isDev && <th className="px-4 py-4 w-12"></th>}
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Powód</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Nadane przez</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a4d32]/30">
                    {penalties
                      .filter((p) => p.penalty_type === 'upomnienie_pisemne')
                      .map((penalty) => (
                        <tr key={penalty.id} className="hover:bg-[#0a2818]/30 transition-colors">
                          {isDev && (
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedPenaltyIds.has(penalty.id)}
                                onChange={() => togglePenaltySelection(penalty.id)}
                                className="w-4 h-4 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4 text-white">{penalty.reason}</td>
                          <td className="px-6 py-4 text-[#8fb5a0]">{penalty.admin_username}</td>
                          <td className="px-6 py-4 text-[#8fb5a0] text-sm">{formatDate(penalty.created_at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Private Notes */}
        <div className="mb-8">
          {isDev && (
            <div className="flex justify-end gap-2 mb-2">
              {selectedNoteIds.size > 0 && (
                <button
                  onClick={handleDeleteSelectedNotes}
                  className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
                  title={`Usuń ${selectedNoteIds.size} zaznaczonych notatek`}
                >
                  <Trash2 className="w-3 h-3" />
                  Usuń zaznaczone ({selectedNoteIds.size})
                </button>
              )}
              <button
                onClick={handleClearUserNotes}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
                title="Wyzeruj wszystkie notatki (DEV)"
              >
                <Trash2 className="w-3 h-3" />
                Wyzeruj wszystko
              </button>
            </div>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#c9a227]" />
              Notatki Prywatne (Admin)
            </h3>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Dodaj Notatkę
            </button>
          </div>
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
            {notes.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Brak notatek.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#1a4d32]/30">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-6 hover:bg-[#0a2818]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {isDev && (
                        <input
                          type="checkbox"
                          checked={selectedNoteIds.has(note.id)}
                          onChange={() => toggleNoteSelection(note.id)}
                          className="w-4 h-4 mt-1 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#c9a227] font-semibold">{note.admin_username}</span>
                          <span className="text-[#8fb5a0] text-xs">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-white">{note.note}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLUS/MINUS Modal */}
      <AddPlusMinusModal
        isOpen={showAddPlusMinusModal}
        onClose={() => setShowAddPlusMinusModal(false)}
        userId={userId}
        currentUser={currentUser}
        user={user}
        onSuccess={loadUserData}
        refreshUserData={refreshUserData}
      />

      {/* Penalty Modal */}
      <AddPenaltyModal
        isOpen={showAddPenaltyModal}
        onClose={() => setShowAddPenaltyModal(false)}
        userId={userId}
        currentUser={currentUser}
        user={user}
        onSuccess={loadUserData}
        refreshUserData={refreshUserData}
      />

      {/* Note Modal */}
      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        userId={userId}
        currentUserId={currentUser?.id}
        onSuccess={loadUserData}
      />

      {/* Written Warning Modal */}
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
