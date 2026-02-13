import { ArrowUpDown } from 'lucide-react';
import UserRow from './UserRow';

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

interface UsersTableProps {
  users: User[];
  currentUserId: string;
  isCS: boolean;
  isDev: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  onToggleDropdown: (userId: string) => void;
  buttonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}

/**
 * UsersTable - Sortable users table
 * - Sortable columns (username, badge, role, created_at, last_seen)
 * - Role-based columns (email visible only for dev)
 * - Empty state
 */
export default function UsersTable({
  users,
  currentUserId,
  isCS,
  isDev,
  sortBy,
  sortOrder,
  onSort,
  onToggleDropdown,
  buttonRefs,
}: UsersTableProps) {
  return (
    <div className="panel-raised overflow-hidden" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'var(--mdt-header)' }}>
              {/* Username Column */}
              <th
                onClick={() => onSort('mta_nick')}
                className="px-4 py-2 text-left cursor-pointer font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                <div className="flex items-center gap-1">
                  Użytkownik
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* Badge Column */}
              <th
                onClick={() => onSort('badge')}
                className="px-4 py-2 text-left cursor-pointer font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                <div className="flex items-center gap-1">
                  Stopień
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* Email Column (Dev only) */}
              {isDev && (
                <th
                  className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                  style={{ color: '#ccc' }}
                >
                  Email
                </th>
              )}

              {/* Role Column */}
              <th
                onClick={() => onSort('role')}
                className="px-4 py-2 text-left cursor-pointer font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                <div className="flex items-center gap-1">
                  Rola
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* Created At Column */}
              <th
                onClick={() => onSort('created_at')}
                className="px-4 py-2 text-left cursor-pointer font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                <div className="flex items-center gap-1">
                  Utworzono
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* Last Seen Column */}
              <th
                onClick={() => onSort('last_seen')}
                className="px-4 py-2 text-left cursor-pointer font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                <div className="flex items-center gap-1">
                  Ostatnio Widziany
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>

              {/* Action Column */}
              <th
                className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-base"
                style={{ color: '#ccc' }}
              >
                Akcja
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={isDev ? 7 : 6}
                  className="px-4 py-6 text-center font-mono text-sm"
                  style={{ color: 'var(--mdt-muted-text)' }}
                >
                  Brak użytkowników do wyświetlenia
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  isCS={isCS}
                  isDev={isDev}
                  onToggleDropdown={onToggleDropdown}
                  buttonRef={(el) => (buttonRefs.current[user.id] = el)}
                  index={index}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
