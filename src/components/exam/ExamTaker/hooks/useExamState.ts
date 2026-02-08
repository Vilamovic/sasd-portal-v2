import { useState, useCallback, useEffect } from 'react';
import { generateExam } from '@/src/utils/examUtils';
import { getQuestionsByExamType } from '@/src/lib/db/exams';

interface UseExamStateProps {
  userId: string | undefined;
  examTypes: any[];
}

/**
 * useExamState - Hook dla zarządzania stanem egzaminu + localStorage recovery
 */
export function useExamState({ userId, examTypes }: UseExamStateProps) {
  const [exam, setExam] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Zapisz stan egzaminu do localStorage
  const saveExamState = useCallback(() => {
    if (!exam || !userId) return;

    const examState = {
      exam,
      selectedType,
      currentQuestionIndex,
      answers,
      timeLeft,
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(`exam_state_${userId}`, JSON.stringify(examState));
    } catch (error) {
      console.error('Error saving exam state:', error);
    }
  }, [exam, selectedType, currentQuestionIndex, answers, timeLeft, userId]);

  // Odzyskaj stan egzaminu z localStorage
  const recoverExamState = useCallback(() => {
    if (!userId) return;

    try {
      const savedState = localStorage.getItem(`exam_state_${userId}`);
      if (!savedState) return;

      const examState = JSON.parse(savedState);
      const timeSinceLastSave = Date.now() - examState.timestamp;

      // Jeśli minęło więcej niż 1 godzina, usuń stan (wygasł)
      if (timeSinceLastSave > 3600000) {
        localStorage.removeItem(`exam_state_${userId}`);
        return;
      }

      // Przywróć stan egzaminu
      setExam(examState.exam);
      setSelectedType(examState.selectedType);
      setCurrentQuestionIndex(examState.currentQuestionIndex);
      setAnswers(examState.answers);
      setTimeLeft(examState.timeLeft);

    } catch (error) {
      console.error('Error recovering exam state:', error);
      if (userId) {
        localStorage.removeItem(`exam_state_${userId}`);
      }
    }
  }, [userId]);

  // Wyczyść stan egzaminu z localStorage
  const clearExamState = useCallback(() => {
    if (!userId) return;

    try {
      localStorage.removeItem(`exam_state_${userId}`);
    } catch (error) {
      console.error('Error clearing exam state:', error);
    }
  }, [userId]);

  // Załaduj pytania i rozpocznij egzamin
  const loadAndStartExam = async (examTypeId: number) => {
    try {
      const { data: questions, error: questionsError } = await getQuestionsByExamType(examTypeId);

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) {
        alert('Brak pytań dla tego typu egzaminu.');
        return false;
      }

      // Wygeneruj egzamin (losowanie i shuffle)
      const generatedExam = generateExam(questions, 10) as unknown as { questions: any[] };

      setSelectedType(examTypes.find((t) => t.id === examTypeId));
      setExam(generatedExam);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeLeft(generatedExam.questions[0]?.time_limit || 30);
      return true;
    } catch (error) {
      console.error('Error loading exam:', error);
      alert('Błąd podczas ładowania egzaminu.');
      return false;
    }
  };

  // Auto-save exam state
  useEffect(() => {
    saveExamState();
  }, [saveExamState]);

  return {
    exam,
    setExam,
    selectedType,
    setSelectedType,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswers,
    timeLeft,
    setTimeLeft,
    saveExamState,
    recoverExamState,
    clearExamState,
    loadAndStartExam,
  };
}
