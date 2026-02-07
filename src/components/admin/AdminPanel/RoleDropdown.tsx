import { createPortal } from 'react-dom';
import { ShieldCheck, ShieldOff, UserMinus } from 'lucide-react';
import { useEffect } from 'react';

interface User {
  id: string;
  mta_nick?: string;
  username?: string;
  role: string;
}

interface RoleDropdownProps {
  currentUser: User | null;
  currentUserId: string;
  role: string;
  isDev: boolean;
  dropdownPosition: { top: number; right: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onUpdateRole: (userId: string, newRole: string, userNick: string) => void;
  onKickUser: (userId: string, userNick: string) => void;
  onClose: () => void;
}

/**
 * RoleDropdown - Portal dropdown with role hierarchy
 * - Dev: can manage everyone except themselves
 * - HCS: can manage all except dev
 * - CS: can manage only trainee/deputy
 * - Kick permissions:
 *   - Dev/HCS: can kick anyone
 *   - CS: can kick only trainee/deputy
 */
export default function RoleDropdown({
  currentUser,
  currentUserId,
  role,
  isDev,
  dropdownPosition,
  dropdownRef,
  onUpdateRole,
  onKickUser,
  onClose,
}: RoleDropdownProps) {
  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef, onClose]);

  if (!currentUser) return null;

  const isCurrentUserSelf = currentUser.id === currentUserId;
  const isDevUser = currentUser.role === 'dev';

  if (isCurrentUserSelf || isDevUser) return null;

  const userNick = currentUser.mta_nick || currentUser.username || 'N/A';

  return createPortal(
    <div
      ref={dropdownRef}
      className="w-52 glass-strong rounded-xl shadow-2xl border border-[#1a4d32] py-2 z-[9999]"
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      {/* Role change options based on hierarchy */}
      <div className="px-3 py-1 text-xs text-[#8fb5a0] font-semibold">Zmień rolę:</div>

      {/* Dev and HCS can set HCS role */}
      {(isDev || role === 'hcs') && (
        <button
          onClick={() => onUpdateRole(currentUser.id, 'hcs', userNick)}
          className="w-full px-4 py-2 text-left hover:bg-red-600/10 transition-colors text-red-400 text-sm flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          HCS
        </button>
      )}

      {/* Dev, HCS, and CS can set CS role (but CS cannot set their own) */}
      {(isDev || role === 'hcs' || (role === 'cs' && currentUser.role !== 'cs')) && (
        <button
          onClick={() => onUpdateRole(currentUser.id, 'cs', userNick)}
          className="w-full px-4 py-2 text-left hover:bg-orange-600/10 transition-colors text-orange-400 text-sm flex items-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          CS
        </button>
      )}

      {/* Everyone (CS+) can set Deputy */}
      <button
        onClick={() => onUpdateRole(currentUser.id, 'deputy', userNick)}
        className="w-full px-4 py-2 text-left hover:bg-blue-600/10 transition-colors text-blue-400 text-sm flex items-center gap-2"
      >
        <ShieldCheck className="w-4 h-4" />
        Deputy
      </button>

      {/* Everyone (CS+) can set Trainee */}
      <button
        onClick={() => onUpdateRole(currentUser.id, 'trainee', userNick)}
        className="w-full px-4 py-2 text-left hover:bg-gray-600/10 transition-colors text-gray-400 text-sm flex items-center gap-2"
      >
        <ShieldOff className="w-4 h-4" />
        Trainee
      </button>

      <div className="border-t border-[#1a4d32] my-2" />

      {/* Kick options: Dev/HCS can kick anyone, CS can kick only trainee/deputy */}
      {(isDev ||
        role === 'hcs' ||
        (role === 'cs' &&
          (currentUser.role === 'trainee' || currentUser.role === 'deputy'))) && (
        <button
          onClick={() => onKickUser(currentUser.id, userNick)}
          className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors text-red-400 text-sm flex items-center gap-2"
        >
          <UserMinus className="w-4 h-4" />
          Wyrzuć
        </button>
      )}
    </div>,
    document.body
  );
}
