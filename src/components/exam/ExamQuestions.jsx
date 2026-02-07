'use client';

import ExamQuestionsPage from './ExamQuestions/ExamQuestionsPage';

/**
 * ExamQuestions - Routing wrapper for ExamQuestions page
 * Original: 570L → 11L (-559L, -98%)
 * Refactored: 2026-02-07 (ETAP 2.5)
 */
export default function ExamQuestions({ onBack }) {
  return <ExamQuestionsPage onBack={onBack} />;
}
