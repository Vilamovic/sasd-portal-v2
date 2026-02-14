'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import BackButton from '@/src/components/shared/BackButton';
import ArchivePagination from '@/src/components/shared/ArchivePagination';
import ArchiveSortButtons from '@/src/components/shared/ArchiveSortButtons';
import { useArchiveList } from '@/src/hooks/useArchiveList';
import { getAllSubmissions } from '@/src/lib/db/submissions';
import SubmissionStatusBadge from '../components/SubmissionStatusBadge';
import { TYPE_LABELS } from '../types';
import type { Submission } from '../types';

type SortField = 'date' | 'type' | 'user' | 'status';

const SORT_BUTTONS = [
  { field: 'date', label: 'Data' },
  { field: 'type', label: 'Typ' },
  { field: 'user', label: 'Użytkownik' },
  { field: 'status', label: 'Status' },
];

export default function ArchivedSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterOriginalStatus, setFilterOriginalStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const {
    loading, setLoading,
    sortBy, sortOrder, handleSortChange,
    currentPage, setCurrentPage, resetPage,
    expandedId, toggleExpand,
    formatDate, paginate,
  } = useArchiveList<SortField>('date');

  useEffect(() => {
    getAllSubmissions().then(({ data }) => {
      if (data) setSubmissions((data as Submission[]).filter(s => s.status === 'archived'));
      setLoading(false);
    });
  }, [setLoading]);

  const sorted = useMemo(() => {
    let result = submissions.filter((s) => {
      if (filterType && s.type !== filterType) return false;
      if (filterOriginalStatus && s.metadata?.original_status !== filterOriginalStatus) return false;
      if (filterUser) {
        const q = filterUser.toLowerCase();
        const username = s.user?.username?.toLowerCase() || '';
        const mtaNick = s.user?.mta_nick?.toLowerCase() || '';
        if (!username.includes(q) && !mtaNick.includes(q)) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case 'type': cmp = (TYPE_LABELS[a.type] || a.type).localeCompare(TYPE_LABELS[b.type] || b.type); break;
        case 'user': cmp = (a.user?.mta_nick || a.user?.username || '').localeCompare(b.user?.mta_nick || b.user?.username || ''); break;
        case 'status': cmp = (a.metadata?.original_status || '').localeCompare(b.metadata?.original_status || ''); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [submissions, filterType, filterOriginalStatus, filterUser, sortBy, sortOrder]);

  const { totalPages, paginatedData } = paginate(sorted);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/reports/management')} destination="Zarządzanie" />

        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ARCHIWUM ZGŁOSZEŃ
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); resetPage(); }}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie typy</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterOriginalStatus}
            onChange={(e) => { setFilterOriginalStatus(e.target.value); resetPage(); }}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie statusy</option>
            <option value="approved">Zaakceptowane</option>
            <option value="rejected">Odrzucone</option>
          </select>

          <input
            type="text"
            value={filterUser}
            onChange={(e) => { setFilterUser(e.target.value); resetPage(); }}
            placeholder="Filtruj po użytkowniku..."
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', width: '200px' }}
          />

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {sorted.length}
          </span>
        </div>

        <ArchiveSortButtons buttons={SORT_BUTTONS} sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />

        {/* Submissions List */}
        <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              ZARCHIWIZOWANE ({sorted.length}) - STRONA {currentPage}/{totalPages}
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarchiwizowanych zgłoszeń.</p>
            </div>
          ) : (
            <div>
              {paginatedData.map((submission, index) => {
                const originalStatus = submission.metadata?.original_status || 'pending';
                return (
                  <div key={submission.id}>
                    <div
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                      style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                      onClick={() => toggleExpand(submission.id)}
                    >
                      <div className="w-4 shrink-0">
                        {expandedId === submission.id
                          ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                          : <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />}
                      </div>
                      <div className="w-28 shrink-0">
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {submission.user?.mta_nick || submission.user?.username || '—'}
                        </span>
                      </div>
                      <div className="w-36 shrink-0">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {TYPE_LABELS[submission.type] || submission.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-content-text)' }}>
                          {submission.title || '—'}
                        </span>
                      </div>
                      <div className="w-28 shrink-0 text-right">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {formatDate(submission.created_at)}
                        </span>
                      </div>
                      <div className="w-28 shrink-0 text-right">
                        <SubmissionStatusBadge status={originalStatus as any} />
                      </div>
                    </div>

                    {expandedId === submission.id && (
                      <div className="border-l-4 ml-4" style={{ borderColor: 'var(--mdt-blue-bar)', backgroundColor: 'var(--mdt-input-bg)' }}>
                        <div className="px-4 py-3">
                          <div className="flex flex-wrap gap-4 mb-3">
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Autor</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.user?.mta_nick || submission.user?.username || '—'} (@{submission.user?.username})
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Typ</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {TYPE_LABELS[submission.type] || submission.type}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data zgłoszenia</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {formatDate(submission.created_at)}
                              </span>
                            </div>
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Oryginalny status</span>
                              <SubmissionStatusBadge status={originalStatus as any} />
                            </div>
                          </div>

                          {submission.title && (
                            <div className="mb-2">
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Tytuł</span>
                              <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.title}
                              </span>
                            </div>
                          )}

                          {submission.description && (
                            <div className="mb-3">
                              <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Treść zgłoszenia</span>
                              <div
                                className="panel-inset p-3 font-mono text-xs prose prose-sm max-w-none"
                                style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)', maxHeight: '500px', overflowY: 'auto', wordBreak: 'break-word' }}
                                dangerouslySetInnerHTML={{ __html: submission.description }}
                              />
                            </div>
                          )}

                          {submission.admin_response && (
                            <div className="mb-3">
                              <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                                Odpowiedź ({submission.reviewed_by_user?.mta_nick || submission.reviewed_by_user?.username || '—'})
                              </span>
                              <div className="panel-inset p-2 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)' }}>
                                {submission.admin_response}
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

        <ArchivePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
