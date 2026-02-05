'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { getAllUsersWithDetails } from '@/src/utils/supabaseHelpers';
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
} from 'lucide-react';

/**
 * Kartoteka - Zarządzanie personelem SASD
 * Tylko dla admin/dev
 */
export default function KartotekaPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'plus' | 'minus' | 'last_seen' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Badges & Divisions
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
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, user, router]);

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
          u.mta_nick?.toLowerCase().includes(query) ||
          u.email?.toLowerCase().includes(query)
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'dev':
        return 'bg-purple-600 text-white';
      case 'admin':
        return 'bg-red-600 text-white';
      default:
        return 'bg-blue-600 text-white';
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
                  placeholder="Szukaj (nazwa, nick MTA, email)..."
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
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
            </div>
          </div>

          {/* Sort Controls */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-[#8fb5a0] text-sm">Sortuj:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: 'name', label: 'Nazwa' },
                { value: 'plus', label: 'PLUS' },
                { value: 'minus', label: 'MINUS' },
                { value: 'last_seen', label: 'Ostatnio widziany' },
                { value: 'created_at', label: 'Data rejestracji' },
              ].map((sort) => (
                <button
                  key={sort.value}
                  onClick={() => {
                    if (sortBy === sort.value) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(sort.value as any);
                      setSortOrder('asc');
                    }
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === sort.value
                      ? 'bg-[#c9a227] text-[#020a06]'
                      : 'bg-[#0a2818] text-[#8fb5a0] hover:bg-[#133524]'
                  }`}
                >
                  {sort.label}
                  {sortBy === sort.value && (
                    <ArrowUpDown className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi-Select Controls */}
        {selectedUsers.size > 0 && (
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
                <div className="col-span-3">Użytkownik</div>
                <div className="col-span-2">Dywizja/Uprawnienia</div>
                <div className="col-span-2">Stopień</div>
                <div className="col-span-1 text-center">+/-</div>
                <div className="col-span-2">Ostatnio</div>
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
                            <span className="text-white font-semibold">{u.username}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeColor(u.role)}`}>
                              {u.role}
                            </span>
                          </div>
                          {u.mta_nick && (
                            <span className="text-[#8fb5a0] text-xs">MTA: {u.mta_nick}</span>
                          )}
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

                    {/* Badge */}
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
                        onClick={() => router.push(`/kartoteka/${u.id}`)}
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
