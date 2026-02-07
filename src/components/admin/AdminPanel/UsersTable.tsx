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
  sortBy,
  sortOrder,
  onSort,
  onToggleDropdown,
  buttonRefs,
}: UsersTableProps) {
  return (
    <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
            <tr>
              {/* Username Column */}
              <th
                onClick={() => onSort('mta_nick')}
                className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Użytkownik
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Badge Column */}
              <th
                onClick={() => onSort('badge')}
                className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Stopień
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Email Column (CS+ only) */}
              {isCS && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                  Email
                </th>
              )}

              {/* Role Column */}
              <th
                onClick={() => onSort('role')}
                className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Rola
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Created At Column */}
              <th
                onClick={() => onSort('created_at')}
                className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Utworzono
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Last Seen Column */}
              <th
                onClick={() => onSort('last_seen')}
                className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227] cursor-pointer hover:text-[#e6b830] transition-colors"
              >
                <div className="flex items-center gap-2">
                  Ostatnio Widziany
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Action Column */}
              <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">
                Akcja
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={isCS ? 7 : 6}
                  className="px-6 py-8 text-center text-[#8fb5a0]"
                >
                  Brak użytkowników do wyświetlenia
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  isCS={isCS}
                  onToggleDropdown={onToggleDropdown}
                  buttonRef={(el) => (buttonRefs.current[user.id] = el)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
