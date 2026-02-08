'use client';

import { Key, AlertCircle } from 'lucide-react';

interface TokenModalProps {
  isOpen: boolean;
  tokenInput: string;
  setTokenInput: (value: string) => void;
  tokenError: string;
  setTokenError: (value: string) => void;
  verifyingToken: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

/**
 * TokenModal - Modal weryfikacji jednorazowego tokenu dostępu
 */
export default function TokenModal({
  isOpen,
  tokenInput,
  setTokenInput,
  tokenError,
  setTokenError,
  verifyingToken,
  onVerify,
  onCancel,
}: TokenModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-md w-full" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Header */}
        <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <Key className="w-5 h-5 text-white" strokeWidth={2.5} />
          <div>
            <h3 className="font-[family-name:var(--font-vt323)] text-lg text-white">Jednorazowy Token Dostępu</h3>
            <p className="font-mono text-xs text-white/80">Wymagany do rozpoczęcia egzaminu</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="font-mono text-sm mb-4" style={{ color: 'var(--mdt-muted-text)' }}>
            Wprowadź token dostępu otrzymany od administratora. Token można użyć tylko raz.
          </p>

          <input
            type="text"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setTokenError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !verifyingToken) {
                onVerify();
              }
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="panel-inset w-full px-3 py-2 font-mono text-sm mb-4"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            disabled={verifyingToken}
            autoFocus
          />

          {tokenError && (
            <div className="mb-4 p-3 panel-inset flex items-center gap-2" style={{ backgroundColor: '#e8d0d0' }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#8b0000' }} />
              <span className="font-mono text-sm" style={{ color: '#8b0000' }}>{tokenError}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onVerify}
              disabled={verifyingToken || !tokenInput.trim()}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={
                verifyingToken || !tokenInput.trim()
                  ? { opacity: 0.5, cursor: 'not-allowed' }
                  : { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }
              }
            >
              {verifyingToken ? (
                <span className="font-mono text-sm">Weryfikacja...</span>
              ) : (
                <span className="font-mono text-sm">Zweryfikuj i Rozpocznij</span>
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={verifyingToken}
              className="btn-win95"
              style={verifyingToken ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <span className="font-mono text-sm">Anuluj</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
