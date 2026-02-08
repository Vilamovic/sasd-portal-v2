'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Check, X, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getAllSubmissions, updateSubmissionStatus } from '@/src/lib/db/submissions';
import { getRecruitmentStatus, updateRecruitmentStatus } from '@/src/lib/db/recruitment';
import { notifySubmissionStatusChange } from '@/src/lib/webhooks/submissions';
import { supabase } from '@/src/supabaseClient';
import SubmissionStatusBadge from '../components/SubmissionStatusBadge';
import { TYPE_LABELS } from '../types';
import type { Submission, RecruitmentStatus } from '../types';

export default function SubmissionsManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recruitment, setRecruitment] = useState<RecruitmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [deductVacation, setDeductVacation] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [subsResult, recResult] = await Promise.all([
      getAllSubmissions(),
      getRecruitmentStatus(),
    ]);
    if (subsResult.data) setSubmissions(subsResult.data as Submission[]);
    if (recResult.data) setRecruitment(recResult.data);
    setLoading(false);
  };

  const filtered = submissions.filter((s) => {
    if (filterType && s.type !== filterType) return false;
    if (filterStatus && s.status !== filterStatus) return false;
    return true;
  });

  const handleReview = async (submissionId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !adminResponse.trim()) {
      alert('Podaj powód odrzucenia');
      return;
    }

    const submission = submissions.find((s) => s.id === submissionId);
    if (!submission) return;

    const { error } = await updateSubmissionStatus(
      submissionId,
      status,
      user!.id,
      status === 'rejected' ? adminResponse.trim() : adminResponse.trim() || undefined
    );

    if (!error) {
      // Vacation deduction logic
      if (status === 'approved' && submission.type === 'vacation' && deductVacation) {
        const daysCount = submission.metadata?.days_count || 0;
        const { data: userData } = await supabase
          .from('users')
          .select('vacation_days_total, vacation_days_used')
          .eq('id', submission.user_id)
          .single();

        if (userData) {
          const total = userData.vacation_days_total || 21;
          const currentUsed = userData.vacation_days_used || 0;
          // Cap at total so available never goes below 0
          const newUsed = Math.min(currentUsed + daysCount, total);
          await supabase
            .from('users')
            .update({ vacation_days_used: newUsed })
            .eq('id', submission.user_id);
        }
      }

      // Plus exchange deduction logic
      if (status === 'approved' && submission.type === 'plus_exchange') {
        const cost = submission.metadata?.cost || 0;
        const { data: userData } = await supabase
          .from('users')
          .select('plus_count')
          .eq('id', submission.user_id)
          .single();

        if (userData) {
          const newPlusCount = Math.max(0, (userData.plus_count || 0) - cost);
          await supabase
            .from('users')
            .update({ plus_count: newPlusCount })
            .eq('id', submission.user_id);
        }
      }

      await notifySubmissionStatusChange({
        type: submission.type,
        title: submission.title || undefined,
        status,
        user: {
          username: submission.user?.username || '',
          mta_nick: submission.user?.mta_nick || undefined,
        },
        reviewedBy: {
          username: user?.user_metadata?.custom_claims?.global_name || '',
        },
        adminResponse: adminResponse.trim() || undefined,
      });

      setReviewingId(null);
      setExpandedId(null);
      setAdminResponse('');
      setApprovingId(null);
      setDeductVacation(true);
      loadData();
    }
  };

  const handleRecruitmentToggle = async (division: string, currentState: boolean) => {
    const { error } = await updateRecruitmentStatus(division, !currentState, user!.id);
    if (!error) loadData();
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/zgloszenia')} destination="Zgłoszenia" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ZARZĄDZANIE ZGŁOSZENIAMI
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setShowRecruitment(!showRecruitment)}
            className={`btn-win95 font-mono text-xs flex items-center gap-1 ${showRecruitment ? 'btn-win95-active' : ''}`}
          >
            <Settings className="w-3 h-3" />
            REKRUTACJA DYWIZJI
          </button>
        </div>

        {/* Recruitment Settings */}
        {showRecruitment && (
          <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
                STATUS REKRUTACJI
              </span>
            </div>
            <div className="p-3 flex flex-wrap gap-3">
              {recruitment.map((r) => (
                <button
                  key={r.division}
                  onClick={() => handleRecruitmentToggle(r.division, r.is_open)}
                  className="btn-win95 font-mono text-xs px-4 py-2 flex items-center gap-2"
                  style={r.is_open ? { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' } : {}}
                >
                  <span className={`w-2 h-2 rounded-full ${r.is_open ? 'bg-green-500 pulse-dot' : 'bg-red-500'}`} />
                  {r.division}: {r.is_open ? 'OTWARTA' : 'ZAMKNIĘTA'}
                </button>
              ))}
            </div>
          </div>
        )}

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
          </select>

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {filtered.length}
          </span>
        </div>

        {/* Submissions List */}
        <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              ZGŁOSZENIA ({filtered.length})
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zgłoszeń.</p>
            </div>
          ) : (
            <div>
              {filtered.map((submission, index) => (
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

                    {/* Status */}
                    <div className="w-28 shrink-0 text-right">
                      <SubmissionStatusBadge status={submission.status} />
                    </div>

                    {/* Actions */}
                    {submission.status === 'pending' && (
                      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (submission.type === 'vacation') {
                              setApprovingId(submission.id);
                              setExpandedId(submission.id);
                              setDeductVacation(true);
                            } else {
                              handleReview(submission.id, 'approved');
                            }
                          }}
                          className="btn-win95 p-1"
                          title="Akceptuj"
                          style={{ backgroundColor: '#3a6a3a', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <button
                          onClick={() => { setReviewingId(reviewingId === submission.id ? null : submission.id); setExpandedId(submission.id); }}
                          className="btn-win95 p-1"
                          title="Odrzuć (podaj powód)"
                          style={{ backgroundColor: '#8b1a1a', borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a' }}
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    )}
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
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data</span>
                            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                              {formatDate(submission.created_at)}
                            </span>
                          </div>
                          {/* Type-specific metadata */}
                          {submission.metadata?.division && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Dywizja</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.division}
                              </span>
                            </div>
                          )}
                          {submission.metadata?.category && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Kategoria</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.category === 'frakcja' ? 'Frakcja' : 'Strona'}
                              </span>
                            </div>
                          )}
                          {/* Vacation metadata */}
                          {submission.metadata?.date_from && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Termin</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.date_from} — {submission.metadata.date_to}
                              </span>
                            </div>
                          )}
                          {submission.metadata?.days_count && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Dni</span>
                              <span className="font-[family-name:var(--font-vt323)] text-lg" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.days_count}
                              </span>
                            </div>
                          )}
                          {submission.metadata?.is_special && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Typ urlopu</span>
                              <span className="font-mono text-xs" style={{ color: '#c9a227' }}>SPECJALNY</span>
                            </div>
                          )}
                          {/* Plus exchange metadata */}
                          {submission.metadata?.benefit && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Benefit</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.benefit}
                              </span>
                            </div>
                          )}
                          {submission.metadata?.cost && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Koszt</span>
                              <span className="font-[family-name:var(--font-vt323)] text-lg" style={{ color: '#5588cc' }}>
                                {submission.metadata.cost} PLUSÓW
                              </span>
                            </div>
                          )}
                          {/* Excuse metadata */}
                          {submission.metadata?.week && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Tydzień</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {submission.metadata.week}
                              </span>
                            </div>
                          )}
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
                              style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)' }}
                              dangerouslySetInnerHTML={{ __html: submission.description }}
                            />
                          </div>
                        )}

                        {/* Admin response if already reviewed */}
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

                        {/* Vacation approval panel (deduction choice) */}
                        {approvingId === submission.id && submission.type === 'vacation' && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--mdt-btn-shadow)' }} onClick={(e) => e.stopPropagation()}>
                            <div className="panel-inset p-3 mb-3" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
                              <span className="font-mono text-[10px] block mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
                                OPCJE AKCEPTACJI URLOPU
                              </span>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={deductVacation}
                                  onChange={(e) => setDeductVacation(e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                  Odejmij {submission.metadata?.days_count || 0} dni z puli urlopowej
                                </span>
                              </label>
                              {!deductVacation && (
                                <p className="font-mono text-[10px] mt-1 ml-6" style={{ color: '#c9a227' }}>
                                  Urlop zostanie zaakceptowany bez odejmowania dni z puli.
                                </p>
                              )}
                            </div>
                            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                              Komentarz (opcjonalny)
                            </label>
                            <textarea
                              value={adminResponse}
                              onChange={(e) => setAdminResponse(e.target.value)}
                              placeholder="Opcjonalny komentarz..."
                              rows={2}
                              className="panel-inset w-full px-3 py-2 font-mono text-xs mb-2"
                              style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReview(submission.id, 'approved')}
                                className="btn-win95 font-mono text-xs flex items-center gap-1"
                                style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                              >
                                <Check className="w-3 h-3" />
                                Akceptuj Urlop
                              </button>
                              <button
                                onClick={() => { setApprovingId(null); setDeductVacation(true); setAdminResponse(''); }}
                                className="btn-win95 font-mono text-xs"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Reject form (inline) */}
                        {reviewingId === submission.id && (
                          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--mdt-btn-shadow)' }} onClick={(e) => e.stopPropagation()}>
                            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                              Powód odrzucenia *
                            </label>
                            <textarea
                              value={adminResponse}
                              onChange={(e) => setAdminResponse(e.target.value)}
                              placeholder="Podaj powód odrzucenia zgłoszenia..."
                              rows={2}
                              className="panel-inset w-full px-3 py-2 font-mono text-xs mb-2"
                              style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReview(submission.id, 'rejected')}
                                className="btn-win95 font-mono text-xs"
                                style={{ backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a' }}
                              >
                                Odrzuć
                              </button>
                              <button
                                onClick={() => { setReviewingId(null); setAdminResponse(''); }}
                                className="btn-win95 font-mono text-xs"
                              >
                                Anuluj
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
