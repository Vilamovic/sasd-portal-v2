interface SortButtonConfig {
  field: string;
  label: string;
}

interface ArchiveSortButtonsProps {
  buttons: SortButtonConfig[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: any) => void;
}

export default function ArchiveSortButtons({ buttons, sortBy, sortOrder, onSortChange }: ArchiveSortButtonsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>Sortuj:</span>
      {buttons.map(({ field, label }) => (
        <button
          key={field}
          onClick={() => onSortChange(field)}
          className={`btn-win95 font-mono text-xs ${sortBy === field ? 'btn-win95-active' : ''}`}
        >
          {label} {sortBy === field && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      ))}
    </div>
  );
}
