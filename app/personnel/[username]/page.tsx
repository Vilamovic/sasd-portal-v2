'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import {
  getUserWithDetails,
  getUserByUsername,
  getUserPenalties,
  getUserNotes,
  updateUserBadge,
  updateUserDivision,
  updateUserPermissions,
  updateIsCommander,
  addPenalty,
  addUserNote,
} from '@/src/utils/supabaseHelpers';
import { notifyPenalty, notifyBadgeChange, notifyPermissionChange, notifyDivisionChange } from '@/src/utils/discord';
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
  const { user: currentUser, loading, isAdmin, role } = useAuth();
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

  // Inline editing
  const [editingBadge, setEditingBadge] = useState(false);
  const [editingDivision, setEditingDivision] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState(false);
  const [tempBadge, setTempBadge] = useState('');
  const [tempDivision, setTempDivision] = useState('');
  const [tempPermissions, setTempPermissions] = useState<string[]>([]);
  const [tempIsCommander, setTempIsCommander] = useState(false);

  // Modal states
  const [showAddPlusMinusModal, setShowAddPlusMinusModal] = useState(false);
  const [showAddPenaltyModal, setShowAddPenaltyModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);

  // Modal form states
  const [plusMinusType, setPlusMinusType] = useState<'plus' | 'minus'>('plus');
  const [plusMinusReason, setPlusMinusReason] = useState('');
  const [penaltyType, setPenaltyType] = useState<'zawieszenie_sluzba' | 'upomnienie_pisemne'>('zawieszenie_sluzba');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyDuration, setPenaltyDuration] = useState('24');
  const [penaltyEvidenceLink, setPenaltyEvidenceLink] = useState('');
  const [noteText, setNoteText] = useState('');

  const submittingRef = useRef(false);

  const badges = [
    'Trainee',
    'Deputy Sheriff I',
    'Deputy Sheriff II',
    'Deputy Sheriff III',
    'Senior Deputy Sheriff',
    'Sergeant I',
    'Sergeant II',
    'Detective I',
    'Detective II',
    'Detective III',
    'Lieutenant',
    'Captain I',
    'Captain II',
    'Captain III',
    'Area Commander',
    'Division Chief',
    'Assistant Sheriff',
    'Undersheriff',
    'Sheriff'
  ];

  const divisions = ['FTO', 'SS', 'DTU', 'GU'];
  const permissions = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch'];

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

      // Set temp values
      if (userData) {
        setTempBadge(userData.badge || '');
        setTempDivision(userData.division || '');
        setTempPermissions(userData.permissions || []);
        setTempIsCommander(userData.is_commander || false);

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
          const suspensionTypes = ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia'];
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

  const handleSaveBadge = async () => {
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldBadge = user.badge;
      const { error } = await updateUserBadge(userId, tempBadge || null);
      if (error) throw error;

      // Discord webhook
      if (oldBadge !== tempBadge) {
        const badgesList = [
          'Trainee', 'Deputy Sheriff I', 'Deputy Sheriff II', 'Deputy Sheriff III',
          'Senior Deputy Sheriff', 'Sergeant I', 'Sergeant II',
          'Detective I', 'Detective II', 'Detective III',
          'Lieutenant', 'Captain I', 'Captain II', 'Captain III',
          'Area Commander', 'Division Chief', 'Assistant Sheriff', 'Undersheriff', 'Sheriff'
        ];
        const oldIndex = badgesList.indexOf(oldBadge || '');
        const newIndex = badgesList.indexOf(tempBadge || '');
        const isPromotion = newIndex > oldIndex;

        await notifyBadgeChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          oldBadge: oldBadge || 'Brak',
          newBadge: tempBadge || 'Brak',
          isPromotion,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
        });
      }

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
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldDivision = user.division;

      // Update division
      const { error: divError } = await updateUserDivision(userId, tempDivision || null);
      if (divError) throw divError;

      // Update commander status
      const { error: cmdError } = await updateIsCommander(userId, tempIsCommander);
      if (cmdError) throw cmdError;

      // Discord webhook
      if (oldDivision !== tempDivision) {
        if (tempDivision) {
          // Nadanie dywizji
          await notifyDivisionChange({
            user: { username: user.username, mta_nick: user.mta_nick },
            division: tempDivision,
            isGranted: true,
            isCommander: tempIsCommander,
            createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
          });
        } else if (oldDivision) {
          // Odebranie dywizji
          await notifyDivisionChange({
            user: { username: user.username, mta_nick: user.mta_nick },
            division: oldDivision,
            isGranted: false,
            isCommander: false,
            createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
          });
        }
      }

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
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldPermissions = user.permissions || [];
      const { error } = await updateUserPermissions(userId, tempPermissions);
      if (error) throw error;

      // Discord webhooks - powiadomienie o każdej zmianie
      const added = tempPermissions.filter((p: string) => !oldPermissions.includes(p));
      const removed = oldPermissions.filter((p: string) => !tempPermissions.includes(p));

      for (const permission of added) {
        await notifyPermissionChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          permission,
          isGranted: true,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
        });
      }

      for (const permission of removed) {
        await notifyPermissionChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          permission,
          isGranted: false,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
        });
      }

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

  // Modal handlers
  const handleAddPlusMinus = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!plusMinusReason.trim()) {
      alert('Powód jest wymagany.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addPenalty({
        user_id: userId,
        created_by: currentUser.id,
        type: plusMinusType,
        description: plusMinusReason.trim(),
        duration_hours: null,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: plusMinusType,
        user: { username: user.username, mta_nick: user.mta_nick },
        description: plusMinusReason.trim(),
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
      });

      // Reload data
      await loadUserData();
      setPlusMinusReason('');
      setShowAddPlusMinusModal(false);
      alert(`${plusMinusType === 'plus' ? 'PLUS' : 'MINUS'} dodany.`);
    } catch (error) {
      console.error('Error adding PLUS/MINUS:', error);
      alert('Błąd podczas dodawania.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleAddPenalty = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!penaltyReason.trim()) {
      alert('Powód jest wymagany.');
      return;
    }

    // Duration validation only for suspension types
    let duration = null;
    let expiresAt = null;
    if (penaltyType === 'zawieszenie_sluzba') {
      duration = parseInt(penaltyDuration);
      if (isNaN(duration) || duration <= 0) {
        alert('Czas trwania musi być liczbą większą od 0.');
        return;
      }
      // Calculate expires_at (server-based time + duration)
      expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
    }

    submittingRef.current = true;
    try {
      const { error } = await addPenalty({
        user_id: userId,
        created_by: currentUser.id,
        type: penaltyType, // Use ENUM value directly: 'zawieszenie_sluzba' or 'upomnienie_pisemne'
        description: penaltyReason.trim(),
        duration_hours: duration,
        expires_at: expiresAt,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: penaltyType,
        user: { username: user.username, mta_nick: user.mta_nick },
        description: penaltyReason.trim(),
        evidenceLink: penaltyEvidenceLink.trim() || null,
        durationHours: duration,
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
      });

      // Reload data
      await loadUserData();
      setPenaltyReason('');
      setPenaltyDuration('24');
      setPenaltyEvidenceLink('');
      setPenaltyType('zawieszenie_sluzba');
      setShowAddPenaltyModal(false);
      alert(`Kara (${penaltyType === 'zawieszenie_sluzba' ? 'zawieszenie' : 'upomnienie pisemne'}) nadana.`);
    } catch (error) {
      console.error('Error adding penalty:', error);
      alert('Błąd podczas nadawania kary.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleAddNote = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!noteText.trim()) {
      alert('Treść notatki jest wymagana.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addUserNote({
        user_id: userId,
        created_by: currentUser.id,
        note: noteText.trim(),
      });
      if (error) throw error;

      // Reload data
      await loadUserData();
      setNoteText('');
      setShowAddNoteModal(false);
      alert('Notatka dodana.');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Błąd podczas dodawania notatki.');
    } finally {
      submittingRef.current = false;
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
            {penalties.filter((p) => ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia'].includes(p.penalty_type)).length === 0 ? (
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
                      .filter((p) => ['zawieszenie_sluzba', 'zawieszenie_dywizja', 'zawieszenie_uprawnienia'].includes(p.penalty_type))
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
                    <p className="text-white">{note.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PLUS/MINUS Modal */}
      {showAddPlusMinusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-[#c9a227]" />
                Dodaj PLUS/MINUS
              </h3>
              <button
                onClick={() => {
                  setShowAddPlusMinusModal(false);
                  setPlusMinusReason('');
                  setPlusMinusType('plus');
                }}
                className="text-[#8fb5a0] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Typ</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPlusMinusType('plus')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      plusMinusType === 'plus'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    PLUS
                  </button>
                  <button
                    onClick={() => setPlusMinusType('minus')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      plusMinusType === 'minus'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                    }`}
                  >
                    <Minus className="w-5 h-5" />
                    MINUS
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Powód</label>
                <textarea
                  value={plusMinusReason}
                  onChange={(e) => setPlusMinusReason(e.target.value)}
                  placeholder="Opisz powód nadania PLUS/MINUS..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddPlusMinus}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Dodaj
                </button>
                <button
                  onClick={() => {
                    setShowAddPlusMinusModal(false);
                    setPlusMinusReason('');
                    setPlusMinusType('plus');
                  }}
                  className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Penalty Modal */}
      {showAddPenaltyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-red-500/30 p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Nadaj Karę
              </h3>
              <button
                onClick={() => {
                  setShowAddPenaltyModal(false);
                  setPenaltyReason('');
                  setPenaltyDuration('24');
                  setPenaltyEvidenceLink('');
                  setPenaltyType('zawieszenie_sluzba');
                }}
                className="text-[#8fb5a0] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Typ kary</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setPenaltyType('zawieszenie_sluzba')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      penaltyType === 'zawieszenie_sluzba'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Zawieszenie
                  </button>
                  <button
                    onClick={() => setPenaltyType('upomnienie_pisemne')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      penaltyType === 'upomnienie_pisemne'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    Upomnienie Pisemne
                  </button>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
                  Powód {penaltyType === 'zawieszenie_sluzba' ? 'zawieszenia' : 'upomnienia'}
                </label>
                <textarea
                  value={penaltyReason}
                  onChange={(e) => setPenaltyReason(e.target.value)}
                  placeholder="Opisz powód nadania kary..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>

              {/* Evidence Link (Optional) */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
                  Link do dowodów <span className="text-xs text-[#8fb5a0]/70">(opcjonalny)</span>
                </label>
                <input
                  type="url"
                  value={penaltyEvidenceLink}
                  onChange={(e) => setPenaltyEvidenceLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {/* Duration - Only for suspension */}
              {penaltyType === 'zawieszenie_sluzba' && (
                <div>
                  <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Czas trwania (godziny)</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {['1', '6', '12', '24', '48', '72', '168', '720'].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setPenaltyDuration(hours)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          penaltyDuration === hours
                            ? 'bg-red-500 text-white'
                            : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32] hover:bg-[#133524]'
                        }`}
                      >
                        {parseInt(hours) >= 24 ? `${parseInt(hours) / 24}d` : `${hours}h`}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={penaltyDuration}
                    onChange={(e) => setPenaltyDuration(e.target.value)}
                    placeholder="Lub wpisz własną liczbę godzin..."
                    className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              )}

              {/* Warning */}
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-xs">
                  <strong>Uwaga:</strong> {penaltyType === 'zawieszenie_sluzba'
                    ? 'Zawieszenie uniemożliwi użytkownikowi dostęp do egzaminów i innych funkcji przez podany czas.'
                    : 'Upomnienie pisemne zostanie zapisane w kartotece użytkownika.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddPenalty}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Nadaj Karę
                </button>
                <button
                  onClick={() => {
                    setShowAddPenaltyModal(false);
                    setPenaltyReason('');
                    setPenaltyDuration('24');
                    setPenaltyEvidenceLink('');
                    setPenaltyType('zawieszenie_sluzba');
                  }}
                  className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#c9a227]" />
                Dodaj Notatkę Prywatną
              </h3>
              <button
                onClick={() => {
                  setShowAddNoteModal(false);
                  setNoteText('');
                }}
                className="text-[#8fb5a0] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Note Text */}
              <div>
                <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Treść notatki</label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Wpisz notatkę widoczną tylko dla administratorów..."
                  rows={6}
                  className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
                <p className="text-[#c9a227] text-xs">
                  <strong>Informacja:</strong> Notatki prywatne są widoczne tylko dla administratorów i służą do wewnętrznych uwag.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  Dodaj Notatkę
                </button>
                <button
                  onClick={() => {
                    setShowAddNoteModal(false);
                    setNoteText('');
                  }}
                  className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
