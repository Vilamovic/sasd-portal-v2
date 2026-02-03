'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { getAllExamResultsNonArchived, archiveExamResult, getAllExamTypes } from '@/src/utils/supabaseHelpers';
import { Search, Archive, Eye, X, CheckCircle, XCircle } from 'lucide-react';

/**
 * ExamStatistics - Wyświetlanie wyników egzaminów
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

      // Usuń z listy
      setExamResults(examResults.filter(r => r.id !== examId));
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
        <div className="bg-[#1e2836] rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {users?.mta_nick || users?.email || 'Brak nicku'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {users?.badge || 'Brak badge'}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
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
                    className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4"
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-white font-semibold flex-grow">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="flex-shrink-0 ml-4">
                        {isTimeout ? (
                          <span className="text-gray-400 text-sm">
                            Nie wybrano odpowiedzi (czas minął)
                          </span>
                        ) : isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
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

                        let bgColor = 'bg-white/5';
                        let textColor = 'text-gray-400';
                        let label = '';

                        if (isTimeout) {
                          // Timeout - pokaż tylko poprawne
                          if (isCorrectOption) {
                            bgColor = 'bg-blue-500/20';
                            textColor = 'text-blue-400';
                            label = '(Poprawna)';
                          }
                        } else {
                          // Zielone: wybrano poprawnie
                          if (isUserAnswer && isCorrectOption) {
                            bgColor = 'bg-green-500/20';
                            textColor = 'text-green-400';
                            label = '(Poprawnie wybrano)';
                          }
                          // Niebieskie: poprawna nie wybrana
                          else if (!isUserAnswer && isCorrectOption) {
                            bgColor = 'bg-blue-500/20';
                            textColor = 'text-blue-400';
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
                            className={`p-3 rounded ${bgColor} ${textColor} text-sm`}
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
          <div className="p-6 border-t border-white/10">
            <button
              onClick={() => setShowDetails(false)}
              className="w-full px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center p-8">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
          <p className="text-gray-400 mb-6">
            Tylko administratorzy mogą przeglądać statystyki egzaminów.
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
          <p className="text-gray-400">Ładowanie statystyk...</p>
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
            STATYSTYKI EGZAMINÓW
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
          <p className="text-gray-400 mt-4">
            Przeglądaj wyniki egzaminów i statystyki
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
                      Brak wyników do wyświetlenia
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
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedResult(result);
                                setShowDetails(true);
                              }}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                              title="Szczegóły"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleArchive(result.id)}
                              className="p-2 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-colors"
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
          className="mt-8 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          ← Powrót
        </button>
      </div>

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}
