'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { generateExam, calculateExamResult } from '@/src/utils/examUtils';
import { getAllExamTypes, getQuestionsByExamType, saveExamResult } from '@/src/utils/supabaseHelpers';
import { notifyExamSubmission } from '@/src/utils/discord';
import { FileText, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">
              WYBIERZ TYP EGZAMINU
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"></div>
            <p className="text-gray-400 mt-4">
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
                  className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-left hover:bg-white/10 transition-all duration-300"
                >
                  {/* Icon */}
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-white mb-1">
                        {type.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          isEasy
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {type.passing_threshold}%
                        </span>
                        <span className="text-xs text-gray-400">
                          próg zdawalności
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </button>
              );
            })}
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

  // Ekran ładowania
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Ładowanie egzaminu...</p>
        </div>
      </div>
    );
  }

  // Ekran wyników
  if (showResults && results) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {results.passed ? (
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto" />
            ) : (
              <XCircle className="w-20 h-20 text-red-400 mx-auto" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {results.passed ? 'Gratulacje!' : 'Niestety...'}
          </h2>
          <p className="text-gray-400 mb-8">
            {results.passed
              ? 'Zdałeś egzamin!'
              : `Nie udało się. Wymagane ${results.passingThreshold}%.`}
          </p>

          {/* Results */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Wynik:</span>
              <span className="text-white font-bold">
                {results.score} / {results.totalQuestions}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-400">Procent:</span>
              <span className={`font-bold ${
                results.passed ? 'text-green-400' : 'text-red-400'
              }`}>
                {results.percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all"
          >
            Zakończ
          </button>
        </div>
      </div>
    );
  }

  // Ekran egzaminu
  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[#1a2332] via-[#1e2836] to-[#151c28] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {selectedType.name}
            </h2>
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold">{timeLeft}s</span>
            </div>
          </div>

          {/* Progress */}
          <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Pytanie {currentQuestionIndex + 1} z {exam.questions.length}
          </p>
        </div>

        {/* Question */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8 mb-6">
          <h3 className="text-xl font-semibold text-white mb-6">
            {currentQuestion.question}
          </h3>

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
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-yellow-500/20 border-yellow-400 text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded ${
                      currentQuestion.is_multiple_choice ? 'rounded-md' : 'rounded-full'
                    } border-2 ${
                      isSelected
                        ? 'bg-yellow-400 border-yellow-400'
                        : 'bg-transparent border-gray-500'
                    } flex items-center justify-center`}>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-gray-900" />
                      )}
                    </div>
                    <span className="flex-grow">{option}</span>
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
          className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {currentQuestionIndex === exam.questions.length - 1 ? 'Zakończ Egzamin' : 'Następne Pytanie'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
