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
      <div className="panel-inset p-12 text-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
        <div className="font-[family-name:var(--font-vt323)] text-xl tracking-widest cursor-blink inline-block px-1" style={{ color: 'var(--mdt-content-text)' }}>
          ŁADOWANIE_
        </div>
        <p className="font-mono text-sm mt-2" style={{ color: 'var(--mdt-muted-text)' }}>Ładowanie materiałów...</p>
      </div>
    );
  }

  return (
    <div className="panel-inset p-12 text-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
      <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--mdt-subtle-text)' }} />
      <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
        {canManage
          ? 'Brak materiałów. Kliknij "Dodaj Materiał" aby stworzyć pierwszy.'
          : 'Brak materiałów dla tej dywizji.'}
      </p>
    </div>
  );
}
