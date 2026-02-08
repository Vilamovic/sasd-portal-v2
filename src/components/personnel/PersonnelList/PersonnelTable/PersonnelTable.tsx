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
      <div className="panel-raised p-12 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie użytkowników...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="panel-raised p-12 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <Users className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--mdt-muted-text)' }} />
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
          {searchQuery || divisionFilter !== 'all' || roleFilter !== 'all'
            ? 'Brak użytkowników pasujących do filtrów.'
            : 'Brak użytkowników w systemie.'}
        </p>
      </div>
    );
  }

  return (
    <div className="panel-raised overflow-hidden" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <TableHeader
        selectedCount={selectedUsers.size}
        totalCount={users.length}
        toggleSelectAll={toggleSelectAll}
        sortBy={sortBy}
        sortOrder={sortOrder}
        handleSort={handleSort}
      />
      <div>
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
