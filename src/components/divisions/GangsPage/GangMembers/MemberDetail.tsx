'use client';

import { Edit3, Trash2, FileText, FilePlus, Printer } from 'lucide-react';
import { getSkinUrl } from './skinData';
import type { GangMember, GangMemberReport } from './hooks/useGangMembers';

interface MemberDetailProps {
  member: GangMember;
  isCS: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onNewReport: () => void;
  onViewReport: (report: GangMemberReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export default function MemberDetail({
  member,
  isCS,
  onEdit,
  onDelete,
  onNewReport,
  onViewReport,
  onDeleteReport,
}: MemberDetailProps) {
  const reports = member.reports || [];

  return (
    <div className="flex flex-1 flex-col overflow-hidden" style={{ backgroundColor: 'var(--mdt-content)' }}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#059669' }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-white uppercase">
          {member.last_name}, {member.first_name}
          {member.alias && <span className="opacity-80"> &quot;{member.alias}&quot;</span>}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={onEdit} className="btn-win95 text-xs py-0 px-2">
            <Edit3 className="w-3 h-3 inline mr-1" />EDYTUJ
          </button>
          {isCS && (
            <button
              onClick={onDelete}
              className="btn-win95 text-xs py-0 px-2"
              style={{ backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#a33 #511 #511 #a33' }}
            >
              <Trash2 className="w-3 h-3 inline mr-1" />USUŃ
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex gap-0">
          {/* Left: Mugshot + Personal Info */}
          <div className="w-64 flex-shrink-0 p-4" style={{ borderRight: '2px solid var(--mdt-muted-text)' }}>
            {/* Mugshot */}
            <div className="flex justify-center mb-4">
              <div
                className="relative w-40 h-52 flex items-center justify-center"
                style={{ backgroundColor: '#2a2a2a', border: '3px solid #1a1a1a' }}
              >
                {member.skin_id != null ? (
                  <img src={getSkinUrl(member.skin_id)} alt="Mugshot" className="w-full h-auto object-cover object-top" />
                ) : (
                  <span className="font-mono text-[10px]" style={{ color: '#888' }}>BRAK ZDJĘCIA</span>
                )}
                {/* Height ruler */}
                <div className="absolute top-0 right-0 w-3 h-full" style={{
                  background: 'repeating-linear-gradient(to bottom, transparent, transparent 9px, #555 9px, #555 10px)',
                }} />
              </div>
            </div>

            {/* Status badge */}
            <div className="text-center mb-4">
              <span
                className="font-[family-name:var(--font-vt323)] text-sm tracking-widest px-3 py-0.5"
                style={{
                  backgroundColor: member.status === 'DECEASED' ? '#8b1a1a' : member.status === 'INCARCERATED' ? '#854d0e' : member.status === 'INACTIVE' ? '#555' : '#1a5a1a',
                  color: '#fff',
                }}
              >
                {member.status}
              </span>
            </div>

            {/* Personal info */}
            <div className="space-y-1">
              {[
                ['GANG', member.gang?.title || '—'],
                ['KSYWKA', member.alias ? `"${member.alias}"` : '—'],
                ['DATA UR.', member.dob || '—'],
                ['PŁEĆ', member.gender === 'M' ? 'Mężczyzna' : member.gender === 'K' ? 'Kobieta' : member.gender || '—'],
                ['RASA', member.race || '—'],
                ['WZROST', member.height || '—'],
                ['WAGA', member.weight || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex border-b py-0.5" style={{ borderColor: 'var(--mdt-muted-text)' }}>
                  <span className="w-20 shrink-0 font-mono text-[10px] font-bold" style={{ color: 'var(--mdt-muted-text)' }}>{label}:</span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {member.description && (
              <div className="mt-3">
                <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--mdt-muted-text)' }}>OPIS:</span>
                <p className="font-mono text-[10px] mt-1 whitespace-pre-wrap break-words" style={{ color: 'var(--mdt-content-text)' }}>
                  {member.description}
                </p>
              </div>
            )}
          </div>

          {/* Right: Reports */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Reports header */}
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '2px solid var(--mdt-muted-text)' }}>
              <span className="font-[family-name:var(--font-vt323)] text-sm tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
                RAPORTY ({reports.length})
              </span>
              <button
                onClick={onNewReport}
                className="btn-win95 text-xs py-0 px-2"
                style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
              >
                <FilePlus className="w-3 h-3 inline mr-1" />NOWY RAPORT
              </button>
            </div>

            {/* Reports list */}
            <div className="flex-1 overflow-auto p-3 space-y-2">
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-8 h-8 mb-2" style={{ color: 'var(--mdt-muted-text)' }} />
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                    Brak raportów. Kliknij &quot;NOWY RAPORT&quot; aby utworzyć.
                  </span>
                </div>
              ) : (
                reports
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((report) => (
                    <div
                      key={report.id}
                      className="panel-inset p-3 cursor-pointer hover:brightness-110"
                      style={{ backgroundColor: 'var(--mdt-panel-content)' }}
                      onClick={() => onViewReport(report)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-[family-name:var(--font-vt323)] text-xs tracking-widest px-1.5 py-0.5"
                            style={{
                              backgroundColor: report.report_type === 'autopsy' ? '#8b1a1a' : '#1a4a6a',
                              color: '#fff',
                            }}
                          >
                            {report.report_type === 'autopsy' ? 'AUTOPSJA' : 'ŚLEDCZY'}
                          </span>
                          {report.result_status && (
                            <span
                              className="font-mono text-[10px] font-bold"
                              style={{
                                color: report.result_status === 'DEAD' ? '#c41e1e' : report.result_status === 'ARRESTED' ? '#f59e0b' : '#4ade80',
                              }}
                            >
                              {report.result_status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); onViewReport(report); }}
                            className="text-blue-400 hover:text-blue-300"
                            title="Podgląd / Drukuj"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {isCS && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); }}
                              className="text-red-400 hover:text-red-300"
                              title="Usuń raport"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-1.5">
                        <p className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                          {report.date && <span>{report.date} — </span>}
                          {report.location || 'Brak lokalizacji'}
                        </p>
                        {report.description && (
                          <p className="font-mono text-[10px] mt-1 line-clamp-2" style={{ color: 'var(--mdt-muted-text)' }}>
                            {report.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-1 font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        Podpis: {report.signed_by} | {new Date(report.created_at).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
