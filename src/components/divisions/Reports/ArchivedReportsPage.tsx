'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, User, Clock, MapPin, Users } from 'lucide-react';
import ArchivePagination from '@/src/components/shared/ArchivePagination';
import ArchiveSortButtons from '@/src/components/shared/ArchiveSortButtons';
import { useArchiveList } from '@/src/hooks/useArchiveList';
import { getDivisionReports } from '@/src/lib/db/reports';
import { getAllUsersWithDetails } from '@/src/lib/db/users';
import { getReportConfig, getReportTypeDefinition } from './reportConfig';

type SortField = 'date' | 'type' | 'author';

const SORT_BUTTONS = [
  { field: 'date', label: 'Data' },
  { field: 'type', label: 'Typ' },
  { field: 'author', label: 'Autor' },
];

const divisionColors: Record<string, string> = {
  DTU: '#60a5fa',
  GU: '#059669',
  SWAT: '#c41e1e',
  SS: '#ff8c00',
};

interface ArchivedReportsPageProps {
  divisionId: string;
}

export default function ArchivedReportsPage({ divisionId }: ArchivedReportsPageProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');

  const {
    loading, setLoading,
    sortBy, sortOrder, handleSortChange,
    currentPage, setCurrentPage, resetPage,
    expandedId, toggleExpand,
    formatDate, paginate,
  } = useArchiveList<SortField>('date');

  const config = getReportConfig(divisionId);
  const color = divisionColors[divisionId] || '#3a6a3a';

  useEffect(() => {
    Promise.all([
      getDivisionReports(divisionId, { status: 'archived' }),
      getAllUsersWithDetails(),
    ]).then(([reportsRes, usersRes]) => {
      setReports(reportsRes.data || []);
      setAllUsers(usersRes.data || []);
      setLoading(false);
    });
  }, [divisionId, setLoading]);

  const getAuthorName = (report: any) => report.author?.mta_nick || report.author?.username || 'Nieznany';

  const getParticipantNames = (participants: string[]) =>
    participants.map((pid) => {
      const u = allUsers.find((u: any) => u.id === pid);
      return u ? (u.mta_nick || u.username) : 'Nieznany';
    });

  const sorted = useMemo(() => {
    let result = reports.filter((r) => {
      if (filterType && r.report_type !== filterType) return false;
      if (filterAuthor && !getAuthorName(r).toLowerCase().includes(filterAuthor.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
        case 'type': {
          const aT = getReportTypeDefinition(divisionId, a.report_type)?.label || a.report_type;
          const bT = getReportTypeDefinition(divisionId, b.report_type)?.label || b.report_type;
          cmp = aT.localeCompare(bT); break;
        }
        case 'author': cmp = getAuthorName(a).localeCompare(getAuthorName(b)); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [reports, filterType, filterAuthor, sortBy, sortOrder, divisionId]);

  const { totalPages, paginatedData } = paginate(sorted);

  return (
    <div>
      <div className="px-4 py-2 mb-6" style={{ backgroundColor: color }}>
        <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
          ARCHIWUM RAPORTÓW — {divisionId}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {config && (
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); resetPage(); }}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie typy</option>
            {config.reportTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.icon} {rt.label}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          value={filterAuthor}
          onChange={(e) => { setFilterAuthor(e.target.value); resetPage(); }}
          placeholder="Filtruj po autorze..."
          className="panel-inset px-3 py-1.5 font-mono text-xs"
          style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', width: '200px' }}
        />

        <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
          Wyników: {sorted.length}
        </span>
      </div>

      <ArchiveSortButtons buttons={SORT_BUTTONS} sortBy={sortBy} sortOrder={sortOrder} onSortChange={handleSortChange} />

      {/* Reports List */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
            ZARCHIWIZOWANE ({sorted.length}){totalPages > 1 && ` — STRONA ${currentPage}/${totalPages}`}
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-6 text-center">
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarchiwizowanych raportów.</p>
          </div>
        ) : (
          <div>
            {paginatedData.map((report, index) => {
              const typeDef = getReportTypeDefinition(divisionId, report.report_type);
              const authorName = getAuthorName(report);

              return (
                <div key={report.id}>
                  <div
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                    onClick={() => toggleExpand(report.id)}
                  >
                    <div className="w-4 shrink-0">
                      {expandedId === report.id
                        ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                        : <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />}
                    </div>
                    <div className="w-32 shrink-0">
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>{authorName}</span>
                    </div>
                    <div className="w-44 shrink-0">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        {typeDef?.icon} {typeDef?.label || report.report_type}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-content-text)' }}>
                        {report.form_data?.location || '—'}
                      </span>
                    </div>
                    <div className="w-32 shrink-0 text-right">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>

                  {expandedId === report.id && (
                    <div className="border-l-4 ml-4" style={{ borderColor: color, backgroundColor: 'var(--mdt-input-bg)' }}>
                      <div className="px-4 py-3">
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div>
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Autor</span>
                            <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--mdt-content-text)' }}>
                              <User className="w-3 h-3 inline" />
                              {authorName}
                              {report.author?.badge && (
                                <span style={{ color: 'var(--mdt-muted-text)' }}>({report.author.badge})</span>
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Typ raportu</span>
                            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                              {typeDef?.icon} {typeDef?.label || report.report_type}
                            </span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data złożenia</span>
                            <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--mdt-content-text)' }}>
                              <Clock className="w-3 h-3 inline" />
                              {formatDate(report.created_at)}
                            </span>
                          </div>
                          {report.archived_at && (
                            <div>
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Zarchiwizowano</span>
                              <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                                {formatDate(report.archived_at)}
                              </span>
                            </div>
                          )}
                        </div>

                        {report.form_data?.location && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Lokalizacja</span>
                            <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--mdt-content-text)' }}>
                              <MapPin className="w-3 h-3 inline" />
                              {report.form_data.location}
                            </span>
                          </div>
                        )}

                        {report.form_data?.date && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data zdarzenia</span>
                            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                              {report.form_data.date}{report.form_data.time ? `, ${report.form_data.time}` : ''}
                            </span>
                          </div>
                        )}

                        {report.participants?.length > 0 && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] flex items-center gap-1 mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                              <Users className="w-3 h-3 inline" />
                              Uczestnicy
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {getParticipantNames(report.participants).map((name, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs font-mono"
                                  style={{ backgroundColor: 'var(--mdt-blue-bar)', color: '#fff' }}
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {typeDef && typeDef.fields.map((field) => {
                          const value = report.form_data?.[field.id];
                          if (!value) return null;
                          if (['date', 'time', 'location'].includes(field.id)) return null;

                          const displayValue = field.type === 'select' && field.options
                            ? (field.options.find((o) => o.value === value)?.label || value)
                            : value;

                          return (
                            <div key={field.id} className="mb-2">
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>{field.label}</span>
                              <span className="font-mono text-xs whitespace-pre-wrap" style={{ color: 'var(--mdt-content-text)' }}>
                                {displayValue}
                              </span>
                            </div>
                          );
                        })}
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
  );
}
