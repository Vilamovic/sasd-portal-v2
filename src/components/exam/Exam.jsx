'use client';

import { useState } from 'react';
import ExamDashboard from './ExamDashboard';
import ExamTaker from './ExamTaker';
import ExamStatistics from './ExamStatistics';
import ExamQuestions from './ExamQuestions';
import ExamArchive from './ExamArchive';

/**
 * Exam - Router dla systemu egzaminacyjnego
 * Zarządza nawigacją między:
 * - ExamDashboard (wybór sekcji)
 * - ExamTaker (zdawanie egzaminu)
 * - ExamStatistics (wyniki)
 * - ExamQuestions (zarządzanie pytaniami)
 * - ExamArchive (archiwum)
 */
export default function Exam({ onBack }) {
  const [activeView, setActiveView] = useState('dashboard');

  const handleNavigate = (view) => {
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
      return <ExamStatistics onBack={handleBackToDashboard} />;

    case 'questions':
      return <ExamQuestions onBack={handleBackToDashboard} />;

    case 'archive':
      return <ExamArchive onBack={handleBackToDashboard} />;

    case 'dashboard':
    default:
      return <ExamDashboard onNavigate={handleNavigate} onBack={onBack} />;
  }
}
