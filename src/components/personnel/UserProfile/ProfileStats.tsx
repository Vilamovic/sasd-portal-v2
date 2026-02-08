'use client';

import { TrendingUp, TrendingDown, AlertTriangle, Calendar } from 'lucide-react';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {/* PLUS Count */}
      <div className="panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-6 h-6 text-green-700" />
          <span className="font-mono text-2xl font-bold text-green-700">+{user?.plus_count || 0}</span>
        </div>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>PLUS otrzymane</p>
      </div>

      {/* MINUS Count */}
      <div className="panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="flex items-center justify-between mb-2">
          <TrendingDown className="w-6 h-6 text-red-700" />
          <span className="font-mono text-2xl font-bold text-red-700">-{user?.minus_count || 0}</span>
        </div>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>MINUS otrzymane</p>
      </div>

      {/* Active Penalties */}
      <div className="panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="flex items-center justify-between mb-2">
          <AlertTriangle className="w-6 h-6" style={{ color: activePenaltiesCount > 0 ? '#c41e1e' : 'var(--mdt-muted-text)' }} />
          <span className="font-mono text-2xl font-bold" style={{ color: activePenaltiesCount > 0 ? '#c41e1e' : 'var(--mdt-content-text)' }}>{activePenaltiesCount}</span>
        </div>
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Aktywne zawieszenia</p>
      </div>

      {/* Last Seen */}
      <div className="panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-6 h-6" style={{ color: 'var(--mdt-muted-text)' }} />
        </div>
        <p className="font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-content-text)' }}>Ostatnio widziany</p>
        <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>{formatDate(user?.last_seen || user?.created_at || '')}</p>
      </div>
    </div>
  );
}
