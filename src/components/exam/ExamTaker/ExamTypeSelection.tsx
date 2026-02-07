'use client';

import { Target, ArrowRight, Trophy, ChevronLeft, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-[#020a06] relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Powrót</span>
          </button>
        )}

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Wybór egzaminu</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Wybierz Typ <span className="text-gold-gradient">Egzaminu</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">Rozpocznij egzamin z wybranego zakresu</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examTypes.map((type) => {
            const isEasy = type.passing_threshold === 50;
            return (
              <button
                key={type.id}
                onClick={() => onSelectType(type.id)}
                className="group relative glass-strong rounded-xl border border-[#1a4d32]/50 hover:border-[#c9a227]/50 p-6 text-left hover:scale-[1.01] transition-all duration-300 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
                  </div>

                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors">
                      {type.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Trophy className={`w-4 h-4 ${isEasy ? 'text-[#22c55e]' : 'text-[#c9a227]'}`} />
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          isEasy
                            ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                            : 'bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30'
                        }`}
                      >
                        Próg: {type.passing_threshold}%
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-[#8fb5a0] group-hover:text-[#c9a227] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
