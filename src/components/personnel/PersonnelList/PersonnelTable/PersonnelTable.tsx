'use client';

import { Users } from 'lucide-react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

interface PersonnelTableProps {
  users: any[];
  loadingUsers: boolean;
  selectedUsers: Set<string>;
  toggleUserSelection: (userId: string) => void;
  toggleSelectAll: () => void;
  sortBy: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen' | 'created_at';
  sortOrder: 'asc' | 'desc';
  handleSort: (column: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen') => void;
  onViewProfile: (username: string) => void;
  getDivisionColor: (division: string | null) => string;
  getRoleDisplayName: (role: string) => string;
  getRoleColor: (role: string) => string;
  formatDate: (dateString: string) => string;
  searchQuery: string;
  divisionFilter: string;
  roleFilter: string;
}

/**
 * PersonnelTable - Tabela z listą użytkowników w kartotece
 */
export default function PersonnelTable({
  users,
  loadingUsers,
  selectedUsers,
  toggleUserSelection,
  toggleSelectAll,
  sortBy,
  sortOrder,
  handleSort,
  onViewProfile,
  getDivisionColor,
  getRoleDisplayName,
  getRoleColor,
  formatDate,
  searchQuery,
  divisionFilter,
  roleFilter,
}: PersonnelTableProps) {
  if (loadingUsers) {
    return (
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
        <p className="text-[#8fb5a0] text-lg">Ładowanie użytkowników...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
        <Users className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
        <p className="text-[#8fb5a0] text-lg">
          {searchQuery || divisionFilter !== 'all' || roleFilter !== 'all'
            ? 'Brak użytkowników pasujących do filtrów.'
            : 'Brak użytkowników w systemie.'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
      <TableHeader
        selectedCount={selectedUsers.size}
        totalCount={users.length}
        toggleSelectAll={toggleSelectAll}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />
      <div className="divide-y divide-[#1a4d32]/30">
        {users.map((user, index) => (
          <TableRow
            key={user.id}
            user={user}
            index={index}
            selected={selectedUsers.has(user.id)}
            toggleSelection={toggleUserSelection}
            onViewProfile={onViewProfile}
            getDivisionColor={getDivisionColor}
            getRoleDisplayName={getRoleDisplayName}
            getRoleColor={getRoleColor}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  );
}
