'use client';

import { ArrowUpDown, CheckSquare, Square } from 'lucide-react';

interface TableHeaderProps {
  selectedCount: number;
  totalCount: number;
  toggleSelectAll: () => void;
  sortBy: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen' | 'created_at';
  sortOrder: 'asc' | 'desc';
  handleSort: (column: 'name' | 'badge' | 'plus' | 'minus' | 'last_seen') => void;
}

/**
 * TableHeader - Sortowalne nagłówki kolumn kartoteki
 */
export default function TableHeader({
  selectedCount,
  totalCount,
  toggleSelectAll,
  sortBy,
  sortOrder,
  handleSort,
}: TableHeaderProps) {
  return (
    <div style={{ backgroundColor: 'var(--mdt-header)' }} className="px-4 py-2 border-b border-gray-400">
      <div className="grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 flex items-center">
          <button
            onClick={toggleSelectAll}
            className="font-mono text-sm"
            style={{ color: '#ccc' }}
          >
            {selectedCount === totalCount ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
        <button
          onClick={() => handleSort('name')}
          className="col-span-3 flex items-center gap-1 cursor-pointer font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase"
          style={{ color: '#ccc' }}
        >
          Użytkownik
          <ArrowUpDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-white' : ''}`} />
        </button>
        <div className="col-span-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Dywizja/Uprawnienia</div>
        <button
          onClick={() => handleSort('badge')}
          className="col-span-2 flex items-center gap-1 cursor-pointer font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase"
          style={{ color: '#ccc' }}
        >
          Stopień
          <ArrowUpDown className={`w-3 h-3 ${sortBy === 'badge' ? 'text-white' : ''}`} />
        </button>
        <button
          onClick={() => handleSort('plus')}
          className="col-span-1 flex items-center justify-center gap-1 cursor-pointer font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase"
          style={{ color: '#ccc' }}
        >
          +/-
          <ArrowUpDown className={`w-3 h-3 ${sortBy === 'plus' || sortBy === 'minus' ? 'text-white' : ''}`} />
        </button>
        <button
          onClick={() => handleSort('last_seen')}
          className="col-span-2 flex items-center gap-1 cursor-pointer font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase"
          style={{ color: '#ccc' }}
        >
          Ostatnio
          <ArrowUpDown className={`w-3 h-3 ${sortBy === 'last_seen' ? 'text-white' : ''}`} />
        </button>
        <div className="col-span-1 text-right font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Akcje</div>
      </div>
    </div>
  );
}
