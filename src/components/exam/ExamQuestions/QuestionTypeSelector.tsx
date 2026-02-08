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
 * - MDT Terminal styling
 */
export default function QuestionTypeSelector({
  examTypes,
  onSelectType,
  onBack,
}: QuestionTypeSelectorProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="btn-win95 mb-6 flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="font-mono text-sm">Powrót do Egzaminów</span>
        </button>

        <div className="panel-raised mb-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <Settings className="w-5 h-5 text-white" />
            <h2 className="font-[family-name:var(--font-vt323)] text-xl text-white">
              Zarządzanie Pytaniami
            </h2>
          </div>
          <div className="px-4 py-2">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              Wybierz typ egzaminu aby zarządzać pytaniami
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelectType(type)}
              className="panel-raised text-left w-full p-4"
              style={{ backgroundColor: 'var(--mdt-btn-face)' }}
            >
              <div className="flex items-center gap-3">
                <div className="panel-inset w-10 h-10 flex items-center justify-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                  <Settings className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} />
                </div>
                <h3 className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>
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
