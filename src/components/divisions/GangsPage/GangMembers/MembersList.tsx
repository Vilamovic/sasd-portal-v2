'use client';

import { Search, ChevronDown } from 'lucide-react';
import { getSkinUrl } from './skinData';
import type { GangMember, GangOption } from './hooks/useGangMembers';

interface MembersListProps {
  members: GangMember[];
  gangs: GangOption[];
  gangFilter: string;
  searchQuery: string;
  loading: boolean;
  onGangFilterChange: (gangId: string) => void;
  onSearchChange: (query: string) => void;
  onSearch: (query: string) => void;
  onSelectMember: (id: string) => void;
  onCreateNew: () => void;
}

export default function MembersList({
  members,
  gangs,
  gangFilter,
  searchQuery,
  loading,
  onGangFilterChange,
  onSearchChange,
  onSearch,
  onSelectMember,
  onCreateNew,
}: MembersListProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--mdt-content)' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#059669' }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Członkowie gangów
        </span>
        <button
          onClick={onCreateNew}
          className="btn-win95 text-xs"
          style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
        >
          + DODAJ OSOBĘ
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--mdt-muted-text)' }}>
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(searchQuery)}
            placeholder="Szukaj (imię, nazwisko, ksywka)..."
            className="panel-inset w-full pl-7 pr-2 py-1 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
        </div>
        <div className="relative">
          <select
            value={gangFilter}
            onChange={(e) => onGangFilterChange(e.target.value)}
            className="panel-inset px-2 py-1 font-mono text-xs pr-6 min-w-[120px]"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
          >
            <option value="">Wszystkie gangi</option>
            {gangs.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--mdt-muted-text)' }} />
        </div>
      </div>

      {/* Table */}
      <div className="panel-inset flex-1 overflow-auto m-3" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
              ŁADOWANIE...<span className="cursor-blink ml-1">_</span>
            </span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: 'var(--mdt-header)' }}>
                <th className="px-2 py-2 w-10" />
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">NAZWISKO, IMIĘ</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">KSYWKA</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">GANG</th>
                <th className="px-3 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-wider text-[#ccc]">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, idx) => (
                <tr
                  key={m.id}
                  onClick={() => onSelectMember(m.id)}
                  className="cursor-pointer hover:brightness-110"
                  style={{
                    backgroundColor: idx % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)',
                    color: 'var(--mdt-content-text)',
                  }}
                >
                  <td className="px-2 py-1">
                    {m.skin_id != null ? (
                      <img
                        src={getSkinUrl(m.skin_id)}
                        alt=""
                        className="w-8 h-10 object-cover object-top"
                        style={{ border: '1px solid var(--mdt-muted-text)' }}
                      />
                    ) : (
                      <div className="w-8 h-10 flex items-center justify-center font-mono text-[8px]" style={{ backgroundColor: 'var(--mdt-input-bg)', border: '1px solid var(--mdt-muted-text)', color: 'var(--mdt-muted-text)' }}>
                        ?
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm font-bold">{m.last_name}, {m.first_name}</td>
                  <td className="px-3 py-2 font-mono text-sm italic" style={{ color: 'var(--mdt-muted-text)' }}>
                    {m.alias ? `"${m.alias}"` : '—'}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm">{m.gang?.title || '—'}</td>
                  <td className="px-3 py-2 font-mono text-sm">
                    <span style={{
                      color: m.status === 'DECEASED' ? '#c41e1e' : m.status === 'INCARCERATED' ? '#f59e0b' : '#4ade80',
                      fontWeight: 700,
                    }}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr style={{ backgroundColor: 'var(--mdt-row-even)' }}>
                  <td colSpan={5} className="px-3 py-8 text-center font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                    BRAK CZŁONKÓW W BAZIE DANYCH
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between border-t-2 border-t-[#555] px-4 py-2" style={{ backgroundColor: 'var(--mdt-header)' }}>
        <div className="flex items-center gap-2">
          <div className="pulse-dot h-2 w-2 rounded-full bg-green-500" />
          <span className="font-mono text-sm" style={{ color: '#aaa' }}>BAZA GU ONLINE</span>
        </div>
        <span className="font-mono text-sm" style={{ color: '#888' }}>
          REKORDY: {members.length}
        </span>
      </div>
    </div>
  );
}
