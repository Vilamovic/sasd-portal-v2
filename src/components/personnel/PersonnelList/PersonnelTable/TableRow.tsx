'use client';

import { Award, Calendar, Eye, CheckSquare, Square } from 'lucide-react';

interface TableRowProps {
  user: any;
  index: number;
  selected: boolean;
  toggleSelection: (userId: string) => void;
  onViewProfile: (username: string) => void;
  getDivisionColor: (division: string | null) => string;
  getRoleDisplayName: (role: string) => string;
  getRoleColor: (role: string) => string;
  formatDate: (dateString: string) => string;
}

/**
 * TableRow - Pojedynczy wiersz użytkownika w kartotece
 */
export default function TableRow({
  user,
  index,
  selected,
  toggleSelection,
  onViewProfile,
  getDivisionColor,
  getRoleDisplayName,
  getRoleColor,
  formatDate,
}: TableRowProps) {
  return (
    <div
      className="px-4 py-3 border-b border-gray-300"
      style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Checkbox */}
        <div className="col-span-1">
          <button
            onClick={() => toggleSelection(user.id)}
            className="font-mono text-sm"
            style={{ color: 'var(--mdt-content-text)' }}
          >
            {selected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="col-span-3">
          <div className="flex items-center gap-2">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.username}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>{user.mta_nick || user.username}</span>
                <span className={`px-1 py-0.5 text-xs font-bold font-mono ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>@{user.username}</span>
            </div>
          </div>
        </div>

        {/* Division & Permissions */}
        <div className="col-span-2">
          <div className="flex flex-wrap gap-1">
            {user.division && (
              <span className={`px-1 py-0.5 text-xs font-bold font-mono ${getDivisionColor(user.division)}`}>
                {user.division}{user.is_commander ? ' CMD' : ''}
              </span>
            )}
            {user.permissions?.map((perm: string) => (
              <span
                key={perm}
                className="px-1 py-0.5 text-xs font-bold font-mono bg-blue-600 text-white"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Stopień */}
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
            <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>{user.badge || 'Brak'}</span>
          </div>
        </div>

        {/* Plus/Minus */}
        <div className="col-span-1">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-mono text-xs font-bold text-green-700">+{user.plus_count || 0}</span>
            <span className="font-mono text-xs font-bold text-red-700">-{user.minus_count || 0}</span>
          </div>
        </div>

        {/* Last Seen */}
        <div className="col-span-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              {formatDate(user.last_seen || user.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <button
            onClick={() => onViewProfile(user.username)}
            className="btn-win95 flex items-center gap-1 text-xs"
          >
            <Eye className="w-3 h-3" />
            Zobacz
          </button>
        </div>
      </div>
    </div>
  );
}
