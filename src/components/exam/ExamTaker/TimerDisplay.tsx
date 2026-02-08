'use client';

import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  timeLeft: number;
}

/**
 * TimerDisplay - Countdown timer z kolorami
 */
export default function TimerDisplay({ timeLeft }: TimerDisplayProps) {
  const timerColor = timeLeft > 10 ? '#4caf50' : timeLeft > 5 ? '#ff9800' : '#f44336';

  return (
    <div className="panel-inset flex items-center gap-2 px-3 py-2" style={{ backgroundColor: '#1a1a1a' }}>
      <Clock className="w-4 h-4" style={{ color: timerColor }} />
      <div className="text-right">
        <div className="font-mono text-xs" style={{ color: 'var(--mdt-subtle-text)' }}>Czas</div>
        <div className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: timerColor }}>{timeLeft}s</div>
      </div>
    </div>
  );
}
