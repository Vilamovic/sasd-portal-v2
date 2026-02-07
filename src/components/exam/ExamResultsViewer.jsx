'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Search, Filter, Archive, Trash2, X, Calendar, Clock, FileText, ChevronLeft } from 'lucide-react';
import { getAllExamResultsNonArchived, getAllExamResultsArchived, archiveExamResult, deleteExamResult } from '@/src/lib/db/exams';

/**
 * ExamResultsViewer - Unified component for active and archived exam results
 * @param {string} mode - 'active' or 'archived'
 */
export default function ExamResultsViewer({ mode = 'active' }) {
  const { user, loading: authLoading, isCS } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isArchiveMode = mode === 'archived';
  const pageTitle = isArchiveMode ? 'Archiwum Egzaminów' : 'Statystyki Egzaminów';

  useEffect(() => {
    if (!authLoading && user) {
      loadResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, mode]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const fetchFunction = isArchiveMode ? getAllExamResultsArchived : getAllExamResultsNonArchived;
      const { data, error } = await fetchFunction();

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error(`Error loading ${isArchiveMode ? 'archived' : 'active'} results:`, error);
      alert(`Błąd podczas ładowania ${isArchiveMode ? 'archiwum' : 'wyników'}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (resultId, userName) => {
    if (!confirm(`Czy na pewno chcesz zarchiwizować wynik egzaminu użytkownika "${userName}"?`)) return;

    try {
      const { error } = await archiveExamResult(resultId);
      if (error) throw error;

      await loadResults();
      alert('Wynik zarchiwizowany.');
    } catch (error) {
      console.error('Error archiving result:', error);
      alert('Błąd podczas archiwizacji wyniku.');
    }
  };

  const handleDelete = async (resultId, userName) => {
    if (!confirm(`Czy na pewno chcesz USUNĄĆ wynik egzaminu użytkownika "${userName}"? Tej operacji nie można cofnąć.`)) return;

    try {
      const { error } = await deleteExamResult(resultId);
      if (error) throw error;

      await loadResults();
      setShowDetailsModal(false);
      setSelectedResult(null);
      alert('Wynik usunięty.');
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Błąd podczas usuwania wyniku.');
    }
  };

  const openDetailsModal = (result) => {
    setSelectedResult(result);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedResult(null);
  };

  // Access control
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227] mb-4"></div>
          <p className="text-[#8fb5a0]">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isCS) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center px-6">
        <div className="text-center max-w-md glass-strong rounded-2xl p-8 border border-[#1a4d32]/50">
          <div className="mb-6 text-6xl">🚫</div>
          <h2 className="text-2xl font-bold text-white mb-4">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            {pageTitle} są dostępne tylko dla CS+.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#c9a227] hover:bg-[#e6b830] text-[#051a0f] rounded-xl font-medium transition-all duration-200"
          >
            Powrót do Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Filtering
  const examTypes = [...new Set(results.map((r) => r.exam_type))];
  const filteredResults = results.filter((result) => {
    const matchesSearch =
      !searchTerm ||
      result.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.exam_type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterExamType === 'all' || result.exam_type === filterExamType;
    return matchesSearch && matchesFilter;
  });

  // Render Details Modal
  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedResult) return null;

    const passedQuestions = selectedResult.answers?.filter((a) => a.correct).length || 0;
    const totalQuestions = selectedResult.answers?.length || 0;
    const scorePercentage = totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 0;
    const passed = selectedResult.passed;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
        <div className="bg-[#051a0f] border border-[#1a4d32]/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="px-8 py-6 border-b border-[#1a4d32]/50 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Szczegóły Egzaminu</h2>
              <p className="text-[#8fb5a0]">
                <span className="font-medium text-white">{selectedResult.user_name || 'Nieznany'}</span>
                {' • '}
                {selectedResult.exam_type}
              </p>
            </div>
            <button
              onClick={closeDetailsModal}
              className="p-2.5 bg-[#051a0f]/80 hover:bg-red-500/20 border border-[#1a4d32]/50 hover:border-red-500/50 rounded-xl transition-all duration-200 group"
            >
              <X className="w-5 h-5 text-[#8fb5a0] group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-8 py-6 overflow-y-auto flex-1">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Score Card */}
              <div className="glass-strong rounded-xl p-5 border border-[#1a4d32]/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <FileText className={`w-5 h-5 ${passed ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-[#8fb5a0] uppercase tracking-wider">Wynik</p>
                    <p className={`text-2xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                      {scorePercentage}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${passed ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                  <span className={`text-sm font-medium ${passed ? 'text-green-400' : 'text-red-400'}`}>
                    {passed ? 'Zdany' : 'Niezdany'}
                  </span>
                </div>
              </div>

              {/* Questions Card */}
              <div className="glass-strong rounded-xl p-5 border border-[#1a4d32]/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c9a227]/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#c9a227]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8fb5a0] uppercase tracking-wider">Pytania</p>
                    <p className="text-2xl font-bold text-white">
                      {passedQuestions}/{totalQuestions}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-[#8fb5a0]">Poprawne odpowiedzi</p>
              </div>

              {/* Date Card */}
              <div className="glass-strong rounded-xl p-5 border border-[#1a4d32]/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a4d32]/50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#8fb5a0]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8fb5a0] uppercase tracking-wider">Data</p>
                    <p className="text-sm font-medium text-white">
                      {new Date(selectedResult.created_at).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#8fb5a0]">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(selectedResult.created_at).toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#c9a227]" />
                Lista Pytań
              </h3>
              <div className="space-y-3">
                {selectedResult.answers?.map((answer, index) => (
                  <div
                    key={index}
                    className={`glass-strong rounded-xl p-4 border transition-all duration-200 ${
                      answer.correct
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                          answer.correct
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium mb-2 leading-relaxed">{answer.question}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              answer.correct
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {answer.correct ? '✓ Poprawna' : '✗ Błędna'}
                          </span>
                          <span className="text-xs text-[#8fb5a0]">
                            Odpowiedź: <span className="text-white font-medium">{answer.answer}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-8 py-5 border-t border-[#1a4d32]/50 bg-[#020a06]/50 flex items-center justify-between">
            <button
              onClick={closeDetailsModal}
              className="px-5 py-2.5 bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white rounded-xl transition-all duration-200 font-medium"
            >
              Zamknij
            </button>
            {isArchiveMode && (
              <button
                onClick={() => handleDelete(selectedResult.id, selectedResult.user_name)}
                className="px-5 py-2.5 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Usuń Wynik
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            {isArchiveMode ? <Archive className="w-10 h-10 text-[#c9a227]" /> : <FileText className="w-10 h-10 text-[#c9a227]" />}
            {pageTitle}
          </h1>
          <p className="text-[#8fb5a0]">
            Przeglądaj {isArchiveMode ? 'zarchiwizowane' : 'aktywne'} wyniki egzaminów użytkowników
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 glass-strong rounded-2xl p-5 border border-[#1a4d32]/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
              <input
                type="text"
                placeholder="Szukaj po nazwie użytkownika lub typie egzaminu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#020a06]/50 border border-[#1a4d32]/50 rounded-xl text-white placeholder-[#8fb5a0]/50 focus:outline-none focus:border-[#c9a227]/50 transition-all"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value)}
                className="pl-12 pr-10 py-3 bg-[#020a06]/50 border border-[#1a4d32]/50 rounded-xl text-white focus:outline-none focus:border-[#c9a227]/50 transition-all appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">Wszystkie typy</option>
                {examTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-[#1a4d32]/30 flex items-center justify-between text-sm">
            <span className="text-[#8fb5a0]">
              Znaleziono: <span className="text-white font-medium">{filteredResults.length}</span> wyników
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-[#c9a227] hover:text-[#e6b830] transition-colors flex items-center gap-1"
              >
                Wyczyść wyszukiwanie
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="glass-strong rounded-2xl p-12 border border-[#1a4d32]/50 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c9a227] mb-4"></div>
            <p className="text-[#8fb5a0]">Ładowanie {isArchiveMode ? 'archiwum' : 'wyników'}...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 border border-[#1a4d32]/50 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-white mb-2">Brak wyników</h3>
            <p className="text-[#8fb5a0]">
              {searchTerm || filterExamType !== 'all'
                ? 'Nie znaleziono wyników pasujących do filtrów.'
                : `Brak ${isArchiveMode ? 'zarchiwizowanych' : 'aktywnych'} wyników egzaminów.`}
            </p>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a4d32]/50 bg-[#020a06]/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Typ Egzaminu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Wynik
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-[#8fb5a0] uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a4d32]/30">
                  {filteredResults.map((result, index) => {
                    const passedQuestions = result.answers?.filter((a) => a.correct).length || 0;
                    const totalQuestions = result.answers?.length || 0;
                    const scorePercentage =
                      totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 0;

                    return (
                      <tr
                        key={result.id}
                        className="hover:bg-[#051a0f]/50 transition-colors"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-medium">{result.user_name || 'Nieznany'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[#8fb5a0]">{result.exam_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-white font-medium">
                            {passedQuestions}/{totalQuestions} ({scorePercentage}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                              result.passed
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${result.passed ? 'bg-green-400' : 'bg-red-400'}`}
                            />
                            {result.passed ? 'Zdany' : 'Niezdany'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-[#8fb5a0] text-sm">
                          {new Date(result.created_at).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openDetailsModal(result)}
                              className="px-4 py-2 bg-[#c9a227]/20 hover:bg-[#c9a227] border border-[#c9a227]/50 hover:border-[#c9a227] text-[#c9a227] hover:text-[#051a0f] rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                              Szczegóły
                            </button>
                            {!isArchiveMode && (
                              <button
                                onClick={() => handleArchive(result.id, result.user_name)}
                                className="p-2.5 bg-[#1a4d32]/20 hover:bg-[#1a4d32] border border-[#1a4d32]/50 hover:border-[#22693f] rounded-lg transition-all duration-200 group"
                                title="Archiwizuj"
                              >
                                <Archive className="w-4 h-4 text-[#8fb5a0] group-hover:text-white transition-colors" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}
