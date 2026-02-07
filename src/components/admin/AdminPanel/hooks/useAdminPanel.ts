import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/src/supabaseClient';
import { setForceLogoutForUser, deleteUser } from '@/src/lib/db/users';
import { notifyAdminAction } from '@/src/lib/webhooks/admin';

interface User {
  id: string;
  mta_nick?: string;
  username?: string;
  avatar_url?: string;
  badge?: string;
  email?: string;
  role: string;
  created_at: string;
  last_seen?: string;
}

interface UseAdminPanelReturn {
  users: User[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  handleSort: (column: string) => void;
  showActionDropdown: string | null;
  dropdownPosition: { top: number; right: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  buttonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  handleToggleDropdown: (userId: string) => void;
  handleUpdateRole: (userId: string, newRole: string, userNick: string) => Promise<void>;
  handleKickUser: (userId: string, userNick: string) => Promise<void>;
  filteredUsers: User[];
}

interface Actor {
  mta_nick?: string;
  username?: string;
  email?: string;
}

/**
 * useAdminPanel - Admin Panel state and logic
 * - Load users with sorting
 * - Search/filter users
 * - Update role (RPC)
 * - Kick user (force logout + delete)
 * - Dropdown state management
 */
export function useAdminPanel(isCS: boolean, actor: Actor): UseAdminPanelReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showActionDropdown, setShowActionDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const submittingRef = useRef(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, [sortBy, sortOrder]);

  const loadUsers = async () => {
    try {
      setLoading(true);

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

  // Sort users
  const handleSort = (column: string) => {
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

    // CS+ can search by email, others cannot
    const emailMatch = isCS && u.email?.toLowerCase().includes(searchLower);

    return (
      !searchQuery ||
      u.mta_nick?.toLowerCase().includes(searchLower) ||
      u.username?.toLowerCase().includes(searchLower) ||
      u.badge?.toLowerCase().includes(searchLower) ||
      emailMatch
    );
  });

  // Toggle dropdown
  const handleToggleDropdown = (userId: string) => {
    if (showActionDropdown === userId) {
      setShowActionDropdown(null);
      return;
    }

    const button = buttonRefs.current[userId];
    if (button) {
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px spacing below button
        right: window.innerWidth - rect.right + window.scrollX,
      });
    }

    setShowActionDropdown(userId);
  };

  // Update user role (RPC)
  const handleUpdateRole = async (userId: string, newRole: string, userNick: string) => {
    if (submittingRef.current) return;

    // Check if trying to change dev role
    const targetUser = users.find((u) => u.id === userId);
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
      const targetUser = users.find((u) => u.id === userId);
      notifyAdminAction({
        action: `Zmiana roli na ${newRole}`,
        actor,
        targetUser: {
          mta_nick: targetUser?.mta_nick,
          username: targetUser?.username,
          email: targetUser?.email,
        },
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
  const handleKickUser = async (userId: string, userNick: string) => {
    if (submittingRef.current) return;

    // Check if trying to kick dev
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === 'dev') {
      alert('Nie możesz wyrzucić użytkownika z rolą dev.');
      return;
    }

    if (
      !confirm(
        `Czy na pewno chcesz WYRZUCIĆ użytkownika ${userNick}?\nUżytkownik zostanie wylogowany i usunięty z bazy.`
      )
    ) {
      return;
    }

    submittingRef.current = true;

    try {
      // Step 1: Force logout
      const { error: logoutError } = await setForceLogoutForUser(userId);
      if (logoutError) throw logoutError;

      // Step 2: Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 3: Delete user
      const { error: deleteError } = await deleteUser(userId);
      if (deleteError) throw deleteError;

      // Discord notification
      const targetUser = users.find((u) => u.id === userId);
      notifyAdminAction({
        action: 'delete_user',
        actor,
        targetUser: {
          mta_nick: targetUser?.mta_nick,
          username: targetUser?.username,
          email: targetUser?.email,
        },
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

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    sortOrder,
    handleSort,
    showActionDropdown,
    dropdownPosition,
    dropdownRef,
    buttonRefs,
    handleToggleDropdown,
    handleUpdateRole,
    handleKickUser,
    filteredUsers,
  };
}
