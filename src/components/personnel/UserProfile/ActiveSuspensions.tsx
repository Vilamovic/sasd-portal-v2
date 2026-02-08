'use client';

import { AlertTriangle, Clock, Trash2 } from 'lucide-react';

interface ActiveSuspensionsProps {
  activePenalties: any[];
  penaltyTimers: Record<string, number>;
  isHCS: boolean;
  onClear: () => void;
  formatDate: (dateString: string) => string;
  formatTime: (seconds: number) => string;
}

/**
 * Active Suspensions - Sekcja z aktywnymi karami i countdown timerami
 */
export default function ActiveSuspensions({
  activePenalties,
  penaltyTimers,
  isHCS,
  onClear,
  formatDate,
  formatTime,
}: ActiveSuspensionsProps) {
  if (activePenalties.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      {isHCS && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClear}
            className="btn-win95 flex items-center gap-2 text-sm"
            style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
            title="Wyzeruj wszystkie zawieszenia (HCS+)"
          >
            <Trash2 className="w-3 h-3" />
            Wyzeruj
          </button>
        </div>
      )}

      <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Blue title bar */}
        <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-white" />
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
            Aktywne Zawieszenia
          </h3>
        </div>

        <div className="p-2">
          {activePenalties.map((penalty, index) => (
            <div
              key={penalty.id}
              className="px-3 py-2 border-b border-gray-300 last:border-b-0"
              style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>{penalty.reason}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                    Nadane: {formatDate(penalty.created_at)} przez {penalty.admin_username}
                  </p>
                </div>
                {penaltyTimers[penalty.id] && (
                  <div className="flex items-center gap-2 panel-inset px-3 py-1" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                    <Clock className="w-3 h-3" style={{ color: '#c41e1e' }} />
                    <span className="font-mono text-sm font-bold" style={{ color: '#c41e1e' }}>
                      {formatTime(penaltyTimers[penalty.id])}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
