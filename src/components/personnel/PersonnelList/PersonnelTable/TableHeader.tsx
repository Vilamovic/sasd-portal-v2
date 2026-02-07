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
    <div className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50 px-6 py-4">
      <div className="grid grid-cols-12 gap-4 items-center text-[#8fb5a0] text-xs font-bold uppercase">
        <div className="col-span-1 flex items-center">
          <button
            onClick={toggleSelectAll}
            className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
          >
            {selectedCount === totalCount ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        </div>
        <button
          onClick={() => handleSort('name')}
          className="col-span-3 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
        >
          Użytkownik
          <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'name' ? 'text-[#c9a227]' : ''}`} />
        </button>
        <div className="col-span-2">Dywizja/Uprawnienia</div>
        <button
          onClick={() => handleSort('badge')}
          className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
        >
          Stopień
          <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'badge' ? 'text-[#c9a227]' : ''}`} />
        </button>
        <button
          onClick={() => handleSort('plus')}
          className="col-span-1 flex items-center justify-center gap-1 cursor-pointer hover:text-[#c9a227] transition-colors"
        >
          +/-
          <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'plus' || sortBy === 'minus' ? 'text-[#c9a227]' : ''}`} />
        </button>
        <button
          onClick={() => handleSort('last_seen')}
          className="col-span-2 flex items-center gap-2 cursor-pointer hover:text-[#c9a227] transition-colors"
        >
          Ostatnio
          <ArrowUpDown className={`w-3.5 h-3.5 ${sortBy === 'last_seen' ? 'text-[#c9a227]' : ''}`} />
        </button>
        <div className="col-span-1 text-right">Akcje</div>
      </div>
    </div>
  );
}
