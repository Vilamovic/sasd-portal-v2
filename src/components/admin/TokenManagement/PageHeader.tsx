import { Shield, Key } from 'lucide-react';

interface PageHeaderProps {
  tokensCount: number;
}

export default function PageHeader({ tokensCount }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div
        className="px-3 py-2 mb-4 flex items-center gap-2"
        style={{ backgroundColor: 'var(--mdt-blue-bar)' }}
      >
        <Shield className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-white text-lg">
          Panel administratora
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Key className="w-6 h-6" style={{ color: 'var(--mdt-content-text)' }} />
        <h2
          className="text-2xl font-[family-name:var(--font-vt323)]"
          style={{ color: 'var(--mdt-content-text)' }}
        >
          Tokeny Egzaminacyjne
        </h2>
      </div>
      <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
        Zarządzanie tokenami dostępu do egzaminów ({tokensCount})
      </p>
    </div>
  );
}
