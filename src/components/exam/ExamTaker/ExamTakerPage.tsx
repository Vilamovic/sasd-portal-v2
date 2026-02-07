'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { calculateExamResult } from '@/src/utils/examUtils';
import { getAllExamTypes, saveExamResult } from '@/src/lib/db/exams';
import { notifyExamSubmission, notifyCheat } from '@/src/lib/webhooks/exams';

// Components
import TokenModal from './TokenModal';
import ExamTypeSelection from './ExamTypeSelection';
import ExamResults from './ExamResults';
import ExamQuestion from './ExamQuestion';

// Hooks
import { useExamState } from './hooks/useExamState';
import { useExamTimer } from './hooks/useExamTimer';
import { useTokenVerification } from './hooks/useTokenVerification';

/**
 * ExamTakerPage - Orchestrator dla przepływu egzaminu
 *
 * Odpowiedzialności:
 * - Business logic (startExam, finishExam, handleNextQuestion)
 * - Cheating detection (visibilitychange, window.blur)
 * - Component composition (TokenModal, ExamTypeSelection, ExamQuestion, ExamResults)
 *
 * Struktura:
 * 1. Type Selection → 2. Token Verification (non-admin) → 3. Exam Flow → 4. Results
 */
export default function ExamTakerPage({ onBack }: { onBack?: () => void }) {
  const { user, mtaNick, isAdmin } = useAuth();

  // ==================== STATE ====================
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Refs
  const submittingRef = useRef(false);
  const cheatingDetectedRef = useRef(false);

  // ==================== CUSTOM HOOKS ====================

  // Exam state management (localStorage recovery + auto-save)
  const {
    exam,
    selectedType,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswers,
    timeLeft,
    setTimeLeft,
    recoverExamState,
    clearExamState,
    loadAndStartExam,
  } = useExamState({
    userId: user?.id,
    examTypes,
  });

  // Token verification (non-admin users)
  const {
    showTokenModal,
    tokenInput,
    setTokenInput,
    tokenError,
    setTokenError,
    verifyingToken,
    openTokenModal,
    closeTokenModal,
    verifyTokenAndStart,
  } = useTokenVerification({
    userId: user?.id || '',
    onSuccess: async (examTypeId) => {
      const success = await loadAndStartExam(examTypeId);
      if (success) {
        closeTokenModal();
      }
    },
  });

  // Timer countdown (auto-advance on timeout)
  useExamTimer({
    exam,
    showResults,
    currentQuestionIndex,
    timeLeft,
    setTimeLeft,
    onTimeout: () => handleNextQuestion(true),
  });

  // ==================== EFFECTS ====================

  // Load exam types on mount + recover state
  useEffect(() => {
    loadExamTypes();
    recoverExamState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cheating detection: visibilitychange & window.blur
  useEffect(() => {
    if (!exam || showResults) return;

    const handleVisibilityChange = async () => {
      if (cheatingDetectedRef.current) return;

      if (document.hidden) {
        cheatingDetectedRef.current = true;
        console.warn('⚠️ CHEATING DETECTED: User switched tabs');
        clearExamState();

        const failedAnswers: Record<string, number> = {};
        exam.questions.forEach((q: any) => {
          failedAnswers[q.id] = -1;
        });

        await notifyCheat({
          username: user?.user_metadata?.username || 'Unknown',
          mtaNick: mtaNick || 'Brak',
          email: user?.email || 'N/A',
          examType: selectedType?.name || 'Unknown',
          cheatType: 'tab_switch',
          timestamp: new Date().toISOString(),
        });

        alert('🚨 UWAGA: Wykryto przełączenie karty. Egzamin zostaje zakończony ze skutkiem negatywnym.');
        await finishExam(failedAnswers);
      }
    };

    const handleWindowBlur = async () => {
      if (cheatingDetectedRef.current) return;

      cheatingDetectedRef.current = true;
      console.warn('⚠️ CHEATING DETECTED: Window lost focus');
      clearExamState();

      const failedAnswers: Record<string, number> = {};
      exam.questions.forEach((q: any) => {
        failedAnswers[q.id] = -1;
      });

      await notifyCheat({
        username: user?.user_metadata?.username || 'Unknown',
        mtaNick: mtaNick || 'Brak',
        email: user?.email || 'N/A',
        examType: selectedType?.name || 'Unknown',
        cheatType: 'window_blur',
        timestamp: new Date().toISOString(),
      });

      alert('🚨 UWAGA: Wykryto wyjście z okna egzaminu. Egzamin zostaje zakończony ze skutkiem negatywnym.');
      await finishExam(failedAnswers);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, showResults, selectedType, mtaNick, user, clearExamState]);

  // ==================== BUSINESS LOGIC ====================

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

  const startExam = async (examTypeId: number) => {
    // Admin/Dev bypass - bezpośredni start bez tokenu
    if (isAdmin) {
      await loadAndStartExam(examTypeId);
      return;
    }

    // User - wymaga tokenu
    openTokenModal(examTypeId);
  };

  const finishExam = useCallback(
    async (finalAnswers: Record<string, number | number[]>) => {
      if (submittingRef.current) return;
      submittingRef.current = true;

      try {
        const result = calculateExamResult(finalAnswers, exam.questions) as {
          score: number;
          total: number;
          percentage: number;
          details: any[];
        };

        const examTypeName = selectedType.name.toLowerCase();
        const passingThreshold =
          examTypeName.includes('trainee') ||
          examTypeName.includes('pościgowy') ||
          examTypeName.includes('swat')
            ? 50
            : 75;

        const passed = result.percentage >= passingThreshold;

        const examData = {
          user_id: user.id,
          exam_type_id: selectedType.id,
          score: result.score,
          total_questions: result.total,
          percentage: result.percentage,
          passed,
          answers: finalAnswers,
          questions: exam.questions,
          is_archived: false,
        };

        const { data: savedExam, error } = await saveExamResult(examData);
        if (error) throw error;

        notifyExamSubmission({
          username: mtaNick || user.email,
          examType: selectedType.name,
          score: result.score,
          total: result.total,
          percentage: result.percentage,
          passed,
          passingThreshold,
          examId: savedExam.exam_id,
        });

        clearExamState();

        setResults({
          score: result.score,
          totalQuestions: result.total,
          percentage: result.percentage,
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
    },
    [exam, selectedType, user, mtaNick, clearExamState]
  );

  const handleNextQuestion = useCallback(
    async (isTimeout = false) => {
      if (submittingRef.current) return;

      const currentQuestion = exam.questions[currentQuestionIndex];
      const currentAnswer = answers[currentQuestion.id];
      const noAnswer =
        currentAnswer === undefined || (Array.isArray(currentAnswer) && currentAnswer.length === 0);

      if (isTimeout && noAnswer) {
        setAnswers((prev) => ({
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
    },
    [exam, currentQuestionIndex, answers, finishExam, setCurrentQuestionIndex, setTimeLeft, setAnswers]
  );

  const handleAnswerSelect = (optionIndex: number) => {
    const currentQuestion = exam.questions[currentQuestionIndex];

    if (currentQuestion.is_multiple_choice) {
      const currentAnswers = (answers[currentQuestion.id] as number[]) || [];
      const newAnswers = currentAnswers.includes(optionIndex)
        ? currentAnswers.filter((a) => a !== optionIndex)
        : [...currentAnswers, optionIndex];

      setAnswers({
        ...answers,
        [currentQuestion.id]: newAnswers,
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: optionIndex,
      });
    }
  };

  // ==================== CONDITIONAL RENDERING ====================

  // Token Modal (overlay)
  const tokenModal = (
    <TokenModal
      isOpen={showTokenModal}
      tokenInput={tokenInput}
      setTokenInput={setTokenInput}
      tokenError={tokenError}
      setTokenError={setTokenError}
      verifyingToken={verifyingToken}
      onVerify={verifyTokenAndStart}
      onCancel={closeTokenModal}
    />
  );

  // Loading
  if (loading) {
    return (
      <>
        {tokenModal}
        <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c9a227]/30 border-t-[#c9a227] mx-auto mb-4" />
            <p className="text-[#8fb5a0]">Ładowanie egzaminu...</p>
          </div>
        </div>
      </>
    );
  }

  // Results Screen
  if (showResults && results) {
    return (
      <>
        {tokenModal}
        <ExamResults results={results} onFinish={onBack || (() => {})} />
      </>
    );
  }

  // Type Selection
  if (!exam) {
    return (
      <>
        {tokenModal}
        <ExamTypeSelection examTypes={examTypes} onSelectType={startExam} onBack={onBack} />
      </>
    );
  }

  // Exam Question
  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  return (
    <>
      {tokenModal}
      <ExamQuestion
        examTypeName={selectedType?.name || ''}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={exam.questions.length}
        timeLeft={timeLeft}
        currentQuestion={currentQuestion}
        currentAnswer={currentAnswer}
        onAnswerSelect={handleAnswerSelect}
        onNext={() => handleNextQuestion(false)}
      />
    </>
  );
}
