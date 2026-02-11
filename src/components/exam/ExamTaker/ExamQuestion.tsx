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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-6 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <div>
              <h2 className="font-[family-name:var(--font-vt323)] text-lg" style={{ color: 'var(--mdt-header-text)' }}>{examTypeName}</h2>
              <span className="font-mono text-xs" style={{ color: 'var(--mdt-header-text)' }}>
                Pytanie {currentQuestionIndex + 1} z {totalQuestions}
              </span>
            </div>
            <TimerDisplay timeLeft={timeLeft} />
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2">
            <div className="panel-inset h-4" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progress}%`, backgroundColor: 'var(--mdt-blue-bar)' }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="panel-inset flex-shrink-0 w-8 h-8 flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <span className="font-mono font-bold text-sm" style={{ color: 'var(--mdt-content-text)' }}>{currentQuestionIndex + 1}</span>
              </div>
              <h3 className="font-mono text-sm font-semibold leading-relaxed flex-grow" style={{ color: 'var(--mdt-content-text)' }}>
                {currentQuestion.question}
              </h3>
            </div>

            {currentQuestion.is_multiple_choice && (
              <div className="mb-4 px-3 py-2 panel-inset flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <CheckCircle className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Możesz wybrać wiele odpowiedzi</span>
              </div>
            )}

            {/* Answers */}
            <div className="space-y-2">
              {currentQuestion.shuffledOptions.map((option: string, index: number) => {
                const isSelected = currentQuestion.is_multiple_choice
                  ? currentAnswer?.includes(index)
                  : currentAnswer === index;

                return (
                  <button
                    key={index}
                    onClick={() => onAnswerSelect(index)}
                    className="w-full text-left p-3 font-mono text-sm transition-all duration-100"
                    style={{
                      backgroundColor: isSelected ? '#1a3a1a' : 'var(--mdt-btn-face)',
                      border: isSelected ? '2px inset #4ade80' : '2px outset var(--mdt-btn-highlight)',
                      color: isSelected ? '#4ade80' : 'var(--mdt-content-text)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center font-mono text-xs font-bold"
                        style={{
                          backgroundColor: isSelected ? '#006400' : 'var(--mdt-panel-alt)',
                          color: isSelected ? '#ffffff' : 'var(--mdt-muted-text)',
                          border: '1px solid var(--mdt-border-mid)',
                        }}
                      >
                        {isSelected ? '✓' : String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-grow">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className="btn-win95 w-full flex items-center justify-center gap-2"
          style={isNextDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
          <span className="font-mono text-sm font-bold">
            {currentQuestionIndex === totalQuestions - 1 ? 'Zakończ Egzamin' : 'Następne Pytanie'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
