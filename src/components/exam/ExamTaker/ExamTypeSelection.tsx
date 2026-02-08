'use client';

import { Target, ArrowRight, Trophy, ChevronLeft } from 'lucide-react';

interface ExamTypeSelectionProps {
  examTypes: any[];
  onSelectType: (typeId: number) => void;
  onBack?: () => void;
}

/**
 * ExamTypeSelection - Ekran wyboru typu egzaminu
 */
export default function ExamTypeSelection({ examTypes, onSelectType, onBack }: ExamTypeSelectionProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="btn-win95 mb-6 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="font-mono text-sm">Powrót</span>
          </button>
        )}

        <div className="panel-raised mb-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <h1 className="font-[family-name:var(--font-vt323)] text-xl text-white">
              Wybierz Typ Egzaminu
            </h1>
          </div>
          <div className="px-4 py-2">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Rozpocznij egzamin z wybranego zakresu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examTypes.map((type) => {
            const isEasy = type.passing_threshold === 50;
            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className="panel-raised text-left w-full p-4"
                style={{ backgroundColor: 'var(--mdt-btn-face)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="panel-inset flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                    <Target className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} />
                  </div>

                  <div className="flex-grow">
                    <h3 className="font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-content-text)' }}>
                      {type.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                      <span
                        className="font-mono text-xs font-semibold"
                        style={{ color: isEasy ? '#006400' : '#8b0000' }}
                      >
                        Próg: {type.passing_threshold}%
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
