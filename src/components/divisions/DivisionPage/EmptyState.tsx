import { FileText } from 'lucide-react';

interface EmptyStateProps {
  canManage: boolean;
  loading: boolean;
}

/**
 * EmptyState - No materials message
 * - Different message for managers vs regular users
 * - Loading state
 */
export default function EmptyState({ canManage, loading }: EmptyStateProps) {
  if (loading) {
    return (
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
        <p className="text-[#8fb5a0] text-lg">Ładowanie materiałów...</p>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
      <FileText className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
      <p className="text-[#8fb5a0] text-lg">
        {canManage
          ? 'Brak materiałów. Kliknij "Dodaj Materiał" aby stworzyć pierwszy.'
          : 'Brak materiałów dla tej dywizji.'}
      </p>
    </div>
  );
}
