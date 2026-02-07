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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl border border-[#c9a227] max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-[#1a4d32]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-xl flex items-center justify-center shadow-lg">
              <Key className="w-6 h-6 text-[#020a06]" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Jednorazowy Token Dostępu</h3>
              <p className="text-sm text-[#8fb5a0]">Wymagany do rozpoczęcia egzaminu</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[#8fb5a0] text-sm mb-4">
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
            className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0]/50 focus:outline-none focus:border-[#c9a227] transition-colors mb-4 font-mono text-sm"
            disabled={verifyingToken}
            autoFocus
          />

          {tokenError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{tokenError}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onVerify}
              disabled={verifyingToken || !tokenInput.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:opacity-90 text-white font-semibold rounded-xl transition-all disabled:from-[#133524] disabled:to-[#0a2818] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {verifyingToken ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Weryfikacja...
                </>
              ) : (
                'Zweryfikuj i Rozpocznij'
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={verifyingToken}
              className="px-6 py-3 bg-[#0a2818] hover:bg-[#133524] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
