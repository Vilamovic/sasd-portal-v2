'use client';

import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  timeLeft: number;
}

/**
 * TimerDisplay - Countdown timer z kolorami
 */
export default function TimerDisplay({ timeLeft }: TimerDisplayProps) {
  const timerColor = timeLeft > 10 ? 'text-[#22c55e]' : timeLeft > 5 ? 'text-[#c9a227]' : 'text-red-400';
  const timerBgColor =
    timeLeft > 10
      ? 'bg-[#22c55e]/10 border-[#22c55e]/30'
      : timeLeft > 5
      ? 'bg-[#c9a227]/10 border-[#c9a227]/30'
      : 'bg-red-500/10 border-red-400/30';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${timerBgColor}`}>
      <Clock className={`w-6 h-6 ${timerColor}`} />
      <div className="text-right">
        <div className="text-xs text-[#8fb5a0] uppercase tracking-wide">Czas</div>
        <div className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</div>
      </div>
    </div>
  );
}
