'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import { Search, Filter, Archive, Trash2, X, Calendar, Clock, FileText } from 'lucide-react';
import { getAllExamResultsNonArchived, getAllExamResultsArchived, archiveExamResult, deleteExamResult } from '@/src/lib/db/exams';
import BackButton from '@/src/components/shared/BackButton';

/**
 * ExamResultsViewer - Unified component for active and archived exam results
 * @param {string} mode - 'active' or 'archived'
 */
export default function ExamResultsViewer({ mode = 'active' }: { mode?: 'active' | 'archived' }) {
  const { user, loading: authLoading, isCS } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExamType, setFilterExamType] = useState('all');
  const [selectedResult, setSelectedResult] = useState<any>(null);
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

  const handleArchive = async (resultId: string, userName: string) => {
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

  const handleDelete = async (resultId: string, userName: string) => {
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

  const openDetailsModal = (result: any) => {
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="text-center panel-raised p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (!isCS) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: 'var(--mdt-content)' }}>
        <div className="text-center max-w-md panel-raised p-8" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="mb-4 panel-inset p-4" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <p className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>BRAK DOSTĘPU</p>
          </div>
          <h2 className="font-[family-name:var(--font-vt323)] text-xl mb-2" style={{ color: 'var(--mdt-content-text)' }}>Brak dostępu</h2>
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--mdt-muted-text)' }}>
            {pageTitle} są dostępne tylko dla CS+.
          </p>
          <a
            href="/dashboard"
            className="btn-win95 inline-flex items-center gap-2"
          >
            <span className="font-mono text-sm">Powrót do Dashboard</span>
          </a>
        </div>
      </div>
    );
  }

  // Helper: get display name and exam type from joined data
  const getUserName = (result: any) => result.users?.mta_nick || result.users?.username || 'Nieznany';
  const getExamType = (result: any) => result.exam_types?.name || 'Nieznany';

  // Filtering
  const examTypes = useMemo(() => [...new Set(results.map((r) => getExamType(r)))], [results]);
  const filteredResults = results.filter((result) => {
    const userName = getUserName(result);
    const examType = getExamType(result);
    const matchesSearch =
      !searchTerm ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      examType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterExamType === 'all' || examType === filterExamType;
    return matchesSearch && matchesFilter;
  });

  // Helper: reconstruct per-question details from questions + answers
  const getQuestionDetails = (result: any) => {
    const questions = Array.isArray(result.questions) ? result.questions : [];
    const answers = result.answers && typeof result.answers === 'object' ? result.answers : {};

    return questions.map((q: any) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;

      if (q.is_multiple_choice) {
        if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers)) {
          const sorted1 = [...userAnswer].sort((a, b) => a - b);
          const sorted2 = [...q.correct_answers].sort((a, b) => a - b);
          isCorrect = sorted1.length === sorted2.length && sorted1.every((v, i) => v === sorted2[i]);
        }
      } else {
        isCorrect = userAnswer === q.correct_answers?.[0];
      }

      const options = q.shuffledOptions || q.options || [];
      let answerText = 'Brak odpowiedzi';
      if (userAnswer === -1) {
        answerText = 'Timeout';
      } else if (Array.isArray(userAnswer)) {
        answerText = userAnswer.map((i: number) => options[i] || `Opcja ${i + 1}`).join(', ');
      } else if (typeof userAnswer === 'number' && options[userAnswer]) {
        answerText = options[userAnswer];
      }

      return {
        question: q.question,
        answer: answerText,
        correct: isCorrect,
        isTimeout: userAnswer === -1,
      };
    });
  };

  // Render Details Modal
  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedResult) return null;

    const passedQuestions = selectedResult.score || 0;
    const totalQuestions = selectedResult.total_questions || 0;
    const scorePercentage = totalQuestions > 0 ? Math.round((passedQuestions / totalQuestions) * 100) : 0;
    const passed = selectedResult.passed;
    const questionDetails = getQuestionDetails(selectedResult);

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <div className="panel-raised max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          {/* Modal Header - Blue title bar */}
          <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <h2 className="font-[family-name:var(--font-vt323)] text-lg text-white">
              Szczegóły Egzaminu - {getUserName(selectedResult)} / {getExamType(selectedResult)}
            </h2>
            <button
              onClick={closeDetailsModal}
              className="btn-win95 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {/* Score Card */}
              <div className="panel-inset p-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>WYNIK</span>
                </div>
                <p className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: passed ? '#006400' : '#8b0000' }}>
                  {scorePercentage}%
                </p>
                <span className="font-mono text-xs font-bold" style={{ color: passed ? '#006400' : '#8b0000' }}>
                  {passed ? 'Zdany' : 'Niezdany'}
                </span>
              </div>

              {/* Questions Card */}
              <div className="panel-inset p-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>PYTANIA</span>
                </div>
                <p className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: 'var(--mdt-content-text)' }}>
                  {passedQuestions}/{totalQuestions}
                </p>
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Poprawne odpowiedzi</span>
              </div>

              {/* Date Card */}
              <div className="panel-inset p-4" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>DATA</span>
                </div>
                <p className="font-mono text-sm font-medium" style={{ color: 'var(--mdt-content-text)' }}>
                  {new Date(selectedResult.created_at).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <div className="flex items-center gap-1 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                  <Clock className="w-3 h-3" />
                  {new Date(selectedResult.created_at).toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div>
              <div className="px-3 py-1 mb-3" style={{ backgroundColor: 'var(--mdt-header)' }}>
                <h3 className="font-[family-name:var(--font-vt323)] text-base flex items-center gap-2" style={{ color: '#ccc' }}>
                  <FileText className="w-4 h-4" />
                  Lista Pytań
                </h3>
              </div>
              <div className="space-y-2">
                {questionDetails.map((detail: any, index: number) => (
                  <div
                    key={index}
                    className="panel-inset p-3"
                    style={{
                      backgroundColor: detail.correct ? '#d0e8d0' : '#e8d0d0',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="font-mono text-xs font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center"
                        style={{ color: detail.correct ? '#006400' : '#8b0000' }}
                      >
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm mb-1" style={{ color: 'var(--mdt-content-text)' }}>{detail.question}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="font-mono text-xs font-bold"
                            style={{ color: detail.correct ? '#006400' : '#8b0000' }}
                          >
                            {detail.correct ? '[OK]' : '[ERR]'}
                          </span>
                          <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                            Odpowiedź: <span className="font-bold" style={{ color: 'var(--mdt-content-text)' }}>{detail.answer}</span>
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
          <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-btn-face)', borderTop: '1px solid var(--mdt-border-mid)' }}>
            <button
              onClick={closeDetailsModal}
              className="btn-win95"
            >
              <span className="font-mono text-sm">Zamknij</span>
            </button>
            {isArchiveMode && (
              <button
                onClick={() => handleDelete(selectedResult.exam_id, getUserName(selectedResult))}
                className="btn-win95 flex items-center gap-2"
                style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-mono text-sm">Usuń Wynik</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <BackButton onClick={() => router.push('/exams')} destination="Egzaminów" />

        {/* Header */}
        <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            {isArchiveMode ? <Archive className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
            <h1 className="font-[family-name:var(--font-vt323)] text-xl text-white">{pageTitle}</h1>
          </div>
          <div className="px-4 py-2">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              Przeglądaj {isArchiveMode ? 'zarchiwizowane' : 'aktywne'} wyniki egzaminów użytkowników
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-4 panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
              <input
                type="text"
                placeholder="Szukaj po nazwie użytkownika lub typie egzaminu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="panel-inset w-full pl-9 pr-3 py-2 font-mono text-sm"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--mdt-muted-text)' }} />
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value)}
                className="panel-inset pl-9 pr-3 py-2 font-mono text-sm cursor-pointer min-w-[200px]"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
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
          <div className="mt-3 pt-3 flex items-center justify-between font-mono text-xs" style={{ borderTop: '1px solid var(--mdt-border-mid)', color: 'var(--mdt-muted-text)' }}>
            <span>
              Znaleziono: <span className="font-bold" style={{ color: 'var(--mdt-content-text)' }}>{filteredResults.length}</span> wyników
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-win95 flex items-center gap-1"
              >
                <span className="font-mono text-xs">Wyczyść</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Results Table */}
        {loading ? (
          <div className="panel-raised p-8 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Ładowanie {isArchiveMode ? 'archiwum' : 'wyników'}...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="panel-raised p-8 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <p className="font-[family-name:var(--font-vt323)] text-xl mb-2" style={{ color: 'var(--mdt-content-text)' }}>Brak wyników</p>
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              {searchTerm || filterExamType !== 'all'
                ? 'Nie znaleziono wyników pasujących do filtrów.'
                : `Brak ${isArchiveMode ? 'zarchiwizowanych' : 'aktywnych'} wyników egzaminów.`}
            </p>
          </div>
        ) : (
          <div className="panel-raised overflow-hidden" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: 'var(--mdt-header)' }}>
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Użytkownik
                    </th>
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Typ Egzaminu
                    </th>
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Wynik
                    </th>
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Status
                    </th>
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Data
                    </th>
                    <th className="px-4 py-2 text-center font-[family-name:var(--font-vt323)] text-sm" style={{ color: '#ccc' }}>
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => {
                    const scorePercentage = result.percentage || 0;

                    return (
                      <tr
                        key={result.id}
                        style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                      >
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium" style={{ color: 'var(--mdt-content-text)' }}>{getUserName(result)}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>{getExamType(result)}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium" style={{ color: 'var(--mdt-content-text)' }}>
                            {result.score || 0}/{result.total_questions || 0} ({Math.round(scorePercentage)}%)
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span
                            className="font-mono text-xs font-bold"
                            style={{ color: result.passed ? '#006400' : '#8b0000' }}
                          >
                            {result.passed ? '[ZDANY]' : '[NIEZDANY]'}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                          {new Date(result.created_at).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openDetailsModal(result)}
                              className="btn-win95"
                            >
                              <span className="font-mono text-xs">Szczegóły</span>
                            </button>
                            {!isArchiveMode && (
                              <button
                                onClick={() => handleArchive(result.exam_id, getUserName(result))}
                                className="btn-win95"
                                title="Archiwizuj"
                              >
                                <Archive className="w-3 h-3" />
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
