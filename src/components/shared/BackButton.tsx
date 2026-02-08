import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  onClick: () => void;
  destination: string;
}

export default function BackButton({ onClick, destination }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn-win95 mb-6 flex items-center gap-2 text-sm"
    >
      <ChevronLeft className="w-4 h-4" />
      <span>Powrót do {destination}</span>
    </button>
  );
}
