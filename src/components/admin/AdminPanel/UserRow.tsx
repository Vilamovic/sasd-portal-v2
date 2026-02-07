import { MoreVertical } from 'lucide-react';

interface User {
  id: string;
  mta_nick?: string;
  username?: string;
  avatar_url?: string;
  badge?: string;
  email?: string;
  role: string;
  created_at: string;
  last_seen?: string;
}

interface UserRowProps {
  user: User;
  currentUserId: string;
  isCS: boolean;
  onToggleDropdown: (userId: string) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

/**
 * UserRow - Single user row in table
 * - Avatar + nick/username
 * - Badge, role, dates
 * - Action dropdown button
 */
export default function UserRow({
  user,
  currentUserId,
  isCS,
  onToggleDropdown,
  buttonRef,
}: UserRowProps) {
  const isCurrentUser = user.id === currentUserId;
  const isDevUser = user.role === 'dev';

  const getRoleBadgeStyle = (roleValue: string) => {
    switch (roleValue) {
      case 'dev':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'hcs':
        return 'bg-red-900/30 text-red-400 border-red-900/40';
      case 'cs':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'deputy':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'trainee':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <tr className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors">
      {/* User (Avatar + Nick + Username) */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.mta_nick || user.username || 'User'}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover shadow-lg border-2 border-[#c9a227]/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a4d32] to-[#22693f] flex items-center justify-center text-white font-bold shadow-lg border-2 border-[#c9a227]/30">
              {((user.mta_nick || user.username) || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="text-white font-medium">
              {user.mta_nick || user.username || 'N/A'}
            </div>
            <div className="text-[#8fb5a0] text-xs">@{user.username || 'N/A'}</div>
          </div>
        </div>
      </td>

      {/* Badge */}
      <td className="px-6 py-4 text-[#8fb5a0]">{user.badge || 'N/A'}</td>

      {/* Email (CS+ only) */}
      {isCS && (
        <td className="px-6 py-4 text-[#8fb5a0] text-sm">{user.email || 'N/A'}</td>
      )}

      {/* Role */}
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeStyle(
            user.role
          )}`}
        >
          {user.role}
        </span>
      </td>

      {/* Created At */}
      <td className="px-6 py-4 text-[#8fb5a0] text-sm">
        {new Date(user.created_at).toLocaleDateString('pl-PL')}
      </td>

      {/* Last Seen */}
      <td className="px-6 py-4 text-[#8fb5a0] text-sm">
        {user.last_seen ? new Date(user.last_seen).toLocaleString('pl-PL') : 'Nigdy'}
      </td>

      {/* Action Dropdown Button */}
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <button
            ref={buttonRef}
            onClick={() => onToggleDropdown(user.id)}
            disabled={isCurrentUser || isDevUser}
            className={`p-2 rounded-lg transition-colors ${
              isCurrentUser || isDevUser
                ? 'bg-[#1a4d32]/30 text-[#8fb5a0]/50 cursor-not-allowed'
                : 'bg-[#1a4d32]/50 text-[#8fb5a0] hover:bg-[#c9a227]/20 hover:text-[#c9a227]'
            }`}
            title={
              isCurrentUser
                ? 'Nie możesz zarządzać własnym kontem'
                : isDevUser
                ? 'Nie możesz zarządzać devem'
                : 'Akcje'
            }
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
