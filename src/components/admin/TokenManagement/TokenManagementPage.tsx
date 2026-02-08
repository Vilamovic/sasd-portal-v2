'use client';

import { useAuth } from '@/src/contexts/AuthContext';
import { useTokenManagement } from './hooks/useTokenManagement';
import BackButton from '@/src/components/shared/BackButton';
import LoadingState from '@/src/components/shared/LoadingState';
import AccessDenied from '@/src/components/shared/AccessDenied';
import PageHeader from './PageHeader';
import GenerateTokenForm from './GenerateTokenForm';
import SearchBar from './SearchBar';
import TokensTable from './TokensTable';
import ActionButtons from './ActionButtons';

interface TokenManagementPageProps {
  onBack: () => void;
}

/**
 * TokenManagementPage - Token management orchestrator
 * - Generate one-time access tokens for exams (CS+ only)
 * - View all tokens with status (active/used/expired)
 * - Delete tokens
 * - Search by username, mta_nick, or exam type
 */
export default function TokenManagementPage({ onBack }: TokenManagementPageProps) {
  const { user, isCS } = useAuth();

  const {
    loading,
    examTypes,
    users,
    searchQuery,
    generating,
    selectedUserId,
    selectedExamTypeId,
    copiedToken,
    filteredTokens,
    setSearchQuery,
    setSelectedUserId,
    setSelectedExamTypeId,
    handleGenerateToken,
    handleDeleteToken,
    handleCopyToken,
  } = useTokenManagement();

  // Access control
  if (!isCS) {
    return <AccessDenied onBack={onBack} message="Tylko administratorzy mogą zarządzać tokenami." />;
  }

  if (loading) {
    return <LoadingState message="Ładowanie tokenów..." />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={onBack} destination="Dashboard" />

        {/* Header */}
        <PageHeader tokensCount={filteredTokens.length} />

        {/* Generate Token Form */}
        <GenerateTokenForm
          users={users}
          examTypes={examTypes}
          selectedUserId={selectedUserId}
          selectedExamTypeId={selectedExamTypeId}
          generating={generating}
          onUserChange={setSelectedUserId}
          onExamTypeChange={setSelectedExamTypeId}
          onGenerate={() => handleGenerateToken(user?.id || '')}
        />

        {/* Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Tokens Table */}
        <TokensTable
          tokens={filteredTokens}
          copiedToken={copiedToken}
          onCopyToken={handleCopyToken}
          onDeleteToken={handleDeleteToken}
        />

        {/* Action Buttons */}
        <ActionButtons />
      </div>
    </div>
  );
}
