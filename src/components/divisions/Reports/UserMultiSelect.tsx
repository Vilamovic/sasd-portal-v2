'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, Users } from 'lucide-react';
import { getAllUsersWithDetails } from '@/src/lib/db/users';

interface UserOption {
  id: string;
  username: string;
  mta_nick: string | null;
  badge: string | null;
}

interface UserMultiSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  excludeId?: string; // exclude current user (author)
  label?: string;
}

export default function UserMultiSelect({ selectedIds, onChange, excludeId, label = 'Uczestnicy' }: UserMultiSelectProps) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUsers() {
      const { data } = await getAllUsersWithDetails();
      if (data) {
        setUsers(
          data
            .filter((u: any) => u.id !== excludeId)
            .map((u: any) => ({
              id: u.id,
              username: u.username,
              mta_nick: u.mta_nick,
              badge: u.badge,
            }))
        );
      }
    }
    loadUsers();
  }, [excludeId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.mta_nick && u.mta_nick.toLowerCase().includes(q))
    );
  });

  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  return (
    <div ref={dropdownRef} className="relative">
      <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
        <Users className="w-3 h-3 inline mr-1" />
        {label}
      </label>

      {/* Selected chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {selectedUsers.map((u) => (
            <span
              key={u.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono"
              style={{ backgroundColor: 'var(--mdt-blue-bar)', color: '#fff' }}
            >
              {u.mta_nick || u.username}
              <button onClick={() => removeUser(u.id)} className="hover:opacity-70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="panel-inset w-full flex items-center justify-between px-2 py-1 font-mono text-xs"
        style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
      >
        <span style={{ color: selectedIds.length > 0 ? 'var(--mdt-content-text)' : 'var(--mdt-muted-text)' }}>
          {selectedIds.length > 0 ? `Wybrano: ${selectedIds.length}` : 'Wybierz uczestników...'}
        </span>
        <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div
          className="absolute z-[9999] w-full mt-1 panel-raised max-h-48 overflow-y-auto"
          style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        >
          {/* Search input */}
          <div className="p-1 border-b" style={{ borderColor: 'var(--mdt-muted-text)' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj..."
              className="panel-inset w-full px-2 py-0.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              autoFocus
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-2 font-mono text-xs text-center" style={{ color: 'var(--mdt-muted-text)' }}>
              Brak wyników
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isSelected = selectedIds.includes(u.id);
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUser(u.id)}
                  className="w-full text-left px-2 py-1 font-mono text-xs flex items-center gap-2 hover:opacity-80"
                  style={{
                    backgroundColor: isSelected ? 'var(--mdt-blue-bar)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--mdt-content-text)',
                  }}
                >
                  <input type="checkbox" checked={isSelected} readOnly className="pointer-events-none" />
                  <span>{u.mta_nick || u.username}</span>
                  {u.badge && (
                    <span className="ml-auto" style={{ color: isSelected ? '#ccc' : 'var(--mdt-muted-text)' }}>
                      {u.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
