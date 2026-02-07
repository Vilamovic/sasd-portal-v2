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
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div
          className={`absolute top-1/4 -left-32 w-96 h-96 ${
            results.passed ? 'bg-[#22c55e]/10' : 'bg-red-500/10'
          } rounded-full blur-[120px] animate-pulse-glow`}
        />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div
          className={`absolute -inset-4 rounded-3xl opacity-30 blur-2xl animate-pulse-glow`}
          style={{ background: results.passed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' }}
        />

        <div className="relative glass-strong rounded-3xl border border-[#1a4d32] shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div
            className={`h-1 bg-gradient-to-r ${
              results.passed
                ? 'from-transparent via-[#22c55e] to-transparent'
                : 'from-transparent via-red-500 to-transparent'
            }`}
          />

          {/* Header */}
          <div className={`${results.passed ? 'bg-[#22c55e]/10' : 'bg-red-500/10'} p-8 border-b border-[#1a4d32]`}>
            <div className="flex items-center justify-center mb-4">
              {results.passed ? (
                <div className="w-24 h-24 bg-[#22c55e]/20 rounded-full flex items-center justify-center animate-pulse-glow">
                  <CheckCircle className="w-16 h-16 text-[#22c55e]" strokeWidth={2} />
                </div>
              ) : (
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse-glow">
                  <XCircle className="w-16 h-16 text-red-400" strokeWidth={2} />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              {results.passed ? 'Gratulacje!' : 'Niestety...'}
            </h2>
            <p className="text-[#8fb5a0] text-center">
              {results.passed ? 'Pomyślnie zdałeś egzamin!' : `Nie udało się. Wymagane ${results.passingThreshold}%.`}
            </p>
          </div>

          {/* Results */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0a2818]/50 rounded-2xl p-5 border border-[#1a4d32] text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-[#c9a227]" />
                  <span className="text-sm text-[#8fb5a0]">Wynik</span>
                </div>
                <p className="text-3xl font-bold text-white">
                  {results.score}
                  <span className="text-[#8fb5a0]">/{results.totalQuestions}</span>
                </p>
              </div>

              <div className="bg-[#0a2818]/50 rounded-2xl p-5 border border-[#1a4d32] text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className={`w-5 h-5 ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`} />
                  <span className="text-sm text-[#8fb5a0]">Procent</span>
                </div>
                <p className={`text-3xl font-bold ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`}>
                  {results.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div
              className={`mb-6 p-4 rounded-xl border ${
                results.passed ? 'bg-[#22c55e]/10 border-[#22c55e]/30' : 'bg-red-500/10 border-red-400/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-5 h-5 ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`} />
                <span className={`text-sm font-medium ${results.passed ? 'text-[#22c55e]' : 'text-red-400'}`}>
                  {results.passed ? 'Egzamin zaliczony' : `Wymagane minimum: ${results.passingThreshold}%`}
                </span>
              </div>
            </div>

            <button
              onClick={onFinish}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:opacity-90 text-[#020a06] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg"
            >
              Zakończ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
