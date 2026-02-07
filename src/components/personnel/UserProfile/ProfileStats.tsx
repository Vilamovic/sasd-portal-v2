'use client';

import { TrendingUp, TrendingDown, AlertTriangle, Calendar, Award } from 'lucide-react';

interface ProfileStatsProps {
  user: any;
  activePenaltiesCount: number;
  formatDate: (dateString: string) => string;
}

/**
 * Profile Stats - Statistics grid (PLUS/MINUS counters, active penalties, last seen)
 */
export default function ProfileStats({ user, activePenaltiesCount, formatDate }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* PLUS Count */}
      <div className="glass-strong rounded-2xl border border-green-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <TrendingUp className="w-8 h-8 text-green-400" />
          <span className="text-3xl font-bold text-green-400">+{user?.plus_count || 0}</span>
        </div>
        <p className="text-[#8fb5a0] text-sm">PLUS otrzymane</p>
      </div>

      {/* MINUS Count */}
      <div className="glass-strong rounded-2xl border border-red-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <TrendingDown className="w-8 h-8 text-red-400" />
          <span className="text-3xl font-bold text-red-400">-{user?.minus_count || 0}</span>
        </div>
        <p className="text-[#8fb5a0] text-sm">MINUS otrzymane</p>
      </div>

      {/* Active Penalties */}
      <div className="glass-strong rounded-2xl border border-orange-500/30 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <AlertTriangle className="w-8 h-8 text-orange-400" />
          <span className="text-3xl font-bold text-orange-400">{activePenaltiesCount}</span>
        </div>
        <p className="text-[#8fb5a0] text-sm">Aktywne zawieszenia</p>
      </div>

      {/* Last Seen */}
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <Calendar className="w-8 h-8 text-[#c9a227]" />
        </div>
        <p className="text-white text-sm font-semibold mb-1">Ostatnio widziany</p>
        <p className="text-[#8fb5a0] text-xs">{formatDate(user?.last_seen || user?.created_at || '')}</p>
      </div>
    </div>
  );
}
