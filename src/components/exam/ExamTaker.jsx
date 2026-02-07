'use client';

import ExamTakerPage from './ExamTaker/ExamTakerPage';

/**
 * ExamTaker - Routing wrapper dla ExamTakerPage
 * Deleguje całą logikę do orchestratora
 */
export default function ExamTaker({ onBack }) {
  return <ExamTakerPage onBack={onBack} />;
}
