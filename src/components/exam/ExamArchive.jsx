'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamResultsArchived, deleteExamResult, getAllExamTypes } from '@/src/utils/supabaseHelpers';
import { notifyAdminAction } from '@/src/utils/discord';
import { Search, Trash2, X } from 'lucide-react';

/**
 * ExamArchive - Archiwum zarchiwizowanych egzaminów
 * - Wyszukiwanie
 * - Trwałe usuwanie (Delete button)
 * - Discord webhooks przy usunięciu
 */
export default function ExamArchive({ onBack }) {
  const { role, isAdmin } = useAuth();
  const [archivedResults, setArchivedResults] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch archived results
      const { data: results, error: resultsError } = await getAllExamResultsArchived();
      if (resultsError) throw resultsError;

      // Fetch exam types
      const { data: types, error: typesError } = await getAllExamTypes();
      if (typesError) throw typesError;

      setArchivedResults(results || []);
      setExamTypes(types || []);
    } catch (error) {
      console.error('Error loading archive:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete exam (permanent)
  const handleDelete = async (examId, userNick) => {
    if (!confirm(`Czy na pewno chcesz TRWALE usunąć ten egzamin?\nTej operacji nie można cofnąć.`)) {
      return;
    }

    try {
      const { error } = await deleteExamResult(examId);
      if (error) throw error;

      // Discord webhook
      notifyAdminAction({
        action: 'Usunięcie zarchiwizowanego egzaminu',
        details: `Nick: ${userNick}`,
      });

      // Remove from list (używamy exam_id bo to jest klucz w bazie)
      setArchivedResults(archivedResults.filter(r => r.exam_id !== examId));
      alert('Egzamin usunięty trwale.');
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Błąd podczas usuwania egzaminu.');
    }
  };

  // Filter results
  const filteredResults = archivedResults.filter((result) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      result.users?.mta_nick?.toLowerCase().includes(searchLower) ||
      result.exam_id?.toLowerCase().includes(searchLower);

    // Type filter
    const matchesType =
      selectedType === 'all' || result.exam_type_id === parseInt(selectedType);

    return matchesSearch && matchesType;
  });

  // Access control
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center p-8">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-gray-400 mb-6">
            Tylko administratorzy mogą przeglądać archiwum egzaminów.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Ładowanie archiwum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            ARCHIWUM EGZAMINÓW
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
          <p className="text-gray-400 mt-4">
            Zarchiwizowane egzaminy ({archivedResults.length})
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po nicku lub ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
          >
            <option value="all" className="bg-[#1e2836]">Wszystkie typy</option>
            {examTypes.map((type) => (
              <option key={type.id} value={type.id} className="bg-[#1e2836]">
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Results Table */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nick</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Typ Egzaminu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Wynik</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Procent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Brak zarchiwizowanych egzaminów
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => {
                    const examType = examTypes.find(t => t.id === result.exam_type_id);
                    return (
                      <tr key={result.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-white">
                          {result.users?.mta_nick || result.users?.email || 'Brak nicku'}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {examType?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-white">
                          {result.score} / {result.total_questions}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            result.passed ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {result.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {result.passed ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                              Zdany
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded">
                              Niezdany
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(result.created_at).toLocaleString('pl-PL')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(result.id, result.users?.mta_nick || result.users?.email)}
                            className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            title="Usuń trwale"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          ← Powrót
        </button>
      </div>
    </div>
  );
}
