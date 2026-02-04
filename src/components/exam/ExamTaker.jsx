'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { generateExam, calculateExamResult } from '@/src/utils/examUtils';
import { getAllExamTypes, getQuestionsByExamType, saveExamResult, verifyAndConsumeExamToken } from '@/src/utils/supabaseHelpers';
import { notifyExamSubmission, notifyCheat } from '@/src/utils/discord';
import { Target, Clock, CheckCircle, XCircle, ArrowRight, ChevronLeft, Trophy, AlertCircle, Sparkles, Key } from 'lucide-react';

/**
 * ExamTaker - Premium Sheriff-themed exam interface
 * - Wybór typu egzaminu
 * - Pytania z timerem
 * - Multiple choice support (checkboxes)
 * - Auto-advance przy timeout
 * - Brak przycisku "Poprzednie"
 */
export default function ExamTaker({ onBack }) {
  const { user, mtaNick } = useAuth();
  const [examTypes, setExamTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [exam, setExam] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const timerRef = useRef(null);
  const submittingRef = useRef(false);

  // One-Time Access Token state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [pendingExamTypeId, setPendingExamTypeId] = useState(null);

  // Załaduj typy egzaminów i odzyskaj stan egzaminu z localStorage
  useEffect(() => {
    loadExamTypes();
    recoverExamState();
  }, []);

  const loadExamTypes = async () => {
    try {
      const { data, error } = await getAllExamTypes();
      if (error) throw error;
      setExamTypes(data || []);
    } catch (error) {
      console.error('Error loading exam types:', error);
    } finally {
      setLoading(false);
    }
  };

  // Zapisz stan egzaminu do localStorage
  const saveExamState = useCallback(() => {
    if (!exam || showResults) return;

    const examState = {
      exam,
      selectedType,
      currentQuestionIndex,
      answers,
      timeLeft,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(`exam_state_${user.id}`, JSON.stringify(examState));
    } catch (error) {
      console.error('Error saving exam state:', error);
    }
  }, [exam, selectedType, currentQuestionIndex, answers, timeLeft, showResults, user]);

  // Odzyskaj stan egzaminu z localStorage
  const recoverExamState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(`exam_state_${user.id}`);
      if (!savedState) return;

      const examState = JSON.parse(savedState);
      const timeSinceLastSave = Date.now() - examState.timestamp;

      // Jeśli minęło więcej niż 1 godzina, usuń stan (wygasł)
      if (timeSinceLastSave > 3600000) {
        localStorage.removeItem(`exam_state_${user.id}`);
        return;
      }

      // Przywróć stan egzaminu
      setExam(examState.exam);
      setSelectedType(examState.selectedType);
      setCurrentQuestionIndex(examState.currentQuestionIndex);
      setAnswers(examState.answers);
      setTimeLeft(examState.timeLeft);

      console.log('✅ Exam state recovered from localStorage');
    } catch (error) {
      console.error('Error recovering exam state:', error);
      localStorage.removeItem(`exam_state_${user.id}`);
    }
  }, [user]);

  // Wyczyść stan egzaminu z localStorage
  const clearExamState = useCallback(() => {
    try {
      localStorage.removeItem(`exam_state_${user.id}`);
    } catch (error) {
      console.error('Error clearing exam state:', error);
    }
  }, [user]);

  // Rozpocznij egzamin - najpierw pokaż modal z tokenem
  const startExam = (examTypeId) => {
    setPendingExamTypeId(examTypeId);
    setTokenInput('');
    setTokenError('');
    setShowTokenModal(true);
  };

  // Weryfikuj token i rozpocznij egzamin
  const verifyTokenAndStart = async () => {
    if (!tokenInput.trim()) {
      setTokenError('Proszę wprowadzić token dostępu.');
      return;
    }

    setVerifyingToken(true);
    setTokenError('');

    try {
      // Weryfikuj i konsumuj token przez RPC
      const { data, error } = await verifyAndConsumeExamToken(
        tokenInput.trim(),
        user.id,
        pendingExamTypeId
      );

      if (error || !data?.success) {
        setTokenError(data?.error || 'Nieprawidłowy token. Sprawdź i spróbuj ponownie.');
        setVerifyingToken(false);
        return;
      }

      // Token zweryfikowany - rozpocznij egzamin
      setShowTokenModal(false);
      setLoading(true);

      const { data: questions, error: questionsError } = await getQuestionsByExamType(pendingExamTypeId);

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) {
        alert('Brak pytań dla tego typu egzaminu.');
        setLoading(false);
        return;
      }

      // Wygeneruj egzamin (losowanie i shuffle)
      const generatedExam = generateExam(questions, 10);

      setSelectedType(examTypes.find(t => t.id === pendingExamTypeId));
      setExam(generatedExam);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(generatedExam.questions[0]?.time_limit || 30);
      setLoading(false);
    } catch (error) {
      console.error('Error verifying token or starting exam:', error);
      setTokenError('Błąd podczas weryfikacji tokenu. Spróbuj ponownie.');
      setVerifyingToken(false);
    }
  };

  // Następne pytanie lub zakończ egzamin
  const handleNextQuestion = useCallback(async (isTimeout = false) => {
    if (submittingRef.current) return;

    const currentQuestion = exam.questions[currentQuestionIndex];

    // Jeśli timeout i brak odpowiedzi, zapisz -1
    const currentAnswer = answers[currentQuestion.id];
    const noAnswer = currentAnswer === undefined ||
      (Array.isArray(currentAnswer) && currentAnswer.length === 0);

    if (isTimeout && noAnswer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: -1,
      }));
    }

    // Ostatnie pytanie - zakończ egzamin
    if (currentQuestionIndex === exam.questions.length - 1) {
      await finishExam(isTimeout ? { ...answers, [currentQuestion.id]: -1 } : answers);
      return;
    }

    // Następne pytanie
    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setTimeLeft(exam.questions[nextIndex]?.time_limit || 30);
  }, [exam, currentQuestionIndex, answers, submittingRef]);

  // Timer countdown
  useEffect(() => {
    if (!exam || showResults) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout - auto advance
          handleNextQuestion(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestionIndex, exam, showResults, handleNextQuestion]);

  // Auto-save exam state do localStorage
  useEffect(() => {
    saveExamState();
  }, [saveExamState]);

  // 🚨 CHEATING ALERTS: Monitoring visibilitychange & window.blur
  useEffect(() => {
    if (!exam || showResults) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        console.warn('⚠️ CHEATING DETECTED: User switched tabs');

        // Zakończ egzamin ze skutkiem negatywnym (0 punktów)
        const failedAnswers = {};
        exam.questions.forEach(q => {
          failedAnswers[q.id] = -1; // -1 = brak odpowiedzi/timeout
        });

        // Wyślij alert do Admina przez Discord
        await notifyCheat({
          username: user?.user_metadata?.username || 'Unknown',
          mtaNick: mtaNick || 'Brak',
          email: user?.email || 'N/A',
          examType: selectedType?.name || 'Unknown',
          cheatType: 'tab_switch',
          timestamp: new Date().toISOString(),
        });

        alert('🚨 UWAGA: Wykryto przełączenie karty. Egzamin zostaje zakończony ze skutkiem negatywnym.');

        // Zakończ egzamin
        await finishExam(failedAnswers);
      }
    };

    const handleWindowBlur = async () => {
      console.warn('⚠️ CHEATING DETECTED: Window lost focus');

      // Zakończ egzamin ze skutkiem negatywnym
      const failedAnswers = {};
      exam.questions.forEach(q => {
        failedAnswers[q.id] = -1;
      });

      // Wyślij alert do Admina przez Discord
      await notifyCheat({
        username: user?.user_metadata?.username || 'Unknown',
        mtaNick: mtaNick || 'Brak',
        email: user?.email || 'N/A',
        examType: selectedType?.name || 'Unknown',
        cheatType: 'window_blur',
        timestamp: new Date().toISOString(),
      });

      alert('🚨 UWAGA: Wykryto wyjście z okna egzaminu. Egzamin zostaje zakończony ze skutkiem negatywnym.');

      // Zakończ egzamin
      await finishExam(failedAnswers);
    };

    // Dodaj event listenery
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [exam, showResults, selectedType, mtaNick, user]);

  // Handle answer selection
  const handleAnswerSelect = (optionIndex) => {
    const currentQuestion = exam.questions[currentQuestionIndex];

    if (currentQuestion.is_multiple_choice) {
      // Multiple choice - toggle checkbox
      const currentAnswers = answers[currentQuestion.id] || [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter(a => a !== optionIndex)
        : [...currentAnswers, optionIndex];

      setAnswers({
        ...answers,
        [currentQuestion.id]: newAnswers,
      });
    } else {
      // Single choice - radio
      setAnswers({
        ...answers,
        [currentQuestion.id]: optionIndex,
      });
    }
  };

  // Zakończ egzamin i zapisz wyniki
  const finishExam = async (finalAnswers) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    try {
      // Oblicz wyniki (parametry: answers, questions)
      const result = calculateExamResult(finalAnswers, exam.questions);

      // Określ próg zdawalności (50% dla trainee/pościgowy/swat, 75% dla reszty)
      const examTypeName = selectedType.name.toLowerCase();
      const passingThreshold =
        examTypeName.includes('trainee') ||
        examTypeName.includes('pościgowy') ||
        examTypeName.includes('swat')
          ? 50
          : 75;

      const passed = result.percentage >= passingThreshold;

      // Przygotuj dane do zapisu
      const examData = {
        user_id: user.id,
        exam_type_id: selectedType.id,
        score: result.score,
        total_questions: result.totalQuestions,
        percentage: result.percentage,
        passed,
        answers: finalAnswers,
        questions: exam.questions,
        is_archived: false,
      };

      // Zapisz do bazy
      const { data: savedExam, error } = await saveExamResult(examData);

      if (error) throw error;

      // Discord notification
      notifyExamSubmission({
        username: mtaNick || user.email,
        examType: selectedType.name,
        score: result.score,
        total: result.totalQuestions,
        percentage: result.percentage,
        passed,
        passingThreshold,
        examId: savedExam.exam_id,
      });

      // Wyczyść zapisany stan egzaminu
      clearExamState();

      // Pokaż wyniki
      setResults({
        ...result,
        passed,
        passingThreshold,
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Błąd podczas zapisywania wyników egzaminu.');
    } finally {
      submittingRef.current = false;
    }
  };

  // Ekran wyboru typu egzaminu
  if (!exam && !loading) {
    return (
      <>
        {renderTokenModal()}
        <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
          </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Powrót</span>
            </button>
          )}

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Wybór egzaminu</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Wybierz Typ <span className="text-gold-gradient">Egzaminu</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
            <p className="text-[#8fb5a0]">Rozpocznij egzamin z wybranego zakresu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examTypes.map((type) => {
              const isEasy = type.passing_threshold === 50;
              return (
                <button
                  key={type.id}
                  onClick={() => startExam(type.id)}
                  className="group relative glass-strong rounded-xl border border-[#1a4d32]/50 hover:border-[#c9a227]/50 p-6 text-left hover:scale-[1.01] transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors">
                        {type.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${isEasy ? 'text-[#22c55e]' : 'text-[#c9a227]'}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isEasy
                            ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                            : 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30'
                        }`}>
                          Próg: {type.passing_threshold}%
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-[#8fb5a0] group-hover:text-[#c9a227] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      </>
    );
  }

  // Ekran ładowania
  if (loading) {
    return (
      <>
        {renderTokenModal()}
        <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] mx-auto mb-4" />
            <p className="text-[#8fb5a0]">Ładowanie egzaminu...</p>
          </div>
        </div>
      </>
    );
  }

  // Ekran wyników
  if (showResults && results) {
    return (
      <>
        {renderTokenModal()}
        <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8 relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none">
            <div className={`absolute top-1/4 -left-32 w-96 h-96 ${results.passed ? 'bg-[#22c55e]/10' : 'bg-red-500/10'} rounded-full blur-[120px] animate-pulse-glow`} />
          </div>

        <div className="relative z-10 max-w-lg w-full">
          <div
            className={`absolute -inset-4 rounded-3xl opacity-30 blur-2xl animate-pulse-glow`}
            style={{ background: results.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
          />

          <div className="relative glass-strong rounded-3xl border border-[#1a4d32] shadow-2xl overflow-hidden">
            {/* Top accent */}
            <div className={`h-1 bg-gradient-to-r ${results.passed ? 'from-transparent via-[#22c55e] to-transparent' : 'from-transparent via-red-500 to-transparent'}`} />

            {/* Header */}
            <div className={`${results.passed ? 'bg-[#22c55e]/10' : 'bg-red-500/10'} p-8 border-b border-[#1a4d32]`}>
              <div className="flex items-center justify-center mb-4">
                {results.passed ? (
                  <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center animate-pulse-glow">
                    <CheckCircle className="w-16 h-16 text-[#22c55e]" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse-glow">
                    <XCircle className="w-16 h-16 text-red-400" strokeWidth={2} />
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                {results.passed ? 'Gratulacje!' : 'Niestety...'}
              </h2>
              <p className="text-[#8fb5a0] text-center">
                {results.passed
                  ? 'Pomyślnie zdałeś egzamin!'
                  : `Nie udało się. Wymagane ${results.passingThreshold}%.`}
              </p>
            </div>

            {/* Results */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0a2818]/50 rounded-2xl p-5 border border-[#1a4d32] text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-[#c9a227]" />
                    <span className="text-sm text-[#8fb5a0]">Wynik</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {results.score}<span className="text-[#8fb5a0]">/{results.totalQuestions}</span>
                  </p>
                </div>

                <div className="bg-[#0a2818]/50 rounded-2xl p-5 border border-[#1a4d32] text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className={`w-5 h-5 ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`} />
                    <span className="text-sm text-[#8fb5a0]">Procent</span>
                  </div>
                  <p className={`text-3xl font-bold ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`}>
                    {results.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className={`mb-6 p-4 rounded-xl border ${results.passed ? 'bg-[#22c55e]/10 border-[#22c55e]/30' : 'bg-red-500/10 border-red-400/30'}`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`} />
                  <span className={`text-sm font-medium ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`}>
                    {results.passed ? 'Egzamin zaliczony' : `Wymagane minimum: ${results.passingThreshold}%`}
                  </span>
                </div>
              </div>

              <button
                onClick={onBack}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:opacity-90 text-[#020a06] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                Zakończ
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // Modal wprowadzania tokenu
  const renderTokenModal = () => {
    if (!showTokenModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="glass-strong rounded-2xl border border-[#c9a227] max-w-md w-full shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#1a4d32]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg">
                <Key className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Jednorazowy Token Dostępu</h3>
                <p className="text-sm text-[#8fb5a0]">Wymagany do rozpoczęcia egzaminu</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-[#8fb5a0] text-sm mb-4">
              Wprowadź token dostępu otrzymany od administratora. Token można użyć tylko raz.
            </p>

            <input
              type="text"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                setTokenError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !verifyingToken) {
                  verifyTokenAndStart();
                }
              }}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0]/50 focus:outline-none focus:border-[#c9a227] transition-colors mb-4 font-mono text-sm"
              disabled={verifyingToken}
              autoFocus
            />

            {tokenError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{tokenError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={verifyTokenAndStart}
                disabled={verifyingToken || !tokenInput.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
              >
                {verifyingToken ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Weryfikacja...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Weryfikuj i Rozpocznij
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowTokenModal(false);
                  setTokenInput('');
                  setTokenError('');
                  setPendingExamTypeId(null);
                }}
                disabled={verifyingToken}
                className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Ekran egzaminu
  if (!exam) return (
    <>
      {renderTokenModal()}
      {null}
    </>
  );

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const timerColor = timeLeft > 10 ? 'text-[#22c55e]' : timeLeft > 5 ? 'text-[#c9a227]' : 'text-red-400';
  const timerBgColor = timeLeft > 10 ? 'bg-[#22c55e]/10 border-[#22c55e]/30' : timeLeft > 5 ? 'bg-[#c9a227]/10 border-[#c9a227]/30' : 'bg-red-500/10 border-red-400/30';

  return (
    <>
      {renderTokenModal()}

    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{selectedType?.name}</h2>
              <span className="text-sm text-[#8fb5a0]">
                Pytanie {currentQuestionIndex + 1} z {exam.questions.length}
              </span>
            </div>

            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${timerBgColor}`}>
              <Clock className={`w-6 h-6 ${timerColor}`} />
              <div className="text-right">
                <div className="text-xs text-[#8fb5a0] uppercase tracking-wide">Czas</div>
                <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-[#0a2818] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#c9a227] to-[#e6b830] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32] p-8 mb-6 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-[#c9a227]/20 rounded-xl flex items-center justify-center border border-[#c9a227]/30">
              <span className="text-[#c9a227] font-bold text-lg">{currentQuestionIndex + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-white leading-relaxed flex-grow">
              {currentQuestion.question}
            </h3>
          </div>

          {currentQuestion.is_multiple_choice && (
            <div className="mb-6 px-4 py-2 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-lg inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#14b8a6]" />
              <span className="text-sm text-[#14b8a6] font-medium">Możesz wybrać wiele odpowiedzi</span>
            </div>
          )}

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion.shuffledOptions.map((option, index) => {
              const isSelected = currentQuestion.is_multiple_choice
                ? currentAnswer?.includes(index)
                : currentAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#c9a227]/20 border-[#c9a227] text-white shadow-lg'
                      : 'bg-[#0a2818]/30 border-[#1a4d32]/50 text-[#8fb5a0] hover:bg-[#0a2818]/50 hover:border-[#1a4d32]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 ${
                      currentQuestion.is_multiple_choice ? 'rounded-md' : 'rounded-full'
                    } border-2 transition-all ${
                      isSelected ? 'bg-[#c9a227] border-[#c9a227]' : 'bg-transparent border-[#8fb5a0]'
                    } flex items-center justify-center`}>
                      {isSelected && <CheckCircle className="w-4 h-4 text-[#020a06]" strokeWidth={3} />}
                    </div>
                    <span className="flex-grow font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => handleNextQuestion(false)}
          disabled={(() => {
            if (currentQuestion.is_multiple_choice) {
              return !currentAnswer || currentAnswer.length === 0;
            } else {
              return currentAnswer === undefined && currentAnswer !== 0;
            }
          })()}
          className="w-full px-6 py-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-bold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
        >
          {currentQuestionIndex === exam.questions.length - 1 ? 'Zakończ Egzamin' : 'Następne Pytanie'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
    </>
  );
}
