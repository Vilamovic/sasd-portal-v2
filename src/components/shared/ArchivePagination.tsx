import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArchivePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ArchivePagination({ currentPage, totalPages, onPageChange }: ArchivePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn-win95 p-1"
        style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="font-mono text-xs px-4" style={{ color: 'var(--mdt-content-text)' }}>
        Strona {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="btn-win95 p-1"
        style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
