import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
}

/**
 * BackButton - Standard back button (Sheriff Theme pattern)
 */
export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="mb-6 flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200"
    >
      <ChevronLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Powrót do Dashboard</span>
    </button>
  );
}
