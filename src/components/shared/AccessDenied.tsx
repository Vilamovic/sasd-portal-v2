import { Shield } from 'lucide-react';

interface AccessDeniedProps {
  onBack: () => void;
  message: string;
}

export default function AccessDenied({ onBack, message }: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="panel-raised p-0 max-w-md w-full" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-base tracking-wider uppercase text-white">BRAK DOSTĘPU</span>
        </div>
        <div className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <p className="font-mono text-sm mb-6" style={{ color: 'var(--mdt-muted-text)' }}>{message}</p>
          <button onClick={onBack} className="btn-win95 text-sm">
            POWROT
          </button>
        </div>
      </div>
    </div>
  );
}
