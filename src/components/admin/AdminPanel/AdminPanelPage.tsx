'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useAdminPanel } from './hooks/useAdminPanel';
import BackButton from '@/src/components/shared/BackButton';
import PageHeader from './PageHeader';
import SearchBar from './SearchBar';
import UsersTable from './UsersTable';
import RoleDropdown from './RoleDropdown';
import ActionButtons from './ActionButtons';
import AccessDenied from '@/src/components/shared/AccessDenied';
import LoadingState from '@/src/components/shared/LoadingState';

interface AdminPanelPageProps {
  onBack: () => void;
}

/**
 * AdminPanelPage - Admin Panel orchestrator
 * - User management (search, sort, update role, kick)
 * - Role hierarchy permissions (CS/HCS/Dev)
 * - Dropdown portal for actions
 * - Discord webhooks for admin actions
 */
export default function AdminPanelPage({ onBack }: AdminPanelPageProps) {
  const { user, role, isDev, isCS, isAdmin, mtaNick } = useAuth();

  // Actor object for Discord webhooks
  const actor = {
    mta_nick: mtaNick || undefined,
    username: user?.user_metadata?.username || user?.user_metadata?.full_name || undefined,
    email: user?.email || undefined,
  };

  const {
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
  } = useAdminPanel(isCS, actor);

  // Access control
  if (!isAdmin) {
    return <AccessDenied onBack={onBack} message="Tylko CS i wyżej mogą zarządzać użytkownikami." />;
  }

  if (loading) {
    return <LoadingState message="Ładowanie użytkowników..." />;
  }

  const currentUser = showActionDropdown
    ? filteredUsers.find((u) => u.id === showActionDropdown) || null
    : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={onBack} destination="Dashboard" />

        {/* Header */}
        <PageHeader userCount={filteredUsers.length} />

        {/* Search */}
        <div className="mb-4">
          <SearchBar value={searchQuery} onChange={setSearchQuery} isDev={isDev} />
        </div>

        {/* Users Table */}
        <UsersTable
          users={filteredUsers}
          currentUserId={user.id}
          isCS={isCS}
          isDev={isDev}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onToggleDropdown={handleToggleDropdown}
          buttonRefs={buttonRefs}
        />

        {/* Action Buttons */}
        <ActionButtons />
      </div>

      {/* Role Dropdown Portal */}
      {showActionDropdown !== null && typeof window !== 'undefined' && (
        <RoleDropdown
          currentUser={currentUser}
          currentUserId={user.id}
          role={role}
          isDev={isDev}
          dropdownPosition={dropdownPosition}
          dropdownRef={dropdownRef}
          onUpdateRole={handleUpdateRole}
          onKickUser={handleKickUser}
          onClose={() => handleToggleDropdown(showActionDropdown)}
        />
      )}
    </div>
  );
}
