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
      className="px-6 py-4 hover:bg-[#0a2818]/30 transition-colors"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Checkbox */}
        <div className="col-span-1">
          <button
            onClick={() => toggleSelection(user.id)}
            className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
          >
            {selected ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="col-span-3">
          <div className="flex items-center gap-3">
            {user.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-[#1a4d32]"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{user.mta_nick || user.username}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getRoleColor(user.role)}`}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <span className="text-[#8fb5a0] text-xs">@{user.username}</span>
            </div>
          </div>
        </div>

        {/* Division & Permissions */}
        <div className="col-span-2">
          <div className="flex flex-wrap gap-1">
            {user.division && (
              <span className={`px-2 py-1 rounded text-xs font-bold ${getDivisionColor(user.division)}`}>
                {user.division}{user.is_commander ? ' CMD' : ''}
              </span>
            )}
            {user.permissions?.map((perm: string) => (
              <span
                key={perm}
                className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>

        {/* Stopień */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#c9a227]" />
            <span className="text-white text-sm">{user.badge || 'Brak'}</span>
          </div>
        </div>

        {/* Plus/Minus */}
        <div className="col-span-1">
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-400 font-bold text-sm">+{user.plus_count || 0}</span>
            <span className="text-red-400 font-bold text-sm">-{user.minus_count || 0}</span>
          </div>
        </div>

        {/* Last Seen */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8fb5a0]" />
            <span className="text-[#8fb5a0] text-xs">
              {formatDate(user.last_seen || user.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end">
          <button
            onClick={() => onViewProfile(user.username)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <Eye className="w-4 h-4" />
            Zobacz
          </button>
        </div>
      </div>
    </div>
  );
}
