import { useState, useMemo } from 'react';
import { getAllUsersWithDetails } from '@/src/lib/db/users';

interface UsePersonnelListProps {
  searchQuery: string;
  divisionFilter: string;
  roleFilter: string;
  sortBy: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen' | 'created_at';
  sortOrder: 'asc' | 'desc';
  badges: string[];
}

/**
 * usePersonnelList - Hook dla ładowania, filtrowania i sortowania użytkowników
 */
export function usePersonnelList({
  searchQuery,
  divisionFilter,
  roleFilter,
  sortBy,
  sortOrder,
  badges,
}: UsePersonnelListProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

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

  // Apply filters & search & sort via useMemo (no extra state, no useEffect)
  const filteredUsers = useMemo(() => {
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
      if (divisionFilter === 'none') {
        result = result.filter((u) => !u.division);
      } else {
        result = result.filter((u) => u.division === divisionFilter);
      }
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

    return result;
  }, [users, searchQuery, divisionFilter, roleFilter, sortBy, sortOrder, badges]);

  return {
    users,
    filteredUsers,
    loadingUsers,
    loadUsers,
  };
}
