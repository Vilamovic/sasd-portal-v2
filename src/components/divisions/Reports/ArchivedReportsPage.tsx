'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft as ChevronLeftIcon, User, Clock, MapPin, Users } from 'lucide-react';
import { getDivisionReports } from '@/src/lib/db/reports';
import { getAllUsersWithDetails } from '@/src/lib/db/users';
import { getReportConfig, getReportTypeDefinition } from './reportConfig';

const PER_PAGE = 30;

const divisionColors: Record<string, string> = {
  DTU: '#60a5fa',
  GU: '#10b981',
  SWAT: '#c41e1e',
  SS: '#ff8c00',
};

interface ArchivedReportsPageProps {
  divisionId: string;
}

export default function ArchivedReportsPage({ divisionId }: ArchivedReportsPageProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'author'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const config = getReportConfig(divisionId);
  const color = divisionColors[divisionId] || '#3a6a3a';

  useEffect(() => {
    loadData();
  }, [divisionId]);

  const loadData = async () => {
    const [reportsRes, usersRes] = await Promise.all([
      getDivisionReports(divisionId, { status: 'archived' }),
      getAllUsersWithDetails(),
    ]);
    setReports(reportsRes.data || []);
    setAllUsers(usersRes.data || []);
    setLoading(false);
  };

  const getAuthorName = (report: any) => {
    return report.author?.mta_nick || report.author?.username || 'Nieznany';
  };

  const getParticipantNames = (participants: string[]) => {
    return participants.map((pid) => {
      const u = allUsers.find((u: any) => u.id === pid);
      return u ? (u.mta_nick || u.username) : 'Nieznany';
    });
  };

  // Filters
  const filtered = reports.filter((r) => {
    if (filterType && r.report_type !== filterType) return false;
    if (filterAuthor) {
      const authorName = getAuthorName(r).toLowerCase();
      if (!authorName.includes(filterAuthor.toLowerCase())) return false;
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'type': {
        const aType = getReportTypeDefinition(divisionId, a.report_type)?.label || a.report_type;
        const bType = getReportTypeDefinition(divisionId, b.report_type)?.label || b.report_type;
        comparison = aType.localeCompare(bType);
        break;
      }
      case 'author':
        comparison = getAuthorName(a).localeCompare(getAuthorName(b));
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

  const handleSortChange = (field: 'date' | 'type' | 'author') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      {/* Page Header */}
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
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
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
          onChange={(e) => { setFilterAuthor(e.target.value); setCurrentPage(1); }}
          placeholder="Filtruj po autorze..."
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
          onClick={() => handleSortChange('author')}
          className={`btn-win95 font-mono text-xs ${sortBy === 'author' ? 'btn-win95-active' : ''}`}
        >
          Autor {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Reports List */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
            ZARCHIWIZOWANE ({filtered.length}){totalPages > 1 && ` — STRONA ${currentPage}/${totalPages}`}
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
                  {/* Report Row */}
                  <div
                    className="px-4 py-3 flex items-center gap-3 cursor-pointer"
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                    onClick={() => toggleExpand(report.id)}
                  >
                    {/* Expand icon */}
                    <div className="w-4 shrink-0">
                      {expandedId === report.id ? (
                        <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                      ) : (
                        <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                      )}
                    </div>

                    {/* Author */}
                    <div className="w-32 shrink-0">
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                        {authorName}
                      </span>
                    </div>

                    {/* Type */}
                    <div className="w-44 shrink-0">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        {typeDef?.icon} {typeDef?.label || report.report_type}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs truncate block" style={{ color: 'var(--mdt-content-text)' }}>
                        {report.form_data?.location || '—'}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="w-32 shrink-0 text-right">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedId === report.id && (
                    <div className="border-l-4 ml-4" style={{ borderColor: color, backgroundColor: 'var(--mdt-input-bg)' }}>
                      <div className="px-4 py-3">
                        {/* Meta */}
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

                        {/* Location */}
                        {report.form_data?.location && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Lokalizacja</span>
                            <span className="font-mono text-xs flex items-center gap-1" style={{ color: 'var(--mdt-content-text)' }}>
                              <MapPin className="w-3 h-3 inline" />
                              {report.form_data.location}
                            </span>
                          </div>
                        )}

                        {/* Event date */}
                        {report.form_data?.date && (
                          <div className="mb-2">
                            <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>Data zdarzenia</span>
                            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                              {report.form_data.date}{report.form_data.time ? `, ${report.form_data.time}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Participants */}
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

                        {/* Dynamic fields */}
                        {typeDef && typeDef.fields.map((field) => {
                          const value = report.form_data?.[field.id];
                          if (!value) return null;
                          // Skip common fields already rendered
                          if (['date', 'time', 'location'].includes(field.id)) return null;

                          const displayValue = field.type === 'select' && field.options
                            ? (field.options.find((o) => o.value === value)?.label || value)
                            : value;

                          return (
                            <div key={field.id} className="mb-2">
                              <span className="font-mono text-[10px] block" style={{ color: 'var(--mdt-muted-text)' }}>
                                {field.label}
                              </span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-win95 p-1"
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeftIcon className="w-4 h-4" />
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
  );
}
