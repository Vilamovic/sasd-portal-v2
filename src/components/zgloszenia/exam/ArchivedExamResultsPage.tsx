'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import BackButton from '@/src/components/shared/BackButton';
import ArchivePagination from '@/src/components/shared/ArchivePagination';
import ArchiveSortButtons from '@/src/components/shared/ArchiveSortButtons';
import { useArchiveList } from '@/src/hooks/useArchiveList';
import { getArchivedExamResults } from '@/src/lib/db/practicalExamResults';
import type { PracticalExamResult, PracticalExamType, PracticalExamChecklist, LegacyChecklist, TraineeChecklistData, StageChecklistData } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

type SortField = 'date' | 'type' | 'examinee' | 'examiner' | 'result';

const SORT_BUTTONS = [
  { field: 'date', label: 'Data' },
  { field: 'type', label: 'Typ' },
  { field: 'examinee', label: 'Zdający' },
  { field: 'examiner', label: 'Egzaminator' },
  { field: 'result', label: 'Wynik' },
];

export default function ArchivedExamResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<PracticalExamResult[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const {
    loading, setLoading,
    sortBy, sortOrder, handleSortChange,
    currentPage, setCurrentPage, resetPage,
    expandedId, toggleExpand,
    formatDate, paginate,
  } = useArchiveList<SortField>('date');

  useEffect(() => {
    getArchivedExamResults().then(({ data }) => {
      if (data) setResults(data as PracticalExamResult[]);
      setLoading(false);
    });
  }, [setLoading]);

  const sorted = useMemo(() => {
    let result = results.filter((r) => {
      if (filterType && r.exam_type !== filterType) return false;
      if (filterUser) {
        const name = (r.examinee?.mta_nick || r.examinee?.username || '').toLowerCase();
        if (!name.includes(filterUser.toLowerCase())) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date': cmp = new Date(a.archived_at || a.created_at).getTime() - new Date(b.archived_at || b.created_at).getTime(); break;
        case 'type': {
          const aT = PRACTICAL_EXAM_TYPES[a.exam_type as PracticalExamType]?.label || a.exam_type;
          const bT = PRACTICAL_EXAM_TYPES[b.exam_type as PracticalExamType]?.label || b.exam_type;
          cmp = aT.localeCompare(bT); break;
        }
        case 'examinee': cmp = (a.examinee?.mta_nick || a.examinee?.username || '').localeCompare(b.examinee?.mta_nick || b.examinee?.username || ''); break;
        case 'examiner': cmp = (a.examiner?.mta_nick || a.examiner?.username || '').localeCompare(b.examiner?.mta_nick || b.examiner?.username || ''); break;
        case 'result': cmp = (a.passed ? 1 : 0) - (b.passed ? 1 : 0); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [results, filterType, filterUser, sortBy, sortOrder]);

  const { totalPages, paginatedData } = paginate(sorted);

  const renderChecklist = (checklist: PracticalExamChecklist | LegacyChecklist) => {
    // Trainee checklist
    if (checklist && typeof checklist === 'object' && 'type' in checklist && checklist.type === 'trainee') {
      const tc = checklist as TraineeChecklistData;
      return (
        <div className="mb-3">
          <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Checklist</span>
          <div className="panel-inset p-2 space-y-2" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
            {tc.sections.map((section, sIdx) => {
              const sectionScore = section.items.reduce((sum, i) => sum + (i.score ?? 0), 0);
              const sectionMax = section.items.reduce((sum, i) => sum + i.maxPoints, 0);
              return (
                <div key={sIdx}>
                  <div className="flex justify-between font-mono text-[10px] font-bold mb-0.5" style={{ color: 'var(--mdt-muted-text)' }}>
                    <span>{section.name}</span>
                    <span>{sectionScore}/{sectionMax}</span>
                  </div>
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-2 py-0.5 ml-2">
                      <span
                        className="font-mono text-[10px] w-8 text-center shrink-0"
                        style={{ color: item.score === item.maxPoints ? '#3a6a3a' : item.score === 0 ? '#8b1a1a' : 'var(--mdt-content-text)' }}
                      >
                        {item.score}/{item.maxPoints}
                      </span>
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              );
            })}
            {tc.bonusPoints !== 0 && (
              <div className="pt-1" style={{ borderTop: '1px solid var(--mdt-muted-text)' }}>
                <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                  {tc.bonusPoints > 0 ? 'Bonus' : 'Kara'}: {tc.bonusPoints > 0 ? '+' : ''}{tc.bonusPoints}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Stage-based checklist (SEU / Pościgowy)
    if (checklist && typeof checklist === 'object' && 'type' in checklist && (checklist.type === 'seu' || checklist.type === 'poscigowy')) {
      const sc = checklist as StageChecklistData;
      return (
        <div className="mb-3">
          <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Etapy</span>
          <div className="panel-inset p-2 space-y-1" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
            {sc.stages.map((stage, idx) => (
              <div key={idx}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: stage.passed ? '#3a6a3a' : '#8b1a1a' }}>
                    {stage.passed ? '✓' : '✗'}
                  </span>
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-content-text)' }}>{stage.name}</span>
                </div>
                {stage.notes && (
                  <div className="ml-6 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>{stage.notes}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // SWAT — no checklist
    if (checklist && typeof checklist === 'object' && 'type' in checklist && checklist.type === 'swat') return null;

    // Legacy format
    if (Array.isArray(checklist) && checklist.length > 0) {
      return (
        <div className="mb-3">
          <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Checklist</span>
          <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-panel-content)' }}>
            {checklist.map((item: { item: string; checked: boolean }, idx: number) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <span className="font-mono text-xs" style={{ color: item.checked ? '#3a6a3a' : '#8b1a1a' }}>
                  {item.checked ? '✓' : '✗'}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/exams/practical/management')} destination="Zarządzanie" />

        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ARCHIWUM WYNIKÓW EGZAMINÓW
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
            {(Object.entries(PRACTICAL_EXAM_TYPES) as [PracticalExamType, { label: string }][]).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={filterUser}
            onChange={(e) => { setFilterUser(e.target.value); resetPage(); }}
            placeholder="Filtruj po zdającym..."
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', width: '200px' }}
          />

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {sorted.length}
          </span>
        </div>

        <ArchiveSortButtons buttons={SORT_BUTTONS} sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />

        {/* Results List */}
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
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarchiwizowanych wyników.</p>
            </div>
          ) : (
            <div>
              {paginatedData.map((result, index) => {
                const examConfig = PRACTICAL_EXAM_TYPES[result.exam_type as PracticalExamType];
                return (
                  <div key={result.id}>
                    <div
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                      style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                      onClick={() => toggleExpand(result.id)}
                    >
                      <div className="w-4 shrink-0">
                        {expandedId === result.id
                          ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                          : <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />}
                      </div>
                      <div className="w-28 shrink-0">
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {result.examinee?.mta_nick || result.examinee?.username || '—'}
                        </span>
                      </div>
                      <div className="w-36 shrink-0">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {examConfig?.label || result.exam_type}
                        </span>
                      </div>
                      <div className="w-20 shrink-0">
                        {result.max_score > 0 ? (
                          <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>{result.score}/{result.max_score}</span>
                        ) : (
                          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>—</span>
                        )}
                      </div>
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
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-muted-text)' }}>
                          Egz: {result.examiner?.mta_nick || result.examiner?.username || '—'}
                        </span>
                      </div>
                      <div className="w-28 shrink-0 text-right">
                        <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                          {result.archived_at ? formatDate(result.archived_at) : formatDate(result.created_at)}
                        </span>
                      </div>
                    </div>

                    {expandedId === result.id && (
                      <div className="border-l-4 ml-4" style={{ borderColor: 'var(--mdt-blue-bar)', backgroundColor: 'var(--mdt-input-bg)' }}>
                        <div className="px-4 py-3">
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
                                {result.max_score > 0 ? `${result.score}/${result.max_score} ` : ''}{result.passed ? 'ZDANY' : 'NIEZDANY'}
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

                          {result.checklist && renderChecklist(result.checklist)}

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

        <ArchivePagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>
  );
}
