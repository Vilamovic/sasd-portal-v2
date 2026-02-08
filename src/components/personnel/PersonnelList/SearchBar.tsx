'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

/**
 * SearchBar - Input wyszukiwania użytkowników
 */
export default function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="lg:col-span-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj (nazwa, nick MTA)..."
          className="panel-inset w-full pl-10 pr-4 py-2 font-mono text-sm"
          style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
        />
      </div>
    </div>
  );
}
