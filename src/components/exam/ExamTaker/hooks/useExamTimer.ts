import { useEffect, useRef } from 'react';

interface UseExamTimerProps {
  exam: any;
  showResults: boolean;
  currentQuestionIndex: number;
  timeLeft: number;
  setTimeLeft: (value: number | ((prev: number) => number)) => void;
  onTimeout: () => void;
}

/**
 * useExamTimer - Hook dla timer countdown + auto-advance
 */
export function useExamTimer({
  exam,
  showResults,
  currentQuestionIndex,
  timeLeft,
  setTimeLeft,
  onTimeout,
}: UseExamTimerProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!exam || showResults) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timeout - auto advance
          onTimeout();
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
  }, [currentQuestionIndex, exam, showResults, onTimeout, setTimeLeft]);

  return { timerRef };
}
