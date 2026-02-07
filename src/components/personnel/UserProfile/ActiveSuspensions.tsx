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
    <div className="mb-8">
      {isHCS && (
        <div className="flex justify-end mb-2">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
            title="Wyzeruj wszystkie zawieszenia (HCS+)"
          >
            <Trash2 className="w-3 h-3" />
            Wyzeruj
          </button>
        </div>
      )}
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-orange-400" />
        Aktywne Zawieszenia
      </h3>
      <div className="glass-strong rounded-2xl border border-orange-500/30 overflow-hidden shadow-xl">
        {activePenalties.map((penalty) => (
          <div
            key={penalty.id}
            className="p-4 border-b border-[#1a4d32]/30 last:border-b-0 hover:bg-[#0a2818]/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold mb-1">{penalty.reason}</p>
                <p className="text-[#8fb5a0] text-xs">
                  Nadane: {formatDate(penalty.created_at)} przez {penalty.admin_username}
                </p>
              </div>
              {penaltyTimers[penalty.id] && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-mono font-bold">
                    {formatTime(penaltyTimers[penalty.id])}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
