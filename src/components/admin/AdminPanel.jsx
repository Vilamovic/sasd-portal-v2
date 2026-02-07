'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/supabaseClient';
import { setForceLogoutForUser, deleteUser } from '@/src/utils/supabaseHelpers';
import { notifyAdminAction } from '@/src/utils/discord';
import { Users, Search, UserMinus, Shield, ShieldCheck, ShieldOff, ChevronDown, ArrowUpDown, ChevronLeft, Sparkles, MoreVertical, Key } from 'lucide-react';
import Link from 'next/link';

/**
 * AdminPanel - Premium Sheriff-themed user management
 * - RPC update_user_role
 * - Force Logout + Delete User
 * - Wyszukiwanie po nicku/username/badge (bez emailu dla non-dev)
 * - Dropdown "Akcja" (Nadaj/Odbierz/Wyrzuć)
 * - Sortowanie (username, nick, badge, role, created_at, last_seen)
 * - Przycisk "Wyrzuć": force logout → wait 2s → delete user
 * - Discord webhook przy usunięciu
 */
export default function AdminPanel({ onBack }) {
  const { user, role, isDev, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showActionDropdown, setShowActionDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const submittingRef = useRef(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, [sortBy, sortOrder]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowActionDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Fetch all users with sorting
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update user role (RPC)
  const handleUpdateRole = async (userId, newRole, userNick) => {
    if (submittingRef.current) return;

    // Check if trying to change dev role
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'dev') {
      alert('Nie możesz zmienić roli użytkownika dev.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz zmienić rolę użytkownika ${userNick} na ${newRole}?`)) {
      return;
    }

    submittingRef.current = true;

    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole,
      });

      if (error) throw error;

      // Reload users
      await loadUsers();

      // Discord notification
      notifyAdminAction({
        action: `Zmiana roli na ${newRole}`,
        targetUser: userNick,
      });

      alert('Rola zaktualizowana.');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Błąd podczas aktualizacji roli. Tylko dev może zmieniać role.');
    } finally {
      submittingRef.current = false;
      setShowActionDropdown(null);
    }
  };

  // Kick user (force logout + delete)
  const handleKickUser = async (userId, userNick) => {
    if (submittingRef.current) return;

    // Check if trying to kick dev
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.role === 'dev') {
      alert('Nie możesz wyrzucić użytkownika z rolą dev.');
      return;
    }

    if (!confirm(`Czy na pewno chcesz WYRZUCIĆ użytkownika ${userNick}?\nUżytkownik zostanie wylogowany i usunięty z bazy.`)) {
      return;
    }

    submittingRef.current = true;

    try {
      // Step 1: Force logout
      const { error: logoutError } = await setForceLogoutForUser(userId);
      if (logoutError) throw logoutError;

      // Step 2: Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Delete user
      const { error: deleteError } = await deleteUser(userId);
      if (deleteError) throw deleteError;

      // Discord notification
      notifyAdminAction({
        action: 'Wyrzucenie użytkownika (force logout + delete)',
        targetUser: userNick,
      });

      // Reload users
      await loadUsers();

      alert('Użytkownik wyrzucony i usunięty.');
    } catch (error) {
      console.error('Error kicking user:', error);
      alert('Błąd podczas wyrzucania użytkownika.');
    } finally {
      submittingRef.current = false;
      setShowActionDropdown(null);
    }
  };

  // Sort users
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase();

    // Dev can search by email, others cannot
    const emailMatch = isDev && u.email?.toLowerCase().includes(searchLower);

    return (
      !searchQuery ||
      u.mta_nick?.toLowerCase().includes(searchLower) ||
      u.username?.toLowerCase().includes(searchLower) ||
      u.badge?.toLowerCase().includes(searchLower) ||
      emailMatch
    );
  });

  // Helper function for role badge styling
  const getRoleBadgeStyle = (roleValue) => {
    if (roleValue === 'dev') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    } else if (roleValue === 'admin') {
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    } else {
      return 'bg-[#14b8a6]/20 text-[#14b8a6] border-[#14b8a6]/30';
    }
  };

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            Tylko administratorzy mogą zarządzać użytkownikami.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
          <p className="text-[#8fb5a0]">Ładowanie użytkowników...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Panel administratora</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8 text-[#c9a227]" />
            <h2 className="text-4xl font-bold text-white">
              Panel <span className="text-gold-gradient">Administratora</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">
            Zarządzanie użytkownikami ({filteredUsers.length})
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
            <input
              type="text"
              placeholder={isDev ? "Szukaj po nicku, username, badge lub email..." : "Szukaj po nicku, username lub badge..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full">
              <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                <tr>
                  <th
                    onClick={() => handleSort('mta_nick')}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Użytkownik
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('badge')}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Stopień
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  {isDev && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                      Email
                    </th>
                  )}
                  <th
                    onClick={() => handleSort('role')}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Rola
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Utworzono
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('last_seen')}
                    className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Ostatnio Widziany
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Akcja
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={isDev ? 8 : 7} className="px-6 py-8 text-center text-[#8fb5a0]">
                      Brak użytkowników do wyświetlenia
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentUser = u.id === user.id;
                    const isDevUser = u.role === 'dev';

                    return (
                      <tr key={u.id} className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a4d32] to-[#22693f] flex items-center justify-center text-white font-bold">
                              {((u.mta_nick || u.username) || '?')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-white font-medium">{u.mta_nick || u.username || 'N/A'}</div>
                              <div className="text-[#8fb5a0] text-xs">@{u.username || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0]">{u.badge || 'N/A'}</td>
                        {isDev && (
                          <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                            {u.email || 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeStyle(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                          {new Date(u.created_at).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                          {u.last_seen ? new Date(u.last_seen).toLocaleString('pl-PL') : 'Nigdy'}
                        </td>
                        <td className="px-6 py-4">
                          {/* Dropdown */}
                          <div className="flex justify-center">
                            <div className="relative" ref={showActionDropdown === u.id ? dropdownRef : null}>
                              <button
                                onClick={() => setShowActionDropdown(showActionDropdown === u.id ? null : u.id)}
                                disabled={isCurrentUser || isDevUser}
                                className={`p-2 rounded-lg transition-colors ${
                                  isCurrentUser || isDevUser
                                    ? 'bg-[#1a4d32]/30 text-[#8fb5a0]/50 cursor-not-allowed'
                                    : 'bg-[#1a4d32]/50 text-[#8fb5a0] hover:bg-[#c9a227]/20 hover:text-[#c9a227]'
                                }`}
                                title={isCurrentUser ? 'Nie możesz zarządzać własnym kontem' : isDevUser ? 'Nie możesz zarządzać devem' : 'Akcje'}
                              >
                                <MoreVertical className="w-5 h-5" />
                              </button>

                              {showActionDropdown === u.id && !isCurrentUser && !isDevUser && (
                                <div className="absolute right-0 mt-2 w-52 glass-strong rounded-xl shadow-2xl border border-[#1a4d32] py-2 z-50 max-h-80 overflow-y-auto">
                                  {/* Dev can set any role */}
                                  {isDev && (
                                    <>
                                      <div className="px-3 py-1 text-xs text-[#8fb5a0] font-semibold">Zmień rolę:</div>
                                      <button
                                        onClick={() => handleUpdateRole(u.id, 'hcs', u.mta_nick || u.username)}
                                        className="w-full px-4 py-2 text-left hover:bg-red-600/10 transition-colors text-red-400 text-sm flex items-center gap-2"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                        HCS
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRole(u.id, 'cs', u.mta_nick || u.username)}
                                        className="w-full px-4 py-2 text-left hover:bg-orange-600/10 transition-colors text-orange-400 text-sm flex items-center gap-2"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                        CS
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRole(u.id, 'deputy', u.mta_nick || u.username)}
                                        className="w-full px-4 py-2 text-left hover:bg-blue-600/10 transition-colors text-blue-400 text-sm flex items-center gap-2"
                                      >
                                        <ShieldCheck className="w-4 h-4" />
                                        Deputy
                                      </button>
                                      <button
                                        onClick={() => handleUpdateRole(u.id, 'trainee', u.mta_nick || u.username)}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-600/10 transition-colors text-gray-400 text-sm flex items-center gap-2"
                                      >
                                        <ShieldOff className="w-4 h-4" />
                                        Trainee
                                      </button>
                                      <div className="border-t border-[#1a4d32] my-2" />
                                    </>
                                  )}

                                  {/* Dev can kick anyone (except dev), Admin can kick only trainee/deputy */}
                                  {((isDev) || (isAdmin && (u.role === 'trainee' || u.role === 'deputy'))) && (
                                    <button
                                      onClick={() => handleKickUser(u.id, u.mta_nick || u.username)}
                                      className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors text-red-400 text-sm flex items-center gap-2"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                      Wyrzuć
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/admin/tokens"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:opacity-90 text-[#020a06] font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
          >
            <Key className="w-5 h-5" />
            <span className="text-sm font-medium">Tokeny Egzaminacyjne</span>
          </Link>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Powrót do Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
