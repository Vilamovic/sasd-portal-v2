'use client';

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
      className="panel-raised z-[9999]"
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
        width: '13rem',
        backgroundColor: 'var(--mdt-btn-face)',
      }}
    >
      {/* Role change options based on hierarchy */}
      <div
        className="px-2 py-1 font-mono text-xs font-semibold"
        style={{ backgroundColor: 'var(--mdt-header)', color: '#ccc' }}
      >
        Zmień rolę:
      </div>

      {/* Dev and HCS can set HCS role */}
      {(isDev || role === 'hcs') && (
        <button
          onClick={() => onUpdateRole(currentUser.id, 'hcs', userNick)}
          className="btn-win95 w-full px-3 py-1.5 text-left font-mono text-sm flex items-center gap-2"
          style={{ color: '#8b0000' }}
        >
          <ShieldCheck className="w-4 h-4" />
          HCS
        </button>
      )}

      {/* Dev, HCS, and CS can set CS role (but CS cannot set their own) */}
      {(isDev || role === 'hcs' || (role === 'cs' && currentUser.role !== 'cs')) && (
        <button
          onClick={() => onUpdateRole(currentUser.id, 'cs', userNick)}
          className="btn-win95 w-full px-3 py-1.5 text-left font-mono text-sm flex items-center gap-2"
          style={{ color: '#a0522d' }}
        >
          <ShieldCheck className="w-4 h-4" />
          CS
        </button>
      )}

      {/* Everyone (CS+) can set Deputy */}
      <button
        onClick={() => onUpdateRole(currentUser.id, 'deputy', userNick)}
        className="btn-win95 w-full px-3 py-1.5 text-left font-mono text-sm flex items-center gap-2"
        style={{ color: '#4a7abf' }}
      >
        <ShieldCheck className="w-4 h-4" />
        Deputy
      </button>

      {/* Everyone (CS+) can set Trainee */}
      <button
        onClick={() => onUpdateRole(currentUser.id, 'trainee', userNick)}
        className="btn-win95 w-full px-3 py-1.5 text-left font-mono text-sm flex items-center gap-2"
        style={{ color: 'var(--mdt-content-text)' }}
      >
        <ShieldOff className="w-4 h-4" />
        Trainee
      </button>

      <hr style={{ borderColor: 'var(--mdt-border-mid)', margin: '2px 0' }} />

      {/* Kick options: Dev/HCS can kick anyone, CS can kick only trainee/deputy */}
      {(isDev ||
        role === 'hcs' ||
        (role === 'cs' &&
          (currentUser.role === 'trainee' || currentUser.role === 'deputy'))) && (
        <button
          onClick={() => onKickUser(currentUser.id, userNick)}
          className="btn-win95 w-full px-3 py-1.5 text-left font-mono text-sm flex items-center gap-2"
          style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
        >
          <UserMinus className="w-4 h-4" />
          Wyrzuć
        </button>
      )}
    </div>,
    document.body
  );
}
