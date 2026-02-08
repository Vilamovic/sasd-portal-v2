'use client';

import { CheckCircle, ArrowRight } from 'lucide-react';
import TimerDisplay from './TimerDisplay';

interface ExamQuestionProps {
  examTypeName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeLeft: number;
  currentQuestion: any;
  currentAnswer: any;
  onAnswerSelect: (optionIndex: number) => void;
  onNext: () => void;
}

/**
 * ExamQuestion - Ekran pytania egzaminacyjnego
 */
export default function ExamQuestion({
  examTypeName,
  currentQuestionIndex,
  totalQuestions,
  timeLeft,
  currentQuestion,
  currentAnswer,
  onAnswerSelect,
  onNext,
}: ExamQuestionProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const isNextDisabled = (() => {
    if (currentQuestion.is_multiple_choice) {
      return !currentAnswer || currentAnswer.length === 0;
    } else {
      return currentAnswer === undefined || currentAnswer === -1;
    }
  })();

  return (
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{examTypeName}</h2>
              <span className="text-sm text-[#8fb5a0]">
                Pytanie {currentQuestionIndex + 1} z {totalQuestions}
              </span>
            </div>

            <TimerDisplay timeLeft={timeLeft} />
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-[#0a2818] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#c9a227] to-[#e6b830] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="glass-strong rounded-2xl border border-[#1a4d32] p-8 mb-6 shadow-xl">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 bg-[#c9a227]/20 rounded-xl flex items-center justify-center border border-[#c9a227]/30">
              <span className="text-[#c9a227] font-bold text-lg">{currentQuestionIndex + 1}</span>
            </div>
            <h3 className="text-xl font-semibold text-white leading-relaxed flex-grow">
              {currentQuestion.question}
            </h3>
          </div>

          {currentQuestion.is_multiple_choice && (
            <div className="mb-6 px-4 py-2 bg-[#14b8a6]/10 border border-[#14b8a6]/30 rounded-lg inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#14b8a6]" />
              <span className="text-sm text-[#14b8a6] font-medium">Możesz wybrać wiele odpowiedzi</span>
            </div>
          )}

          {/* Answers */}
          <div className="space-y-3">
            {currentQuestion.shuffledOptions.map((option: string, index: number) => {
              const isSelected = currentQuestion.is_multiple_choice
                ? currentAnswer?.includes(index)
                : currentAnswer === index;

              return (
                <button
                  key={index}
                  onClick={() => onAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#c9a227]/20 border-[#c9a227] text-white shadow-lg'
                      : 'bg-[#0a2818]/30 border-[#1a4d32]/50 text-[#8fb5a0] hover:bg-[#0a2818]/50 hover:border-[#1a4d32]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 ${
                        currentQuestion.is_multiple_choice ? 'rounded-md' : 'rounded-full'
                      } border-2 transition-all ${
                        isSelected ? 'bg-[#c9a227] border-[#c9a227]' : 'bg-transparent border-[#8fb5a0]'
                      } flex items-center justify-center`}
                    >
                      {isSelected && <CheckCircle className="w-4 h-4 text-[#020a06]" strokeWidth={3} />}
                    </div>
                    <span className="flex-grow font-medium">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="w-full px-6 py-4 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-bold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Zakończ Egzamin' : 'Następne Pytanie'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
