import { Shield } from 'lucide-react';

interface AccessDeniedProps {
  onBack: () => void;
}

export default function AccessDenied({ onBack }: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-8">
      <div className="text-center">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Brak dostępu</h2>
        <p className="text-[#8fb5a0] mb-6">
          Tylko administratorzy mogą zarządzać tokenami.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg"
        >
          Powrót
        </button>
      </div>
    </div>
  );
}
