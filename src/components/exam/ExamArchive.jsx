'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamResultsArchived, deleteExamResult, getAllExamTypes } from '@/src/utils/supabaseHelpers';
import { notifyAdminAction } from '@/src/utils/discord';
import { Archive, Search, Trash2, X, ChevronLeft, Filter, Sparkles } from 'lucide-react';

/**
 * ExamArchive - Premium Sheriff-themed exam archive
 * Archived exam results with search and delete functionality
 */
export default function ExamArchive({ onBack }) {
  const { role, isAdmin } = useAuth();
  const [archivedResults, setArchivedResults] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: results, error: resultsError } = await getAllExamResultsArchived();
      if (resultsError) throw resultsError;

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

  const handleDelete = async (examId, userNick) => {
    if (!confirm(`Czy na pewno chcesz TRWALE usunąć ten egzamin?\nTej operacji nie można cofnąć.`)) {
      return;
    }

    try {
      const { error } = await deleteExamResult(examId);
      if (error) throw error;

      notifyAdminAction({
        action: 'Usunięcie zarchiwizowanego egzaminu',
        details: `Nick: ${userNick}`,
      });

      setArchivedResults(archivedResults.filter(r => r.exam_id !== examId));
      alert('Egzamin usunięty trwale.');
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Błąd podczas usuwania egzaminu.');
    }
  };

  const filteredResults = archivedResults.filter((result) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      result.users?.mta_nick?.toLowerCase().includes(searchLower) ||
      result.exam_id?.toLowerCase().includes(searchLower);

    const matchesType =
      selectedType === 'all' || result.exam_type_id === parseInt(selectedType);

    return matchesSearch && matchesType;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
        <div className="text-center">
          <X className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            Tylko administratorzy mogą przeglądać archiwum egzaminów.
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4"></div>
          <p className="text-[#8fb5a0]">Ładowanie archiwum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Archiwum</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Archive className="w-8 h-8 text-[#c9a227]" />
            <h2 className="text-4xl font-bold text-white">
              Archiwum <span className="text-gold-gradient">Egzaminów</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">
            Zarchiwizowane egzaminy ({archivedResults.length})
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
            <input
              type="text"
              placeholder="Szukaj po nicku lub ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Wszystkie typy</option>
              {examTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Nick</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Typ Egzaminu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Wynik</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Procent</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#8fb5a0]">
                      Brak zarchiwizowanych egzaminów
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((result) => {
                    const examType = examTypes.find(t => t.id === result.exam_type_id);
                    return (
                      <tr key={result.id} className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors">
                        <td className="px-6 py-4 text-white">
                          {result.users?.mta_nick || result.users?.email || 'Brak nicku'}
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0]">
                          {examType?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-white">
                          {result.score} / {result.total_questions}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${
                            result.passed ? 'text-[#22c55e]' : 'text-red-400'
                          }`}>
                            {result.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {result.passed ? (
                            <span className="px-2 py-1 bg-[#22c55e]/20 text-[#22c55e] text-xs font-semibold rounded-full border border-[#22c55e]/30">
                              Zdany
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30">
                              Niezdany
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#8fb5a0] text-sm">
                          {new Date(result.created_at).toLocaleString('pl-PL')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDelete(result.id, result.users?.mta_nick || result.users?.email)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
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
          className="mt-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót</span>
        </button>
      </div>
    </div>
  );
}
