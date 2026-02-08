'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import Navbar from '@/src/components/dashboard/Navbar';
import { ChevronLeft, UserCog, Sparkles, CheckSquare } from 'lucide-react';
import SearchBar from './SearchBar';
import FiltersPanel from './FiltersPanel';
import PersonnelTable from './PersonnelTable/PersonnelTable';
import BatchOperationsModal from './BatchOperationsModal';
import { usePersonnelList } from './hooks/usePersonnelList';
import { useBatchOperations } from './hooks/useBatchOperations';
import { BADGES, DIVISIONS, PERMISSIONS, getDivisionColor, formatDate } from '@/src/components/shared/constants';

const badges = [...BADGES];
const divisions = [...DIVISIONS];
const permissions = [...PERMISSIONS];

/**
 * PersonnelPage - Orchestrator dla kartoteki personelu
 */
export default function PersonnelPage() {
  const { user, loading, isAdmin, role } = useAuth();
  const router = useRouter();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'badge' | 'plus' | 'minus' | 'last_seen' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Batch Operations Modal State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchOperation, setBatchOperation] = useState<'badges' | 'permissions' | 'divisions'>('badges');
  const [batchPermissions, setBatchPermissions] = useState<string[]>([]);
  const [batchDivision, setBatchDivision] = useState('');

  // Custom Hooks
  const { users, filteredUsers, loadingUsers, loadUsers } = usePersonnelList({
    searchQuery,
    divisionFilter,
    roleFilter,
    sortBy,
    sortOrder,
    badges,
  });

  const {
    selectedUsers,
    toggleUserSelection,
    toggleSelectAll,
    handleBatchPromote,
    handleBatchDemote,
    handleBatchAddPermissions,
    handleBatchRemovePermissions,
    handleBatchAssignDivision,
    handleBatchRemoveDivision,
  } = useBatchOperations({
    users,
    badges,
    currentUser: user,
    onReload: loadUsers,
  });

  // Load users on mount
  useEffect(() => {
    if (user && isAdmin) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // Auth checks
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && role && !isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, loading, user, role, router]);

  // Handlers
  const handleSort = (column: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCloseBatchModal = () => {
    setShowBatchModal(false);
    setBatchPermissions([]);
    setBatchDivision('');
  };

  // Helper Functions
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'dev':
        return 'bg-pink-600 text-white';
      case 'hcs':
        return 'bg-red-900 text-white';
      case 'cs':
        return 'bg-red-600 text-white';
      case 'deputy':
        return 'bg-teal-600 text-white';
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

  // Loading State
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="text-center panel-raised p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-4">
          <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 mb-2">
            <h2 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              Kartoteka Personelu
            </h2>
          </div>
          <div className="panel-raised px-4 py-2" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Zarządzaj personelem, nadawaj uprawnienia i kary</p>
              {filteredUsers.length > 0 && (
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>
                  [{filteredUsers.length} {filteredUsers.length === 1 ? 'użytkownik' : 'użytkowników'}]
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-4 panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <FiltersPanel
              divisions={divisions}
              divisionFilter={divisionFilter}
              setDivisionFilter={setDivisionFilter}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
            />
          </div>
        </div>

        {/* Multi-Select Controls */}
        {selectedUsers.size > 1 && (
          <div className="mb-4 panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} />
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>
                  Zaznaczono: {selectedUsers.size} {selectedUsers.size === 1 ? 'użytkownik' : 'użytkowników'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="btn-win95 flex items-center gap-2"
                >
                  <UserCog className="w-4 h-4" />
                  Zarządzaj zaznaczonymi
                </button>
                <button
                  onClick={() => toggleSelectAll([])}
                  className="btn-win95"
                >
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <PersonnelTable
          users={filteredUsers}
          loadingUsers={loadingUsers}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          toggleSelectAll={() => toggleSelectAll(filteredUsers.map(u => u.id))}
          sortBy={sortBy}
          sortOrder={sortOrder}
          handleSort={handleSort}
          onViewProfile={(username) => router.push(`/personnel/${username}`)}
          getDivisionColor={getDivisionColor}
          getRoleDisplayName={getRoleDisplayName}
          getRoleColor={getRoleColor}
          formatDate={formatDate}
          searchQuery={searchQuery}
          divisionFilter={divisionFilter}
          roleFilter={roleFilter}
        />
      </div>

      {/* Batch Operations Modal */}
      <BatchOperationsModal
        isOpen={showBatchModal}
        onClose={handleCloseBatchModal}
        selectedUsersCount={selectedUsers.size}
        batchOperation={batchOperation}
        setBatchOperation={setBatchOperation}
        batchPermissions={batchPermissions}
        setBatchPermissions={setBatchPermissions}
        batchDivision={batchDivision}
        setBatchDivision={setBatchDivision}
        permissions={permissions}
        onPromote={handleBatchPromote}
        onDemote={handleBatchDemote}
        onAddPermissions={() => handleBatchAddPermissions(batchPermissions)}
        onRemovePermissions={() => handleBatchRemovePermissions(batchPermissions)}
        onAssignDivision={() => handleBatchAssignDivision(batchDivision)}
        onRemoveDivision={handleBatchRemoveDivision}
      />
    </div>
  );
}
