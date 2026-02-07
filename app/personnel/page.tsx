'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import {
  getAllUsersWithDetails,
  updateUserBadge,
  updateUserPermissions,
  updateUserDivision,
  updateIsCommander,
} from '@/src/utils/supabaseHelpers';
import { notifyBadgeChange, notifyPermissionChange, notifyDivisionChange } from '@/src/utils/discord';
import {
  ChevronLeft,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  UserCog,
  Shield,
  Award,
  Calendar,
  Eye,
  ChevronDown,
  CheckSquare,
  Square,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Check,
} from 'lucide-react';

/**
 * Kartoteka - Zarządzanie personelem SASD
 * Tylko dla CS/HCS/Dev
 */
export default function KartotekaPage() {
  const { user, loading, isAdmin, role } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Batch Operations Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'badges' | 'permissions' | 'divisions'>('badges');
  const [batchPermissions, setBatchPermissions] = useState<string[]>([]);
  const [batchDivision, setBatchDivision] = useState('');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'badge' | 'plus' | 'minus' | 'last_seen' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Stopieńs & Divisions (English ranks - 19 levels)
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
  const permissions = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch', 'Pościgowe'];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Only redirect if role is loaded and user is not admin
    // This prevents redirect during initial load when role might be null
    if (!loading && user && role && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, user, role, router]);

  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // Apply filters & search & sort
  useEffect(() => {
    let result = [...users];

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(query) ||
          u.mta_nick?.toLowerCase().includes(query)
      );
    }

    // Division filter
    if (divisionFilter !== 'all') {
      result = result.filter((u) => u.division === divisionFilter);
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((u) => u.role === roleFilter);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'name':
          aVal = a.username || '';
          bVal = b.username || '';
          break;
        case 'badge':
          aVal = badges.indexOf(a.badge || '');
          bVal = badges.indexOf(b.badge || '');
          break;
        case 'plus':
          aVal = a.plus_count || 0;
          bVal = b.plus_count || 0;
          break;
        case 'minus':
          aVal = a.minus_count || 0;
          bVal = b.minus_count || 0;
          break;
        case 'last_seen':
          aVal = new Date(a.last_seen || 0).getTime();
          bVal = new Date(b.last_seen || 0).getTime();
          break;
        case 'created_at':
          aVal = new Date(a.created_at || 0).getTime();
          bVal = new Date(b.created_at || 0).getTime();
          break;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal, 'pl')
          : bVal.localeCompare(aVal, 'pl');
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    setFilteredUsers(result);
  }, [users, searchQuery, divisionFilter, roleFilter, sortBy, sortOrder]);

  const handleSort = (column: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await getAllUsersWithDetails();
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Błąd podczas ładowania użytkowników.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  // Batch Operations Handlers
  const handleBatchPromote = async () => {
    if (!user) return;
    const confirmed = confirm(`Czy na pewno chcesz awansować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);

        // Sprawdź czy użytkownik nie ma już najwyższego stopnia
        if (currentIndex === -1 || currentIndex >= badges.length - 1) {
          continue; // Pomiń użytkowników bez stopnia lub z najwyższym stopniem
        }

        const newStopień = badges[currentIndex + 1];

        // Update badge
        const { error } = await updateUserBadge(userId, newStopień);
        if (error) throw error;

        // Auto-Commander: Captain III + Division → is_commander = true
        if (newStopień === 'Captain III' && targetUser.division) {
          await updateIsCommander(userId, true);
        }

        // Discord webhook
        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldStopień: currentStopień || 'Brak',
          newStopień,
          isPromotion: true,
          createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error promoting user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setShowBatchModal(false);
    alert(`Awansowano ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchDemote = async () => {
    if (!user) return;
    const confirmed = confirm(`Czy na pewno chcesz zdegradować ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentStopień = targetUser.badge;
        const currentIndex = badges.indexOf(currentStopień);

        // Sprawdź czy użytkownik nie ma już najniższego stopnia
        if (currentIndex <= 0) {
          continue; // Pomiń użytkowników bez stopnia lub z najniższym stopniem
        }

        const newStopień = badges[currentIndex - 1];

        // Update badge
        const { error } = await updateUserBadge(userId, newStopień);
        if (error) throw error;

        // Discord webhook
        await notifyBadgeChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          oldStopień: currentStopień || 'Brak',
          newStopień,
          isPromotion: false,
          createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error demoting user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setShowBatchModal(false);
    alert(`Zdegradowano ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchAddPermissions = async () => {
    if (!user || batchPermissions.length === 0) {
      alert('Wybierz przynajmniej jedno uprawnienie.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz dodać uprawnienia dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = [...new Set([...currentPermissions, ...batchPermissions])];

        // Update permissions
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        // Discord webhooks dla każdego dodanego uprawnienia
        const added = batchPermissions.filter((p: string) => !currentPermissions.includes(p));
        for (const permission of added) {
          await notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: true,
            createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error adding permissions to user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setBatchPermissions([]);
    setShowBatchModal(false);
    alert(`Dodano uprawnienia dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchRemovePermissions = async () => {
    if (!user || batchPermissions.length === 0) {
      alert('Wybierz przynajmniej jedno uprawnienie.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz usunąć uprawnienia dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        const currentPermissions = targetUser.permissions || [];
        const newPermissions = currentPermissions.filter((p: string) => !batchPermissions.includes(p));

        // Update permissions
        const { error } = await updateUserPermissions(userId, newPermissions);
        if (error) throw error;

        // Discord webhooks dla każdego usuniętego uprawnienia
        const removed = batchPermissions.filter((p: string) => currentPermissions.includes(p));
        for (const permission of removed) {
          await notifyPermissionChange({
            user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
            permission,
            isGranted: false,
            createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
          });
        }

        successCount++;
      } catch (error) {
        console.error(`Error removing permissions from user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setBatchPermissions([]);
    setShowBatchModal(false);
    alert(`Usunięto uprawnienia dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchAssignDivision = async () => {
    if (!user || !batchDivision) {
      alert('Wybierz dywizję.');
      return;
    }

    const confirmed = confirm(`Czy na pewno chcesz przypisać dywizję ${batchDivision} dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) continue;

        // Update division
        const { error } = await updateUserDivision(userId, batchDivision);
        if (error) throw error;

        // Discord webhook
        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: batchDivision,
          isGranted: true,
          isCommander: false,
          createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error assigning division to user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setBatchDivision('');
    setShowBatchModal(false);
    alert(`Przypisano dywizję dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const handleBatchRemoveDivision = async () => {
    if (!user) return;

    const confirmed = confirm(`Czy na pewno chcesz usunąć dywizje dla ${selectedUsers.size} użytkowników?`);
    if (!confirmed) return;

    let successCount = 0;
    let errorCount = 0;

    for (const userId of Array.from(selectedUsers)) {
      try {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser || !targetUser.division) continue;

        const oldDivision = targetUser.division;

        // Update division
        const { error } = await updateUserDivision(userId, null);
        if (error) throw error;

        // Discord webhook
        await notifyDivisionChange({
          user: { username: targetUser.username, mta_nick: targetUser.mta_nick },
          division: oldDivision,
          isGranted: false,
          isCommander: false,
          createdBy: { username: user.user_metadata?.full_name || 'Admin', mta_nick: null },
        });

        successCount++;
      } catch (error) {
        console.error(`Error removing division from user ${userId}:`, error);
        errorCount++;
      }
    }

    await loadUsers();
    setSelectedUsers(new Set());
    setShowBatchModal(false);
    alert(`Usunięto dywizje dla ${successCount} użytkowników. Błędy: ${errorCount}`);
  };

  const getDivisionColor = (division: string | null) => {
    switch (division) {
      case 'FTO':
        return 'bg-[#c9a227] text-[#020a06]';
      case 'SS':
        return 'bg-[#ff8c00] text-white';
      case 'DTU':
        return 'bg-[#60a5fa] text-[#020a06]';
      case 'GU':
        return 'bg-[#10b981] text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getRoleStopieńColor = (role: string) => {
    switch (role) {
      case 'dev':
        return 'bg-purple-600 text-white';
      case 'hcs':
        return 'bg-red-600 text-white';
      case 'cs':
        return 'bg-orange-600 text-white';
      case 'deputy':
        return 'bg-blue-600 text-white';
      case 'trainee':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'dev':
        return 'DEV';
      case 'hcs':
        return 'HCS';
      case 'cs':
        return 'CS';
      case 'deputy':
        return 'Deputy';
      case 'trainee':
        return 'Trainee';
      default:
        return role?.toUpperCase() || 'UNKNOWN';
    }
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

  if (!isAdmin) {
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>System zarządzania</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="text-gold-gradient">Kartoteka</span> Personelu
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-3" />
          <div className="flex items-center gap-3">
            <p className="text-[#8fb5a0]">
              Zarządzaj personelem, nadawaj uprawnienia i kary
            </p>
            {filteredUsers.length > 0 && (
              <span className="px-3 py-1 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-full text-[#c9a227] text-xs font-bold">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'użytkownik' : filteredUsers.length < 5 ? 'użytkowników' : 'użytkowników'}
              </span>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 glass-strong rounded-2xl border border-[#1a4d32]/50 p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj (nazwa, nick MTA)..."
                  className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
                />
              </div>
            </div>

            {/* Division Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
              <select
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Wszystkie dywizje</option>
                {divisions.map((div) => (
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
                <option value="none">Bez dywizji</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors appearance-none cursor-pointer"
              >
                <option value="all">Wszystkie role</option>
                <option value="dev">Dev</option>
                <option value="hcs">HCS (High Command Staff)</option>
                <option value="cs">CS (Command Staff)</option>
                <option value="deputy">Deputy</option>
                <option value="trainee">Trainee</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Multi-Select Controls */}
        {selectedUsers.size > 1 && (
          <div className="mb-6 glass-strong rounded-xl border border-[#c9a227]/30 p-4 shadow-lg bg-[#c9a227]/5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-[#c9a227]" />
                <span className="text-white font-semibold">
                  Zaznaczono: {selectedUsers.size} {selectedUsers.size === 1 ? 'użytkownik' : selectedUsers.size < 5 ? 'użytkowników' : 'użytkowników'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                >
                  <UserCog className="w-4 h-4" />
                  Zarządzaj zaznaczonymi
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-4 py-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loadingUsers ? (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
            <p className="text-[#8fb5a0] text-lg">Ładowanie użytkowników...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
            <Users className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
            <p className="text-[#8fb5a0] text-lg">
              {searchQuery || divisionFilter !== 'all' || roleFilter !== 'all'
                ? 'Brak użytkowników pasujących do filtrów.'
                : 'Brak użytkowników w systemie.'}
            </p>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
            {/* Table Header */}
            <div className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center text-[#8fb5a0] text-xs font-bold uppercase">
                <div className="col-span-1 flex items-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
                  >
                    {selectedUsers.size === filteredUsers.length ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleSort('name')}
                  className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
                >
                  Użytkownik
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'name' ? 'text-[#c9a227]' : ''}`} />
                </button>
                <div className="col-span-2">Dywizja/Uprawnienia</div>
                <button
                  onClick={() => handleSort('badge')}
                  className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
                >
                  Stopień
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'badge' ? 'text-[#c9a227]' : ''}`} />
                </button>
                <button
                  onClick={() => handleSort('plus')}
                  className="col-span-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#c9a227] transition-colors"
                >
                  +/-
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'plus' || sortBy === 'minus' ? 'text-[#c9a227]' : ''}`} />
                </button>
                <button
                  onClick={() => handleSort('last_seen')}
                  className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
                >
                  Ostatnio
                  <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'last_seen' ? 'text-[#c9a227]' : ''}`} />
                </button>
                <div className="col-span-1 text-right">Akcje</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[#1a4d32]/30">
              {filteredUsers.map((u, index) => (
                <div
                  key={u.id}
                  className="px-6 py-4 hover:bg-[#0a2818]/30 transition-colors"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Checkbox */}
                    <div className="col-span-1">
                      <button
                        onClick={() => toggleUserSelection(u.id)}
                        className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
                      >
                        {selectedUsers.has(u.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* User Info */}
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url && (
                          <img
                            src={u.avatar_url}
                            alt={u.username}
                            className="w-10 h-10 rounded-full border-2 border-[#1a4d32]"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold">{u.mta_nick || u.username}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleStopieńColor(u.role)}`}>
                              {getRoleDisplayName(u.role)}
                            </span>
                          </div>
                          <span className="text-[#8fb5a0] text-xs">@{u.username}</span>
                        </div>
                      </div>
                    </div>

                    {/* Division & Permissions */}
                    <div className="col-span-2">
                      <div className="flex flex-wrap gap-1">
                        {u.division && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getDivisionColor(u.division)}`}>
                            {u.division}{u.is_commander ? ' CMD' : ''}
                          </span>
                        )}
                        {u.permissions?.map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stopień */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#c9a227]" />
                        <span className="text-white text-sm">{u.badge || 'Brak'}</span>
                      </div>
                    </div>

                    {/* Plus/Minus */}
                    <div className="col-span-1">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-green-400 font-bold text-sm">+{u.plus_count || 0}</span>
                        <span className="text-red-400 font-bold text-sm">-{u.minus_count || 0}</span>
                      </div>
                    </div>

                    {/* Last Seen */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#8fb5a0]" />
                        <span className="text-[#8fb5a0] text-xs">
                          {formatDate(u.last_seen || u.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => router.push(`/personnel/${u.username}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        Zobacz
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Batch Operations Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-strong rounded-2xl border border-[#c9a227]/30 p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserCog className="w-6 h-6 text-[#c9a227]" />
                Zarządzaj zaznaczonymi ({selectedUsers.size})
              </h3>
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setBatchPermissions([]);
                  setBatchDivision('');
                }}
                className="text-[#8fb5a0] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Operation Type Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setBatchOperation('badges')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  batchOperation === 'badges'
                    ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                <Award className="w-5 h-5" />
                Stopnie
              </button>
              <button
                onClick={() => setBatchOperation('permissions')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  batchOperation === 'permissions'
                    ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                <Shield className="w-5 h-5" />
                Uprawnienia
              </button>
              <button
                onClick={() => setBatchOperation('divisions')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  batchOperation === 'divisions'
                    ? 'bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] shadow-lg'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                <Shield className="w-5 h-5" />
                Dywizje
              </button>
            </div>

            {/* Content based on operation type */}
            <div className="space-y-4">
              {/* Stopieńs Operations */}
              {batchOperation === 'badges' && (
                <div className="space-y-4">
                  <div className="p-4 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
                    <p className="text-[#c9a227] text-sm">
                      Każdy użytkownik zostanie awansowany/zdegradowany o 1 stopień względem swojego aktualnego stopnia.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBatchPromote}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                    >
                      <TrendingUp className="w-5 h-5" />
                      Awansuj wszystkich
                    </button>
                    <button
                      onClick={handleBatchDemote}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                    >
                      <TrendingDown className="w-5 h-5" />
                      Degraduj wszystkich
                    </button>
                  </div>
                </div>
              )}

              {/* Permissions Operations */}
              {batchOperation === 'permissions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
                      Wybierz uprawnienia
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {permissions.map((perm) => (
                        <label
                          key={perm}
                          className="flex items-center gap-2 px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl cursor-pointer hover:bg-[#133524] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={batchPermissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBatchPermissions([...batchPermissions, perm]);
                              } else {
                                setBatchPermissions(batchPermissions.filter((p) => p !== perm));
                              }
                            }}
                            className="rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227]"
                          />
                          <span className="text-white text-sm font-medium">{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBatchAddPermissions}
                      disabled={batchPermissions.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      Dodaj uprawnienia
                    </button>
                    <button
                      onClick={handleBatchRemovePermissions}
                      disabled={batchPermissions.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-5 h-5" />
                      Usuń uprawnienia
                    </button>
                  </div>
                </div>
              )}

              {/* Divisions Operations */}
              {batchOperation === 'divisions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#8fb5a0] text-sm font-semibold mb-3">
                      Wybierz dywizję
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setBatchDivision('FTO')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          batchDivision === 'FTO'
                            ? 'bg-[#c9a227] text-[#020a06] border-2 border-[#e6b830] shadow-lg'
                            : 'bg-[#0a2818] text-[#c9a227] border border-[#c9a227]/30 hover:bg-[#c9a227]/10'
                        }`}
                      >
                        FTO
                      </button>
                      <button
                        onClick={() => setBatchDivision('SS')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          batchDivision === 'SS'
                            ? 'bg-[#ff8c00] text-white border-2 border-[#ff8c00] shadow-lg'
                            : 'bg-[#0a2818] text-[#ff8c00] border border-[#ff8c00]/30 hover:bg-[#ff8c00]/10'
                        }`}
                      >
                        SS
                      </button>
                      <button
                        onClick={() => setBatchDivision('DTU')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          batchDivision === 'DTU'
                            ? 'bg-[#60a5fa] text-[#020a06] border-2 border-[#60a5fa] shadow-lg'
                            : 'bg-[#0a2818] text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/10'
                        }`}
                      >
                        DTU
                      </button>
                      <button
                        onClick={() => setBatchDivision('GU')}
                        className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          batchDivision === 'GU'
                            ? 'bg-[#10b981] text-white border-2 border-[#10b981] shadow-lg'
                            : 'bg-[#0a2818] text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/10'
                        }`}
                      >
                        GU
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBatchAssignDivision}
                      disabled={!batchDivision}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-5 h-5" />
                      Przypisz dywizję
                    </button>
                    <button
                      onClick={handleBatchRemoveDivision}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
                    >
                      <X className="w-5 h-5" />
                      Usuń dywizje
                    </button>
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => {
                  setShowBatchModal(false);
                  setBatchPermissions([]);
                  setBatchDivision('');
                }}
                className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}
