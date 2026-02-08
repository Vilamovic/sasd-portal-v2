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
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: 'var(--mdt-muted-text)' }}
      />
      <input
        type="text"
        placeholder={
          isDev
            ? 'Szukaj (nazwa, nick MTA, stopień, email)...'
            : 'Szukaj (nazwa, nick MTA, stopień)...'
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="panel-inset w-full pl-10 pr-4 py-2 font-mono text-sm"
        style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
      />
    </div>
  );
}
