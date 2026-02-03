'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/supabaseClient';
import { setForceLogoutForUser, deleteUser } from '@/src/utils/supabaseHelpers';
import { notifyAdminAction } from '@/src/utils/discord';
import { Users, Search, UserMinus, Shield, ChevronDown, ArrowUpDown } from 'lucide-react';

/**
 * AdminPanel - Zarządzanie użytkownikami
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
  const [selectedAction, setSelectedAction] = useState({});
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

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-gray-400 mb-6">
            Tylko administratorzy mogą zarządzać użytkownikami.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Ładowanie użytkowników...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            PANEL ADMINISTRATORA
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
          <p className="text-gray-400 mt-4">
            Zarządzanie użytkownikami ({filteredUsers.length})
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={isDev ? "Szukaj po nicku, username, badge lub email..." : "Szukaj po nicku, username lub badge..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th
                    onClick={() => handleSort('username')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Username
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('mta_nick')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Nick
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('badge')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Badge
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  {isDev && (
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                      Email
                    </th>
                  )}
                  <th
                    onClick={() => handleSort('role')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Rola
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Utworzono
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('last_seen')}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Ostatnio Widziany
                      <ArrowUpDown className="w-4 h-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Akcja
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={isDev ? 8 : 7} className="px-6 py-8 text-center text-gray-400">
                      Brak użytkowników do wyświetlenia
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentUser = u.id === user.id;
                    const isDevUser = u.role === 'dev';

                    return (
                      <tr key={u.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white">{u.username || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-300">{u.mta_nick || 'Brak nicku'}</td>
                        <td className="px-6 py-4 text-gray-300">{u.badge || 'N/A'}</td>
                        {isDev && (
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {u.email || 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            u.role === 'dev'
                              ? 'bg-red-500/20 text-red-400'
                              : u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(u.created_at).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {u.last_seen ? new Date(u.last_seen).toLocaleString('pl-PL') : 'Nigdy'}
                        </td>
                        <td className="px-6 py-4">
                          {/* Dropdown */}
                          <div className="relative" ref={showActionDropdown === u.id ? dropdownRef : null}>
                            <button
                              onClick={() => setShowActionDropdown(showActionDropdown === u.id ? null : u.id)}
                              disabled={isCurrentUser || isDevUser}
                              className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                                isCurrentUser || isDevUser
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                              title={isCurrentUser ? 'Nie możesz zarządzać własnym kontem' : isDevUser ? 'Nie możesz zarządzać devem' : 'Akcje'}
                            >
                              Akcja
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            {showActionDropdown === u.id && !isCurrentUser && !isDevUser && (
                              <div className="absolute right-0 mt-2 w-48 bg-[#1e2836] rounded-xl shadow-2xl border border-white/10 py-2 z-50">
                                {/* Dev can give/remove admin */}
                                {isDev && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateRole(u.id, 'admin', u.mta_nick || u.username)}
                                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-purple-400 text-sm"
                                    >
                                      Nadaj Admin
                                    </button>
                                    <button
                                      onClick={() => handleUpdateRole(u.id, 'user', u.mta_nick || u.username)}
                                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors text-blue-400 text-sm"
                                    >
                                      Odbierz Admin
                                    </button>
                                    <div className="border-t border-white/10 my-2"></div>
                                  </>
                                )}

                                {/* Dev can kick anyone (except dev), Admin can kick only users */}
                                {((isDev) || (isAdmin && u.role === 'user')) && (
                                  <button
                                    onClick={() => handleKickUser(u.id, u.mta_nick || u.username)}
                                    className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-red-500/20 transition-colors text-red-400 text-sm"
                                  >
                                    <UserMinus className="w-4 h-4" />
                                    Wyrzuć
                                  </button>
                                )}
                              </div>
                            )}
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

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          ← Powrót do Dashboard
        </button>
      </div>
    </div>
  );
}
