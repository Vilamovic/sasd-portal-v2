type FilterType = 'all' | 'mandatory' | 'optional';

interface MaterialFilterProps {
  value: FilterType;
  onChange: (value: FilterType) => void;
  totalCount: number;
  mandatoryCount: number;
  optionalCount: number;
}

/**
 * MaterialFilter - Filtr obowiązkowości materiałów
 * - Win95 style button group
 * - Pokazuje liczby przy każdej opcji
 */
export default function MaterialFilter({
  value,
  onChange,
  totalCount,
  mandatoryCount,
  optionalCount,
}: MaterialFilterProps) {
  const options: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Wszystkie', count: totalCount },
    { key: 'mandatory', label: 'Obowiązkowe', count: mandatoryCount },
    { key: 'optional', label: 'Dodatkowe', count: optionalCount },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
        Filtr:
      </span>
      {options.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`btn-win95 font-mono text-xs ${value === key ? 'btn-win95-active' : ''}`}
        >
          {label} ({count})
        </button>
      ))}
    </div>
  );
}
