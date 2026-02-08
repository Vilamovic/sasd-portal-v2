import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mb-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--mdt-muted-text)' }}
        />
        <input
          type="text"
          placeholder="Szukaj po nicku, username lub typie egzaminu..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="panel-inset w-full pl-10 pr-4 py-2 font-mono text-sm"
          style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
        />
      </div>
    </div>
  );
}
