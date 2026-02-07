import { ChevronLeft, Settings } from 'lucide-react';

interface QuestionTypeSelectorProps {
  examTypes: any[];
  onSelectType: (type: any) => void;
  onBack: () => void;
}

/**
 * QuestionTypeSelector - Screen wyboru typu egzaminu
 *
 * Features:
 * - Grid z typami egzaminów
 * - Back button
 * - Sheriff Theme styling
 */
export default function QuestionTypeSelector({
  examTypes,
  onSelectType,
  onBack,
}: QuestionTypeSelectorProps) {
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
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Powrót do Egzaminów</span>
        </button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
            <Settings className="w-4 h-4" />
            <span>Zarządzanie pytaniami</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Zarządzanie <span className="text-gold-gradient">Pytaniami</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />
          <p className="text-[#8fb5a0]">
            Wybierz typ egzaminu aby zarządzać pytaniami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type)}
              className="group p-6 glass-strong border border-[#1a4d32]/50 rounded-xl text-left hover:border-[#c9a227]/50 transition-all duration-300 shadow-xl hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6 text-[#020a06]" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#c9a227] transition-colors">
                  {type.name}
                </h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
