'use client';

import { useState } from 'react';
import ExamDashboard from './ExamDashboard';
import ExamTaker from './ExamTaker';
import ExamResultsViewer from './ExamResultsViewer';
import ExamQuestions from './ExamQuestions';

/**
 * Exam - Router dla systemu egzaminacyjnego
 * Zarządza nawigacją między:
 * - ExamDashboard (wybór sekcji)
 * - ExamTaker (zdawanie egzaminu)
 * - ExamResultsViewer mode="active" (wyniki aktywne)
 * - ExamQuestions (zarządzanie pytaniami)
 * - ExamResultsViewer mode="archived" (archiwum)
 */
export default function Exam({ onBack }: { onBack?: () => void }) {
  const [activeView, setActiveView] = useState('dashboard');

  const handleNavigate = (view: string) => {
    setActiveView(view);
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  // Render current view
  switch (activeView) {
    case 'take-exam':
      return <ExamTaker onBack={handleBackToDashboard} />;

    case 'statistics':
      return <ExamResultsViewer mode="active" />;

    case 'questions':
      return <ExamQuestions onBack={handleBackToDashboard} />;

    case 'archive':
      return <ExamResultsViewer mode="archived" />;

    case 'dashboard':
    default:
      return <ExamDashboard onNavigate={handleNavigate} onBack={onBack} />;
  }
}
