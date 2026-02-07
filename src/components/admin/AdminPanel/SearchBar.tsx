import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isDev: boolean;
}

/**
 * SearchBar - Search input with role-based placeholder
 * - Dev: can search by email
 * - CS/HCS: cannot search by email (privacy)
 */
export default function SearchBar({ value, onChange, isDev }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
      <input
        type="text"
        placeholder={
          isDev
            ? 'Szukaj (nazwa, nick MTA, stopień, email)...'
            : 'Szukaj (nazwa, nick MTA, stopień)...'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
      />
    </div>
  );
}
