'use client';

import { FileText, Clock, MapPin, User } from 'lucide-react';
import { getReportTypeDefinition } from './reportConfig';

interface ReportCardProps {
  report: {
    id: string;
    division: string;
    report_type: string;
    author_id: string;
    form_data: Record<string, any>;
    created_at: string;
    author?: {
      username: string;
      mta_nick: string | null;
      badge: string | null;
    };
  };
  divisionColor: string;
  onClick: () => void;
}

export default function ReportCard({ report, divisionColor, onClick }: ReportCardProps) {
  const typeDef = getReportTypeDefinition(report.division, report.report_type);
  const authorName = report.author?.mta_nick || report.author?.username || 'Nieznany';
  const date = new Date(report.created_at).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = new Date(report.created_at).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className="panel-raised cursor-pointer hover:opacity-90"
      style={{ backgroundColor: 'var(--mdt-btn-face)' }}
    >
      {/* Color bar */}
      <div className="px-3 py-1 flex items-center gap-2" style={{ backgroundColor: divisionColor }}>
        <FileText className="w-3 h-3 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white truncate">
          {typeDef?.icon} {typeDef?.label || report.report_type}
        </span>
      </div>

      <div className="p-3 space-y-1">
        {/* Author */}
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-content-text)' }}>
            {authorName}
          </span>
          {report.author?.badge && (
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              ({report.author.badge})
            </span>
          )}
        </div>

        {/* Date & Location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              {date} {time}
            </span>
          </div>
          {report.form_data?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
              <span className="font-mono text-xs truncate" style={{ color: 'var(--mdt-muted-text)' }}>
                {report.form_data.location}
              </span>
            </div>
          )}
        </div>

        {/* Preview of description */}
        {report.form_data?.description && (
          <p className="font-mono text-xs line-clamp-2 mt-1" style={{ color: 'var(--mdt-content-text)' }}>
            {report.form_data.description.substring(0, 120)}
            {report.form_data.description.length > 120 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
