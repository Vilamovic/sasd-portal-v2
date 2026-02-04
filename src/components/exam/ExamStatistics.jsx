'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamResultsNonArchived, archiveExamResult, getAllExamTypes } from '@/src/utils/supabaseHelpers';
import { Search, Archive, Eye, X, CheckCircle, XCircle, ChevronLeft, Sparkles, BarChart3, Filter } from 'lucide-react';

/**
 * ExamStatistics - Premium Sheriff-themed exam results viewer
 * - Wyszukiwanie po nicku/ID
 * - Filtrowanie po typie egzaminu
 * - Archiwizacja
 * - Szczegóły pytanie-po-pytaniu
 * - Header: Nick (główny), Badge (podtytuł)
 * - Multiple choice support w wynikach
 */
export default function ExamStatistics({ onBack }) {
  const { role, isAdmin } = useAuth();
  const [examResults, setExamResults] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Załaduj wyniki i typy egzaminów
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Pobierz wyniki (nie-zarchiwizowane)
      const { data: results, error: resultsError } = await getAllExamResultsNonArchived();
      if (resultsError) throw resultsError;

      // Pobierz typy egzaminów
      const { data: types, error: typesError } = await getAllExamTypes();
      if (typesError) throw typesError;

      setExamResults(results || []);
      setExamTypes(types || []);
    } catch (error) {
      console.error('Error loading exam statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Archiwizuj egzamin
  const handleArchive = async (examId) => {
    if (!confirm('Czy na pewno chcesz zarchiwizować ten egzamin?')) return;

    try {
      const { error } = await archiveExamResult(examId);
      if (error) throw error;

      // Usuń z listy (używamy exam_id bo to jest klucz w bazie)
      setExamResults(examResults.filter(r => r.exam_id !== examId));
      alert('Egzamin zarchiwizowany.');
    } catch (error) {
      console.error('Error archiving exam:', error);
      alert('Błąd podczas archiwizacji.');
    }
  };

  // Filtrowanie wyników
  const filteredResults = examResults.filter((result) => {
    // Filtr po wyszukiwanym tekście (nick lub ID)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      result.users?.mta_nick?.toLowerCase().includes(searchLower) ||
      result.exam_id?.toLowerCase().includes(searchLower);

    // Filtr po typie egzaminu
    const matchesType =
      selectedType === 'all' || result.exam_type_id === parseInt(selectedType);

    return matchesSearch && matchesType;
  });

  // Modal szczegółów egzaminu
  const renderDetailsModal = () => {
    if (!showDetails || !selectedResult) return null;

    const { questions, answers, users } = selectedResult;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-strong rounded-2xl border border-[#1a4d32] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#1a4d32] bg-gradient-to-r from-[#0a2818]/50 to-transparent">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {users?.mta_nick || users?.email || 'Brak nicku'}
                </h3>
                <p className="text-[#8fb5a0] text-sm">
                  {users?.badge || 'Brak badge'}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-[#8fb5a0] hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Questions */}
          <div className="p-6 overflow-y-auto flex-grow">
            <div className="space-y-6">
              {questions.map((question, qIndex) => {
                const userAnswer = answers[question.id];
                const correctAnswers = question.correct_answers;
                const isTimeout = userAnswer === -1;

                // Sprawdź czy odpowiedź jest poprawna
                let isCorrect = false;
                if (!isTimeout) {
                  if (question.is_multiple_choice) {
                    // Multiple choice - porównaj tablice
                    const sortedUser = [...(userAnswer || [])].sort((a, b) => a - b);
                    const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);
                    isCorrect =
                      sortedUser.length === sortedCorrect.length &&
                      sortedUser.every((val, idx) => val === sortedCorrect[idx]);
                  } else {
                    // Single choice
                    isCorrect = userAnswer === correctAnswers[0];
                  }
                }

                return (
                  <div
                    key={qIndex}
                    className="glass rounded-xl border border-[#1a4d32]/50 p-5"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-white font-semibold flex-grow">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="flex-shrink-0 ml-4">
                        {isTimeout ? (
                          <span className="text-[#8fb5a0] text-sm">
                            Nie wybrano odpowiedzi (czas minął)
                          </span>
                        ) : isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-[#22c55e]" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400" />
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                      {question.shuffledOptions?.map((option, oIndex) => {
                        const isUserAnswer = question.is_multiple_choice
                          ? userAnswer?.includes(oIndex)
                          : userAnswer === oIndex;
                        const isCorrectOption = correctAnswers.includes(oIndex);

                        let bgColor = 'bg-[#051a0f]/50';
                        let textColor = 'text-[#8fb5a0]';
                        let label = '';

                        if (isTimeout) {
                          // Timeout - pokaż tylko poprawne
                          if (isCorrectOption) {
                            bgColor = 'bg-[#14b8a6]/20';
                            textColor = 'text-[#14b8a6]';
                            label = '(Poprawna)';
                          }
                        } else {
                          // Zielone: wybrano poprawnie
                          if (isUserAnswer && isCorrectOption) {
                            bgColor = 'bg-[#22c55e]/20';
                            textColor = 'text-[#22c55e]';
                            label = '(Poprawnie wybrano)';
                          }
                          // Niebieskie: poprawna nie wybrana
                          else if (!isUserAnswer && isCorrectOption) {
                            bgColor = 'bg-[#14b8a6]/20';
                            textColor = 'text-[#14b8a6]';
                            label = '(Poprawna - nie wybrano)';
                          }
                          // Czerwone: wybrano błędnie
                          else if (isUserAnswer && !isCorrectOption) {
                            bgColor = 'bg-red-500/20';
                            textColor = 'text-red-400';
                            label = '(Błędnie wybrano)';
                          }
                        }

                        return (
                          <div
                            key={oIndex}
                            className={`p-3 rounded-lg border border-[#1a4d32]/30 ${bgColor} ${textColor} text-sm`}
                          >
                            {option} {label && <span className="font-semibold">{label}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#1a4d32]">
            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Access control - user nie ma dostępu
  if (role === 'user') {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-[#8fb5a0] mb-6">
            Tylko administratorzy mogą przeglądać statystyki egzaminów.
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
          <p className="text-[#8fb5a0]">Ładowanie statystyk...</p>
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
            <BarChart3 className="w-4 h-4" />
            <span>Statystyki</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-[#c9a227]" />
            <h2 className="text-4xl font-bold text-white">
              Statystyki <span className="text-gold-gradient">Egzaminów</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">
            Przeglądaj wyniki egzaminów ({examResults.length})
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
                      Brak wyników do wyświetlenia
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedResult(result);
                                setShowDetails(true);
                              }}
                              className="p-2.5 bg-[#14b8a6]/20 text-[#14b8a6] rounded-lg hover:bg-[#14b8a6]/30 transition-colors border border-[#14b8a6]/30"
                              title="Szczegóły"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(result.exam_id)}
                              className="p-2.5 bg-[#c9a227]/20 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/30 transition-colors border border-[#c9a227]/30"
                              title="Archiwizuj"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}
