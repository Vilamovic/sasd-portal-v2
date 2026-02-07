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
  'Sheriff',
];

const divisions = ['FTO', 'SS', 'DTU', 'GU'];
const permissions = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch', 'Pościgowe'];

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

  const getRoleColor = (role: string) => {
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

  // Loading State
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
            <p className="text-[#8fb5a0]">Zarządzaj personelem, nadawaj uprawnienia i kary</p>
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
                  onClick={() => toggleSelectAll([])}
                  className="px-4 py-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
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
