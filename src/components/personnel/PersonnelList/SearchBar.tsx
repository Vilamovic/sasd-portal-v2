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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Szukaj (nazwa, nick MTA)..."
          className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
        />
      </div>
    </div>
  );
}
