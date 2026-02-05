'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import {
  getUserWithDetails,
  getUserPenalties,
  getUserNotes,
  updateUserBadge,
  updateUserDivision,
  updateUserPermissions,
  updateIsCommander,
} from '@/src/utils/supabaseHelpers';
import {
  ChevronLeft,
  User,
  Award,
  Shield,
  Calendar,
  Clock,
  Plus,
  Minus,
  AlertTriangle,
  FileText,
  Edit3,
  Save,
  X,
  Check,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react';

/**
 * User Profile Page - Pełny profil użytkownika
 * Tylko dla admin/dev
 */
export default function UserProfilePage() {
  const { user: currentUser, loading, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<any>(null);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activePenalties, setActivePenalties] = useState<any[]>([]);
  const [penaltyTimers, setPenaltyTimers] = useState<Record<string, number>>({});

  // Inline editing
  const [editingBadge, setEditingBadge] = useState(false);
  const [editingDivision, setEditingDivision] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [tempBadge, setTempBadge] = useState('');
  const [tempDivision, setTempDivision] = useState('');
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  const [tempIsCommander, setTempIsCommander] = useState(false);

  // Modal states (będą użyte w następnym kroku)
  const [showAddPlusMinusModal, setShowAddPlusMinusModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  const submittingRef = useRef(false);

  const badges = [
    'Rekrut', 'Oficer I', 'Oficer II', 'Oficer III', 'Oficer III+I',
    'Detektyw I', 'Detektyw II', 'Detektyw III',
    'Sierżant I', 'Sierżant II', 'Sierżant III',
    'Porucznik I', 'Porucznik II', 'Porucznik III',
    'Kapitan I', 'Kapitan II', 'Szef'
  ];

  const divisions = ['FTO', 'SS', 'DTU', 'GU'];
  const permissions = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch'];

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    if (!loading && currentUser && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, currentUser, router]);

  useEffect(() => {
    if (currentUser && isAdmin) {
      loadUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isAdmin, userId]);

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

      // Load user details
      const { data: userData, error: userError } = await getUserWithDetails(userId);
      if (userError) throw userError;
      setUser(userData);

      // Set temp values
      if (userData) {
        setTempBadge(userData.badge || '');
        setTempDivision(userData.division || '');
        setTempPermissions(userData.permissions || []);
        setTempIsCommander(userData.is_commander || false);

        // Filter active penalties
        const { data: penaltiesData, error: penaltiesError } = await getUserPenalties(userId);
        if (penaltiesError) throw penaltiesError;
        setPenalties(penaltiesData || []);

        // Active suspensions
        const active = (penaltiesData || []).filter((p: any) => {
          if (p.penalty_type === 'suspension' && p.duration_hours) {
            const createdAt = new Date(p.created_at).getTime();
            const expiresAt = createdAt + p.duration_hours * 60 * 60 * 1000;
            return Date.now() < expiresAt;
          }
          return false;
        });
        setActivePenalties(active);
      }

      // Load notes
      const { data: notesData, error: notesError } = await getUserNotes(userId);
      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Błąd podczas ładowania danych użytkownika.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveBadge = async () => {
    if (submittingRef.current || !user) return;
    submittingRef.current = true;

    try {
      const { error } = await updateUserBadge(userId, tempBadge || null);
      if (error) throw error;

      setUser({ ...user, badge: tempBadge });
      setEditingBadge(false);
      alert('Stopień zaktualizowany.');
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Błąd podczas aktualizacji stopnia.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleSaveDivision = async () => {
    if (submittingRef.current || !user) return;
    submittingRef.current = true;

    try {
      // Update division
      const { error: divError } = await updateUserDivision(userId, tempDivision || null);
      if (divError) throw divError;

      // Update commander status
      const { error: cmdError } = await updateIsCommander(userId, tempIsCommander);
      if (cmdError) throw cmdError;

      setUser({ ...user, division: tempDivision, is_commander: tempIsCommander });
      setEditingDivision(false);
      alert('Dywizja zaktualizowana.');
    } catch (error) {
      console.error('Error updating division:', error);
      alert('Błąd podczas aktualizacji dywizji.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleSavePermissions = async () => {
    if (submittingRef.current || !user) return;
    submittingRef.current = true;

    try {
      const { error } = await updateUserPermissions(userId, tempPermissions);
      if (error) throw error;

      setUser({ ...user, permissions: tempPermissions });
      setEditingPermissions(false);
      alert('Uprawnienia zaktualizowane.');
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Błąd podczas aktualizacji uprawnień.');
    } finally {
      submittingRef.current = false;
    }
  };

  const togglePermission = (perm: string) => {
    if (tempPermissions.includes(perm)) {
      setTempPermissions(tempPermissions.filter((p) => p !== perm));
    } else {
      setTempPermissions([...tempPermissions, perm]);
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

  const getDivisionColor = (division: string | null) => {
    switch (division) {
      case 'FTO':
        return 'bg-[#c9a227] text-[#020a06]';
      case 'SS':
        return 'bg-[#ff8c00] text-white';
      case 'DTU':
        return 'bg-[#1e3a8a] text-white';
      case 'GU':
        return 'bg-[#10b981] text-white';
      default:
        return 'bg-gray-600 text-white';
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
          onClick={() => router.push('/kartoteka')}
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
                <h2 className="text-3xl font-bold text-white">{user.username}</h2>
                <span className={`px-3 py-1 rounded text-xs font-bold ${user.role === 'dev' ? 'bg-purple-600' : user.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                  {user.role}
                </span>
              </div>
              {user.mta_nick && (
                <p className="text-[#8fb5a0] mb-4">MTA Nick: {user.mta_nick}</p>
              )}
              {user.email && (
                <p className="text-[#8fb5a0] text-sm mb-4">{user.email}</p>
              )}

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Badge */}
                <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#c9a227]" />
                      <span className="text-[#8fb5a0] text-sm">Stopień</span>
                    </div>
                    {!editingBadge && (
                      <button
                        onClick={() => setEditingBadge(true)}
                        className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingBadge ? (
                    <div className="space-y-2">
                      <select
                        value={tempBadge}
                        onChange={(e) => setTempBadge(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a2818]/50 border border-[#1a4d32] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a227]"
                      >
                        <option value="">Brak</option>
                        {badges.map((badge) => (
                          <option key={badge} value={badge}>
                            {badge}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveBadge}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Zapisz
                        </button>
                        <button
                          onClick={() => {
                            setEditingBadge(false);
                            setTempBadge(user.badge || '');
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0a2818] text-white text-xs rounded-lg hover:bg-[#133524] transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white font-semibold">{user.badge || 'Brak'}</p>
                  )}
                </div>

                {/* Division */}
                <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#c9a227]" />
                      <span className="text-[#8fb5a0] text-sm">Dywizja</span>
                    </div>
                    {!editingDivision && (
                      <button
                        onClick={() => setEditingDivision(true)}
                        className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingDivision ? (
                    <div className="space-y-2">
                      <select
                        value={tempDivision}
                        onChange={(e) => setTempDivision(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a2818]/50 border border-[#1a4d32] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a227]"
                      >
                        <option value="">Brak</option>
                        {divisions.map((div) => (
                          <option key={div} value={div}>
                            {div}
                          </option>
                        ))}
                      </select>
                      {tempDivision && (
                        <label className="flex items-center gap-2 text-sm text-[#8fb5a0]">
                          <input
                            type="checkbox"
                            checked={tempIsCommander}
                            onChange={(e) => setTempIsCommander(e.target.checked)}
                            className="rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227]"
                          />
                          Commander
                        </label>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveDivision}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Zapisz
                        </button>
                        <button
                          onClick={() => {
                            setEditingDivision(false);
                            setTempDivision(user.division || '');
                            setTempIsCommander(user.is_commander || false);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0a2818] text-white text-xs rounded-lg hover:bg-[#133524] transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.division ? (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getDivisionColor(user.division)}`}>
                          {user.division}{user.is_commander ? ' CMD' : ''}
                        </span>
                      ) : (
                        <span className="text-white">Brak</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Permissions */}
                <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#c9a227]" />
                      <span className="text-[#8fb5a0] text-sm">Uprawnienia</span>
                    </div>
                    {!editingPermissions && (
                      <button
                        onClick={() => setEditingPermissions(true)}
                        className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {editingPermissions ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <button
                            key={perm}
                            onClick={() => togglePermission(perm)}
                            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                              tempPermissions.includes(perm)
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                            }`}
                          >
                            {perm}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSavePermissions}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save className="w-3 h-3" />
                          Zapisz
                        </button>
                        <button
                          onClick={() => {
                            setEditingPermissions(false);
                            setTempPermissions(user.permissions || []);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0a2818] text-white text-xs rounded-lg hover:bg-[#133524] transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Anuluj
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.permissions && user.permissions.length > 0 ? (
                        user.permissions.map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white"
                          >
                            {perm}
                          </span>
                        ))
                      ) : (
                        <span className="text-white">Brak</span>
                      )}
                    </div>
                  )}
                </div>
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
            {penalties.filter((p) => p.penalty_type === 'suspension').length === 0 ? (
              <div className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
                <p className="text-[#8fb5a0]">Brak historii kar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Powód</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Czas trwania</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Nadane przez</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a4d32]/30">
                    {penalties
                      .filter((p) => p.penalty_type === 'suspension')
                      .map((penalty) => (
                        <tr key={penalty.id} className="hover:bg-[#0a2818]/30 transition-colors">
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

        {/* Private Notes */}
        <div className="mb-8">
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
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#c9a227] font-semibold">{note.admin_username}</span>
                        <span className="text-[#8fb5a0] text-xs">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-white">{note.note_text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TODO: Modals będą dodane w następnym kroku */}
      {showAddPlusMinusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Dodaj PLUS/MINUS</h3>
            <p className="text-[#8fb5a0] mb-4">Funkcja w przygotowaniu...</p>
            <button
              onClick={() => setShowAddPlusMinusModal(false)}
              className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {showAddPenaltyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Nadaj Karę</h3>
            <p className="text-[#8fb5a0] mb-4">Funkcja w przygotowaniu...</p>
            <button
              onClick={() => setShowAddPenaltyModal(false)}
              className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Dodaj Notatkę</h3>
            <p className="text-[#8fb5a0] mb-4">Funkcja w przygotowaniu...</p>
            <button
              onClick={() => setShowAddNoteModal(false)}
              className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
