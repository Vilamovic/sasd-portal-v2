'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getAllSubmissions } from '@/src/lib/db/submissions';
import SubmissionStatusBadge from '../components/SubmissionStatusBadge';
import { TYPE_LABELS } from '../types';
import type { Submission } from '../types';

const PER_PAGE = 30;

export default function ArchivedSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterOriginalStatus, setFilterOriginalStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'user' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await getAllSubmissions();
    if (data) {
      // Filter only archived
      const archived = (data as Submission[]).filter(s => s.status === 'archived');
      setSubmissions(archived);
    }
    setLoading(false);
  };

  // Apply filters
  const filtered = submissions.filter((s) => {
    if (filterType && s.type !== filterType) return false;
    if (filterOriginalStatus && s.metadata?.original_status !== filterOriginalStatus) return false;
    if (filterUser) {
      const username = s.user?.username?.toLowerCase() || '';
      const mtaNick = s.user?.mta_nick?.toLowerCase() || '';
      const query = filterUser.toLowerCase();
      if (!username.includes(query) && !mtaNick.includes(query)) return false;
    }
    return true;
  });

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'type':
        comparison = (TYPE_LABELS[a.type] || a.type).localeCompare(TYPE_LABELS[b.type] || b.type);
        break;
      case 'user':
        const aUser = a.user?.mta_nick || a.user?.username || '';
        const bUser = b.user?.mta_nick || b.user?.username || '';
        comparison = aUser.localeCompare(bUser);
        break;
      case 'status':
        const aStatus = a.metadata?.original_status || '';
        const bStatus = b.metadata?.original_status || '';
        comparison = aStatus.localeCompare(bStatus);
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

  const handleSortChange = (field: 'date' | 'type' | 'user' | 'status') => {
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
        <BackButton onClick={() => router.push('/zgloszenia/management')} destination="Zarządzanie" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ARCHIWUM ZGŁOSZEŃ
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
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterOriginalStatus}
            onChange={(e) => { setFilterOriginalStatus(e.target.value); setCurrentPage(1); }}
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
            onChange={(e) => { setFilterUser(e.target.value); setCurrentPage(1); }}
            placeholder="Filtruj po użytkowniku..."
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
            onClick={() => handleSortChange('user')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'user' ? 'btn-win95-active' : ''}`}
          >
            Użytkownik {sortBy === 'user' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('status')}
            className={`btn-win95 font-mono text-xs ${sortBy === 'status' ? 'btn-win95-active' : ''}`}
          >
            Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>

        {/* Submissions List */}
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
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarchiwizowanych zgłoszeń.</p>
            </div>
          ) : (
            <div>
              {paginatedData.map((submission, index) => {
                const originalStatus = submission.metadata?.original_status || 'pending';
                return (
                  <div key={submission.id}>
                    {/* Submission Row */}
                    <div
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                      style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                      onClick={() => toggleExpand(submission.id)}
                    >
                      {/* Expand icon */}
                      <div className="w-4 shrink-0">
                        {expandedId === submission.id ? (
                          <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        ) : (
                          <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        )}
                      </div>

                      {/* User */}
                      <div className="w-28 shrink-0">
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {submission.user?.mta_nick || submission.user?.username || '—'}
                        </span>
                      </div>

                      {/* Type */}
                      <div className="w-36 shrink-0">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {TYPE_LABELS[submission.type] || submission.type}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-content-text)' }}>
                          {submission.title || '—'}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="w-28 shrink-0 text-right">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {formatDate(submission.created_at)}
                        </span>
                      </div>

                      {/* Original Status */}
                      <div className="w-28 shrink-0 text-right">
                        <SubmissionStatusBadge status={originalStatus as any} />
                      </div>
                    </div>

                    {/* Expanded Preview Panel */}
                    {expandedId === submission.id && (
                      <div className="border-l-4 ml-4" style={{ borderColor: 'var(--mdt-blue-bar)', backgroundColor: 'var(--mdt-input-bg)' }}>
                        <div className="px-4 py-3">
                          {/* Metadata row */}
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

                          {/* Title */}
                          {submission.title && (
                            <div className="mb-2">
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Tytuł</span>
                              <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.title}
                              </span>
                            </div>
                          )}

                          {/* Description / Content */}
                          {submission.description && (
                            <div className="mb-3">
                              <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Treść zgłoszenia</span>
                              <div
                                className="panel-inset p-3 font-mono text-xs prose prose-sm max-w-none"
                                style={{
                                  backgroundColor: 'var(--mdt-panel-content)',
                                  color: 'var(--mdt-content-text)',
                                  maxHeight: '500px',
                                  overflowY: 'auto',
                                  wordBreak: 'break-word'
                                }}
                                dangerouslySetInnerHTML={{ __html: submission.description }}
                              />
                            </div>
                          )}

                          {/* Admin response */}
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
