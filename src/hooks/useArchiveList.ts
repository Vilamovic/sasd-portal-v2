import { useState, useMemo, useCallback } from 'react';

const PER_PAGE = 30;

/**
 * Shared hook for archive list pages (submissions, exam results, reports).
 * Manages: pagination, expand/collapse, sort state, formatDate helper.
 */
export function useArchiveList<SortField extends string>(defaultSortBy: SortField) {
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSortChange = useCallback((field: SortField) => {
    setSortBy((prev) => {
      if (prev === field) {
        setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortOrder('desc');
      return field;
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const resetPage = useCallback(() => setCurrentPage(1), []);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }, []);

  function paginate<T>(sorted: T[]) {
    const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
    const paginatedData = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
    return { totalPages, paginatedData };
  }

  return {
    loading, setLoading,
    sortBy, sortOrder, handleSortChange,
    currentPage, setCurrentPage, resetPage,
    expandedId, toggleExpand,
    formatDate, paginate,
  };
}
