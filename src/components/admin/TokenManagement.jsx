'use client';

import { useState, useEffect, memo } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { supabase } from '@/src/supabaseClient';
import { createExamAccessToken, getAllExamTokens, deleteExamAccessToken, getAllExamTypes } from '@/src/utils/supabaseHelpers';
import { Key, Search, Trash2, Shield, ChevronLeft, Sparkles, Copy, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';

/**
 * TokenManagement - Premium Sheriff-themed token management
 * - Generate one-time access tokens for exams
 * - View all tokens with status
 * - Delete tokens
 * STYLE: Skopiowany 1:1 z AdminPanel.jsx (Sheriff Dark Green theme)
 */
const TokenManagement = memo(function TokenManagement({ onBack }) {
  const { user, isAdmin } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);

  // Form state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('');
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

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

  const loadTokens = async () => {
    try {
      const { data, error } = await getAllExamTokens();
      if (error) throw error;
      setTokens(data || []);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  const handleGenerateToken = async () => {
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
        user.id
      );

      if (error) throw error;

      alert(`✅ Token wygenerowany!\n\nToken: ${data.token}\n\nToken został skopiowany do schowka.`);

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

  const handleDeleteToken = async (tokenId, username) => {
    if (!confirm(`Usunąć token dla użytkownika ${username}?`)) {
      return;
    }

    try {
      const { error } = await deleteExamAccessToken(tokenId);
      if (error) throw error;

      alert('Token usunięty.');
      await loadTokens();
    } catch (error) {
      console.error('Error deleting token:', error);
      alert('Błąd podczas usuwania tokenu.');
    }
  };

  const handleCopyToken = (token) => {
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

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            Tylko administratorzy mogą zarządzać tokenami.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
          <p className="text-[#8fb5a0]">Ładowanie tokenów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>Panel administratora</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Key className="w-8 h-8 text-[#c9a227]" />
            <h2 className="text-4xl font-bold text-white">
              Tokeny <span className="text-gold-gradient">Egzaminacyjne</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">
            Zarządzanie tokenami dostępu do egzaminów ({filteredTokens.length})
          </p>
        </div>

        {/* Generate Token Form */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#c9a227]" />
            <h3 className="text-xl font-bold text-white">Wygeneruj Nowy Token</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Select User */}
            <div>
              <label className="block text-sm font-medium text-[#8fb5a0] mb-2">
                Użytkownik
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
              >
                <option value="">Wybierz użytkownika...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.mta_nick || u.username || u.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Exam Type */}
            <div>
              <label className="block text-sm font-medium text-[#8fb5a0] mb-2">
                Typ Egzaminu
              </label>
              <select
                value={selectedExamTypeId}
                onChange={(e) => setSelectedExamTypeId(e.target.value)}
                className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
              >
                <option value="">Wybierz typ egzaminu...</option>
                {examTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateToken}
                disabled={generating || !selectedUserId || !selectedExamTypeId}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generowanie...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Generuj Token
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
            <input
              type="text"
              placeholder="Szukaj po nicku, username lub typie egzaminu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>
        </div>

        {/* Tokens Table */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Użytkownik
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Nick MTA
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Typ Egzaminu
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Token
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Utworzono
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Wygasa
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                    Akcja
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-[#8fb5a0]">
                      Brak tokenów do wyświetlenia
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((t) => {
                    const isExpired = new Date(t.expires_at) < new Date();
                    const isUsed = t.used;
                    const isActive = !isExpired && !isUsed;

                    return (
                      <tr key={t.id} className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a4d32] to-[#22693f] flex items-center justify-center text-white font-bold">
                              {(t.user_username || '?')[0].toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{t.user_username || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0]">{t.user_mta_nick || 'Brak'}</td>
                        <td className="px-6 py-4 text-[#8fb5a0]">{t.exam_type_name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleCopyToken(t.token)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a4d32]/50 hover:bg-[#c9a227]/20 transition-colors group"
                            title="Kliknij aby skopiować"
                          >
                            <span className="text-white font-mono text-xs">
                              {t.token.substring(0, 8)}...
                            </span>
                            {copiedToken === t.token ? (
                              <CheckCircle className="w-4 h-4 text-[#22c55e]" />
                            ) : (
                              <Copy className="w-4 h-4 text-[#8fb5a0] group-hover:text-[#c9a227]" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            isUsed
                              ? 'bg-[#8fb5a0]/20 text-[#8fb5a0] border-[#8fb5a0]/30'
                              : isExpired
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/30'
                          }`}>
                            {isUsed ? 'Użyty' : isExpired ? 'Wygasły' : 'Aktywny'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                          {new Date(t.created_at).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                          {new Date(t.expires_at).toLocaleDateString('pl-PL')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteToken(t.id, t.user_username)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all duration-200 group"
                            title="Usuń token"
                          >
                            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90 text-white font-bold transition-all duration-300 hover:scale-[1.02] shadow-lg"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Panel Użytkowników</span>
          </Link>

          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Powrót do Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default TokenManagement;
