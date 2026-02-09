'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getArchivedExamResults } from '@/src/lib/db/practicalExamResults';
import type { PracticalExamResult, PracticalExamType } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

const PER_PAGE = 30;

export default function ArchivedExamResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<PracticalExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'examinee' | 'examiner' | 'result'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await getArchivedExamResults();
    if (data) setResults(data as PracticalExamResult[]);
    setLoading(false);
  };

  // Apply filters
  const filtered = results.filter((r) => {
    if (filterType && r.exam_type !== filterType) return false;
    if (filterUser) {
      const examineeName = (r.examinee?.mta_nick || r.examinee?.username || '').toLowerCase();
      const query = filterUser.toLowerCase();
      if (!examineeName.includes(query)) return false;
    }
    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.archived_at || a.created_at).getTime() - new Date(b.archived_at || b.created_at).getTime();
        break;
      case 'type':
        const aType = PRACTICAL_EXAM_TYPES[a.exam_type as PracticalExamType]?.label || a.exam_type;
        const bType = PRACTICAL_EXAM_TYPES[b.exam_type as PracticalExamType]?.label || b.exam_type;
        comparison = aType.localeCompare(bType);
        break;
      case 'examinee':
        const aExaminee = a.examinee?.mta_nick || a.examinee?.username || '';
        const bExaminee = b.examinee?.mta_nick || b.examinee?.username || '';
        comparison = aExaminee.localeCompare(bExaminee);
        break;
      case 'examiner':
        const aExaminer = a.examiner?.mta_nick || a.examiner?.username || '';
        const bExaminer = b.examiner?.mta_nick || b.examiner?.username || '';
        comparison = aExaminer.localeCompare(bExaminer);
        break;
      case 'result':
        comparison = (a.passed ? 1 : 0) - (b.passed ? 1 : 0);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginatedData = sorted.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSortChange = (field: 'date' | 'type' | 'examinee' | 'examiner' | 'result') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/zgloszenia/egzamin/management')} destination="Zarządzanie" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ARCHIWUM WYNIKÓW EGZAMINÓW
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie typy</option>
            {(Object.entries(PRACTICAL_EXAM_TYPES) as [PracticalExamType, { label: string }][]).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={filterUser}
            onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}
            placeholder="Filtruj po zdającym..."
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', width: '200px' }}
          />

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {filtered.length}
          </span>
        </div>

        {/* Sort controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>Sortuj:</span>
          <button
            onClick={() => handleSortChange('date')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'date' ? 'btn-win95-active' : ''}`}
          >
            Data {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('type')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'type' ? 'btn-win95-active' : ''}`}
          >
            Typ {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('examinee')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'examinee' ? 'btn-win95-active' : ''}`}
          >
            Zdający {sortBy === 'examinee' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('examiner')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'examiner' ? 'btn-win95-active' : ''}`}
          >
            Egzaminator {sortBy === 'examiner' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('result')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'result' ? 'btn-win95-active' : ''}`}
          >
            Wynik {sortBy === 'result' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* Results List */}
        <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              ZARCHIWIZOWANE ({filtered.length}) - STRONA {currentPage}/{totalPages}
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarchiwizowanych wyników.</p>
            </div>
          ) : (
            <div>
              {paginatedData.map((result, index) => {
                const examConfig = PRACTICAL_EXAM_TYPES[result.exam_type as PracticalExamType];
                return (
                  <div key={result.id}>
                    {/* Result Row */}
                    <div
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                      style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                      onClick={() => toggleExpand(result.id)}
                    >
                      {/* Expand icon */}
                      <div className="w-4 shrink-0">
                        {expandedId === result.id ? (
                          <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        ) : (
                          <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        )}
                      </div>

                      {/* Examinee */}
                      <div className="w-28 shrink-0">
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {result.examinee?.mta_nick || result.examinee?.username || '—'}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="w-36 shrink-0">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {examConfig?.label || result.exam_type}
                        </span>
                      </div>

                      {/* Score */}
                      <div className="w-20 shrink-0">
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {result.score}/{result.max_score}
                        </span>
                      </div>

                      {/* Result Badge */}
                      <div className="w-20 shrink-0">
                        <span
                          className="panel-raised px-2 py-0.5 font-mono text-[10px] inline-block"
                          style={{
                            backgroundColor: result.passed ? '#3a6a3a' : '#8b1a1a',
                            color: '#fff',
                            borderColor: result.passed ? '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' : '#b03a3a #4a0a0a #4a0a0a #b03a3a'
                          }}
                        >
                          {result.passed ? 'ZDANY' : 'NIEZDANY'}
                        </span>
                      </div>

                      {/* Examiner */}
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-muted-text)' }}>
                          Egz: {result.examiner?.mta_nick || result.examiner?.username || '—'}
                        </span>
                      </div>

                      {/* Archived Date */}
                      <div className="w-28 shrink-0 text-right">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {result.archived_at ? formatDate(result.archived_at) : formatDate(result.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details Panel */}
                    {expandedId === result.id && (
                      <div className="border-l-4 ml-4" style={{ borderColor: 'var(--mdt-blue-bar)', backgroundColor: 'var(--mdt-input-bg)' }}>
                        <div className="px-4 py-3">
                          {/* Metadata row */}
                          <div className="flex flex-wrap gap-4 mb-3">
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Zdający</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {result.examinee?.mta_nick || result.examinee?.username || '—'}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Egzaminator</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {result.examiner?.mta_nick || result.examiner?.username || '—'}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Typ egzaminu</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {examConfig?.label || result.exam_type}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Wynik</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {result.score}/{result.max_score} ({result.passed ? 'ZDANY' : 'NIEZDANY'})
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data egzaminu</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {formatDate(result.created_at)}
                              </span>
                            </div>
                            {result.archived_by_user && (
                              <div>
                                <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Zarchiwizował</span>
                                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                  {result.archived_by_user.mta_nick || result.archived_by_user.username}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Checklist */}
                          {result.checklist && result.checklist.length > 0 && (
                            <div className="mb-3">
                              <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Checklist</span>
                              <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
                                {result.checklist.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 py-1">
                                    <span className="font-mono text-xs" style={{ color: item.checked ? '#3a6a3a' : '#8b1a1a' }}>
                                      {item.checked ? '✓' : '✗'}
                                    </span>
                                    <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                      {item.item}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {result.notes && (
                            <div className="mb-3">
                              <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Notatki</span>
                              <div className="panel-inset p-2 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)' }}>
                                {result.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-win95 p-1"
              style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
