'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { generateExam, calculateExamResult } from '@/src/utils/examUtils';
import { getAllExamTypes, getQuestionsByExamType, saveExamResult } from '@/src/utils/supabaseHelpers';
import { notifyExamSubmission } from '@/src/utils/discord';
import { Target, Clock, CheckCircle, XCircle, ArrowRight, ChevronLeft, Trophy, AlertCircle } from 'lucide-react';

/**
 * ExamTaker - Interface do zdawania egzaminów
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

  // Załaduj typy egzaminów
  useEffect(() => {
    loadExamTypes();
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

  // Rozpocznij egzamin
  const startExam = async (examTypeId) => {
    try {
      setLoading(true);
      const { data: questions, error } = await getQuestionsByExamType(examTypeId);

      if (error) throw error;
      if (!questions || questions.length === 0) {
        alert('Brak pytań dla tego typu egzaminu.');
        setLoading(false);
        return;
      }

      // Wygeneruj egzamin (losowanie i shuffle)
      const generatedExam = generateExam(questions, 10);

      setSelectedType(examTypes.find(t => t.id === examTypeId));
      setExam(generatedExam);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(generatedExam.questions[0]?.time_limit || 30);
      setLoading(false);
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Błąd podczas rozpoczynania egzaminu.');
      setLoading(false);
    }
  };

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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Powrót</span>
            </button>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">
              WYBIERZ TYP EGZAMINU
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full mb-3"></div>
            <p className="text-gray-400 text-sm">
              Rozpocznij egzamin z wybranego zakresu
            </p>
          </div>

          {/* Exam Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examTypes.map((type) => {
              const isEasy = type.passing_threshold === 50;
              return (
                <button
                  key={type.id}
                  onClick={() => startExam(type.id)}
                  className="group relative bg-police-dark-700 rounded-xl border border-white/10 hover:border-badge-gold-600/50 p-6 text-left hover:scale-[1.01] transition-all duration-300 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="w-6 h-6 text-police-dark-900" strokeWidth={2.5} />
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {type.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Trophy className={`w-4 h-4 ${isEasy ? 'text-green-400' : 'text-amber-400'}`} />
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isEasy
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                        }`}>
                          Próg: {type.passing_threshold}%
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-badge-gold-400 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Ekran ładowania
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-badge-gold-600/30 border-t-badge-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Ładowanie egzaminu...</p>
        </div>
      </div>
    );
  }

  // Ekran wyników
  if (showResults && results) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 flex items-center justify-center p-8">
        <div className="max-w-lg w-full">
          {/* Glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${results.passed ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-3xl opacity-20 blur-2xl`}></div>

          <div className="relative bg-police-dark-700 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${results.passed ? 'from-green-500/20 to-emerald-500/20' : 'from-red-500/20 to-red-600/20'} p-8 border-b border-white/10`}>
              <div className="flex items-center justify-center mb-4">
                {results.passed ? (
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-16 h-16 text-green-400" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-16 h-16 text-red-400" strokeWidth={2} />
                  </div>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                {results.passed ? 'Gratulacje!' : 'Niestety...'}
              </h2>
              <p className="text-gray-300 text-center">
                {results.passed
                  ? 'Pomyślnie zdałeś egzamin!'
                  : `Nie udało się. Wymagane ${results.passingThreshold}%.`}
              </p>
            </div>

            {/* Results */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Score */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-badge-gold-600" />
                    <span className="text-sm text-gray-400">Wynik</span>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {results.score}<span className="text-gray-400">/{results.totalQuestions}</span>
                  </p>
                </div>

                {/* Percentage */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className={`w-5 h-5 ${results.passed ? 'text-green-400' : 'text-red-400'}`} />
                    <span className="text-sm text-gray-400">Procent</span>
                  </div>
                  <p className={`text-3xl font-bold ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {results.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`mb-6 p-4 rounded-xl border ${results.passed ? 'bg-green-500/10 border-green-400/30' : 'bg-red-500/10 border-red-400/30'}`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${results.passed ? 'text-green-400' : 'text-red-400'}`} />
                  <span className={`text-sm font-medium ${results.passed ? 'text-green-300' : 'text-red-300'}`}>
                    {results.passed ? 'Egzamin zaliczony' : `Wymagane minimum: ${results.passingThreshold}%`}
                  </span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={onBack}
                className="w-full px-6 py-4 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 hover:from-badge-gold-400 hover:to-badge-gold-600 text-police-dark-900 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-badge-gold"
              >
                Zakończ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ekran egzaminu
  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  // Timer color based on time left
  const timerColor = timeLeft > 10 ? 'text-green-400' : timeLeft > 5 ? 'text-amber-400' : 'text-red-400';
  const timerBgColor = timeLeft > 10 ? 'bg-green-500/20 border-green-400/30' : timeLeft > 5 ? 'bg-amber-500/20 border-amber-400/30' : 'bg-red-500/20 border-red-400/30';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {selectedType.name}
              </h2>
              <span className="text-sm text-gray-400">
                Pytanie {currentQuestionIndex + 1} z {exam.questions.length}
              </span>
            </div>

            {/* Timer */}
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${timerBgColor}`}>
              <Clock className={`w-6 h-6 ${timerColor}`} />
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Czas</div>
                <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-police-dark-700 rounded-2xl border border-white/10 p-8 mb-6 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-badge-gold-600/20 rounded-xl flex items-center justify-center border border-badge-gold-600/30">
              <span className="text-badge-gold-600 font-bold text-lg">{currentQuestionIndex + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-white leading-relaxed flex-grow">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Multiple choice indicator */}
          {currentQuestion.is_multiple_choice && (
            <div className="mb-6 px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-lg inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">Możesz wybrać wiele odpowiedzi</span>
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
                      ? 'bg-badge-gold-600/20 border-badge-gold-600 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 ${
                      currentQuestion.is_multiple_choice ? 'rounded-md' : 'rounded-full'
                    } border-2 transition-all ${
                      isSelected
                        ? 'bg-badge-gold-600 border-badge-gold-600'
                        : 'bg-transparent border-gray-500'
                    } flex items-center justify-center`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-police-dark-900" strokeWidth={3} />
                      )}
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
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl hover:scale-[1.01]"
        >
          {currentQuestionIndex === exam.questions.length - 1 ? 'Zakończ Egzamin' : 'Następne Pytanie'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
