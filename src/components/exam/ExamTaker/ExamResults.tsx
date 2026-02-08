'use client';

import { CheckCircle, XCircle, Trophy, AlertCircle } from 'lucide-react';

interface ExamResultsProps {
  results: {
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    passingThreshold: number;
  };
  onFinish: () => void;
}

/**
 * ExamResults - Ekran wyników egzaminu
 */
export default function ExamResults({ results, onFinish }: ExamResultsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-lg w-full panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Header */}
        <div className="px-6 py-3 flex items-center gap-3" style={{ backgroundColor: results.passed ? '#1a4d1a' : '#4d1a1a' }}>
          {results.passed ? (
            <CheckCircle className="w-6 h-6 text-white" strokeWidth={2} />
          ) : (
            <XCircle className="w-6 h-6 text-white" strokeWidth={2} />
          )}
          <h2 className="font-[family-name:var(--font-vt323)] text-2xl text-white">
            {results.passed ? 'Gratulacje!' : 'Niestety...'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="font-mono text-sm mb-6" style={{ color: 'var(--mdt-muted-text)' }}>
            {results.passed ? 'Pomyślnie zdałeś egzamin!' : `Nie udało się. Wymagane ${results.passingThreshold}%.`}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="panel-inset p-4 text-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Wynik</span>
              </div>
              <p className="font-[family-name:var(--font-vt323)] text-3xl" style={{ color: 'var(--mdt-content-text)' }}>
                {results.score}
                <span className="text-xl" style={{ color: 'var(--mdt-muted-text)' }}>/{results.totalQuestions}</span>
              </p>
            </div>

            <div className="panel-inset p-4 text-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Procent</span>
              </div>
              <p className="font-[family-name:var(--font-vt323)] text-3xl" style={{ color: results.passed ? '#006400' : '#8b0000' }}>
                {results.percentage.toFixed(1)}%
              </p>
            </div>
          </div>

          <div
            className="mb-6 p-3 panel-inset flex items-center gap-3"
            style={{ backgroundColor: results.passed ? '#d0e8d0' : '#e8d0d0' }}
          >
            <AlertCircle className="w-4 h-4" style={{ color: results.passed ? '#006400' : '#8b0000' }} />
            <span className="font-mono text-sm font-bold" style={{ color: results.passed ? '#006400' : '#8b0000' }}>
              {results.passed ? 'Egzamin zaliczony' : `Wymagane minimum: ${results.passingThreshold}%`}
            </span>
          </div>

          <button
            onClick={onFinish}
            className="btn-win95 w-full"
          >
            <span className="font-mono text-sm font-bold">Zakończ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
