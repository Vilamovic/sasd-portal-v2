'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, Eye, X } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getUserSubmissions } from '@/src/lib/db/submissions';
import SubmissionStatusBadge from './components/SubmissionStatusBadge';
import { TYPE_LABELS } from './types';
import type { Submission } from './types';

export default function MySubmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailSubmission, setDetailSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    if (user?.id) loadSubmissions();
  }, [user?.id]);

  const loadSubmissions = async () => {
    const { data } = await getUserSubmissions(user!.id);
    if (data) setSubmissions(data as Submission[]);
    setLoading(false);
  };

  const filtered = submissions.filter((s) => {
    if (filterType && s.type !== filterType) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/reports')} destination="Zgłoszenia" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            MOJE ZGŁOSZENIA
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie typy</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie statusy</option>
            <option value="pending">Oczekujące</option>
            <option value="approved">Zaakceptowane</option>
            <option value="rejected">Odrzucone</option>
            <option value="archived">Zarchiwizowane</option>
          </select>

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {filtered.length}
          </span>
        </div>

        {/* Submissions Table */}
        <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          {/* Table Header */}
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              LISTA ZGŁOSZEŃ ({filtered.length})
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>
                ŁADOWANIE_
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
                Brak zgłoszeń do wyświetlenia.
              </p>
              <button
                onClick={() => router.push('/reports')}
                className="btn-win95 font-mono text-xs mt-3"
              >
                ZŁÓŻ NOWE ZGŁOSZENIE
              </button>
            </div>
          ) : (
            <div>
              {filtered.map((submission, index) => (
                <div
                  key={submission.id}
                  className="px-4 py-3 flex items-center gap-4"
                  style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                >
                  {/* Type */}
                  <div className="w-40 shrink-0">
                    <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
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
                  <div className="w-32 shrink-0 text-right">
                    <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                      {formatDate(submission.created_at)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="w-28 shrink-0 text-right">
                    <SubmissionStatusBadge status={submission.status} />
                  </div>

                  {/* Eye button — opens detail modal */}
                  <div className="w-6 shrink-0">
                    <button
                      onClick={() => setDetailSubmission(submission)}
                      title="Podgląd szczegółów"
                    >
                      <Eye className="w-3.5 h-3.5" style={{ color: submission.admin_response ? 'var(--mdt-content-text)' : 'var(--mdt-muted-text)' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailSubmission && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="panel-raised w-full max-w-lg mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            {/* Title bar */}
            <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
                SZCZEGÓŁY ZGŁOSZENIA
              </span>
              <button onClick={() => setDetailSubmission(null)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Type + Status */}
              <div className="flex items-center gap-2">
                <SubmissionStatusBadge status={detailSubmission.status} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                  {TYPE_LABELS[detailSubmission.type] || detailSubmission.type}
                </span>
                <span className="font-mono text-[10px] ml-auto" style={{ color: 'var(--mdt-muted-text)' }}>
                  {formatDate(detailSubmission.created_at)}
                </span>
              </div>

              {/* Title */}
              <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                <span className="font-mono text-xs font-bold block mb-0.5" style={{ color: 'var(--mdt-muted-text)' }}>TYTUŁ</span>
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                  {detailSubmission.title || '—'}
                </span>
              </div>

              {/* Description */}
              {detailSubmission.description && (
                <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                  <span className="font-mono text-xs font-bold block mb-0.5" style={{ color: 'var(--mdt-muted-text)' }}>TREŚĆ</span>
                  <p className="font-mono text-xs whitespace-pre-wrap" style={{ color: 'var(--mdt-content-text)' }}>
                    {detailSubmission.description}
                  </p>
                </div>
              )}

              {/* Admin Response */}
              {detailSubmission.admin_response ? (
                <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-muted-text)' }}>ODPOWIEDŹ ADMINISTRACJI</span>
                    {detailSubmission.reviewed_by_user && (
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        — {(detailSubmission.reviewed_by_user as any).mta_nick || (detailSubmission.reviewed_by_user as any).username}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs whitespace-pre-wrap" style={{ color: 'var(--mdt-content-text)' }}>
                    {detailSubmission.admin_response}
                  </p>
                </div>
              ) : (
                <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                    Brak odpowiedzi administracji.
                  </span>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={() => setDetailSubmission(null)}
                className="btn-win95 font-mono text-xs w-full py-1"
              >
                ZAMKNIJ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
