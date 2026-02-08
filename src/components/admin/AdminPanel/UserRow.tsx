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
  index: number;
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
  index,
}: UserRowProps) {
  const isCurrentUser = user.id === currentUserId;
  const isDevUser = user.role === 'dev';

  const getRoleBadgeStyle = (roleValue: string): React.CSSProperties => {
    switch (roleValue) {
      case 'dev':
        return { backgroundColor: '#d8b4fe', color: '#4b0082', border: '1px solid #9333ea' };
      case 'hcs':
        return { backgroundColor: '#fca5a5', color: '#7f1d1d', border: '1px solid #dc2626' };
      case 'cs':
        return { backgroundColor: '#fdba74', color: '#7c2d12', border: '1px solid #ea580c' };
      case 'deputy':
        return { backgroundColor: '#99f6e4', color: '#134e4a', border: '1px solid #0d9488' };
      case 'trainee':
        return { backgroundColor: '#d1d5db', color: '#374151', border: '1px solid #9ca3af' };
      default:
        return { backgroundColor: '#d1d5db', color: '#374151', border: '1px solid #9ca3af' };
    }
  };

  return (
    <tr
      style={{
        backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)',
      }}
    >
      {/* User (Avatar + Nick + Username) */}
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.mta_nick || user.username || 'User'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
              style={{ border: '1px solid var(--mdt-border-mid)' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-surface-light)', color: '#fff', border: '1px solid var(--mdt-border-mid)' }}
            >
              {((user.mta_nick || user.username) || '?')[0].toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              {user.mta_nick || user.username || 'N/A'}
            </div>
            <div className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              @{user.username || 'N/A'}
            </div>
          </div>
        </div>
      </td>

      {/* Badge */}
      <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
        {user.badge || 'N/A'}
      </td>

      {/* Email (CS+ only) */}
      {isCS && (
        <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
          {user.email || 'N/A'}
        </td>
      )}

      {/* Role */}
      <td className="px-4 py-2">
        <span
          className="px-2 py-0.5 text-xs font-mono font-semibold"
          style={getRoleBadgeStyle(user.role)}
        >
          {user.role}
        </span>
      </td>

      {/* Created At */}
      <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
        {new Date(user.created_at).toLocaleDateString('pl-PL')}
      </td>

      {/* Last Seen */}
      <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
        {user.last_seen ? new Date(user.last_seen).toLocaleString('pl-PL') : 'Nigdy'}
      </td>

      {/* Action Dropdown Button */}
      <td className="px-4 py-2">
        <div className="flex justify-center">
          <button
            ref={buttonRef}
            onClick={() => onToggleDropdown(user.id)}
            disabled={isCurrentUser || isDevUser}
            className="btn-win95 p-1"
            title={
              isCurrentUser
                ? 'Nie możesz zarządzać własnym kontem'
                : isDevUser
                ? 'Nie możesz zarządzać devem'
                : 'Akcje'
            }
            style={
              isCurrentUser || isDevUser
                ? { color: 'var(--mdt-border-mid)', cursor: 'not-allowed' }
                : { color: 'var(--mdt-content-text)' }
            }
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
