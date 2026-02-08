import { useState, useEffect } from 'react';
import { supabase } from '@/src/supabaseClient';
import {
  createExamAccessToken,
  getAllExamTokens,
  deleteExamAccessToken,
} from '@/src/lib/db/tokens';
import { getAllExamTypes } from '@/src/lib/db/exams';

interface User {
  id: string;
  username: string;
  mta_nick?: string;
  email: string;
}

interface ExamType {
  id: number;
  name: string;
}

interface Token {
  id: string;
  user_username?: string;
  user_mta_nick?: string;
  exam_type_name?: string;
  token: string;
  used: boolean;
  created_at: string;
  expires_at: string;
}

interface UseTokenManagementReturn {
  tokens: Token[];
  examTypes: ExamType[];
  users: User[];
  loading: boolean;
  searchQuery: string;
  generating: boolean;
  selectedUserId: string;
  selectedExamTypeId: string;
  copiedToken: string | null;
  filteredTokens: Token[];
  setSearchQuery: (query: string) => void;
  setSelectedUserId: (userId: string) => void;
  setSelectedExamTypeId: (examTypeId: string) => void;
  handleGenerateToken: (currentUserId: string) => Promise<void>;
  handleDeleteToken: (tokenId: string, username?: string) => Promise<void>;
  handleCopyToken: (token: string) => void;
}

/**
 * useTokenManagement - Token management state and logic
 * - Load tokens, users, exam types
 * - Generate/Delete tokens
 * - Search and filter
 * - Copy to clipboard
 */
export function useTokenManagement(): UseTokenManagementReturn {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Load tokens
  const loadTokens = async () => {
    try {
      const { data, error } = await getAllExamTokens();
      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);

      // Load exam types
      const { data: examTypesData, error: examTypesError } = await getAllExamTypes();
      if (examTypesError) throw examTypesError;
      setExamTypes(examTypesData || []);

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, mta_nick, email')
        .order('username', { ascending: true });
      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load tokens
      await loadTokens();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Generate token
  const handleGenerateToken = async (currentUserId: string) => {
    if (!selectedUserId || !selectedExamTypeId) {
      alert('Wybierz użytkownika i typ egzaminu.');
      return;
    }

    if (!confirm('Wygenerować nowy token dostępu?')) {
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await createExamAccessToken(
        selectedUserId,
        parseInt(selectedExamTypeId),
        currentUserId
      );

      if (error) throw error;

      alert(`Token wygenerowany!\n\nToken: ${data.token}\n\nToken został skopiowany do schowka.`);

      // Copy to clipboard
      navigator.clipboard.writeText(data.token);

      // Reset form
      setSelectedUserId('');
      setSelectedExamTypeId('');

      // Reload tokens
      await loadTokens();
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Błąd podczas generowania tokenu.');
    } finally {
      setGenerating(false);
    }
  };

  // Delete token
  const handleDeleteToken = async (tokenId: string, username?: string) => {
    if (!confirm(`Usunąć token dla użytkownika ${username || 'N/A'}?`)) {
      return;
    }

    try {
      const { error } = await deleteExamAccessToken(parseInt(tokenId));
      if (error) throw error;

      alert('Token usunięty.');
      await loadTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('Błąd podczas usuwania tokenu.');
    }
  };

  // Copy token to clipboard
  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Filter tokens
  const filteredTokens = tokens.filter((t) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      t.user_username?.toLowerCase().includes(searchLower) ||
      t.user_mta_nick?.toLowerCase().includes(searchLower) ||
      t.exam_type_name?.toLowerCase().includes(searchLower)
    );
  });

  return {
    tokens,
    examTypes,
    users,
    loading,
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
  };
}
