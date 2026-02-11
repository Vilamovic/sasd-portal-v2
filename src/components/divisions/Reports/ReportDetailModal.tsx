'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, Trash2, User, Clock, MapPin, Users } from 'lucide-react';
import { getReportTypeDefinition } from './reportConfig';
import { getAllUsersWithDetails } from '@/src/lib/db/users';

interface ReportDetailModalProps {
  report: {
    id: string;
    division: string;
    report_type: string;
    author_id: string;
    participants: string[];
    form_data: Record<string, any>;
    created_at: string;
    updated_at: string;
    author?: {
      username: string;
      mta_nick: string | null;
      badge: string | null;
    };
  };
  divisionColor: string;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ReportDetailModal({
  report,
  divisionColor,
  canEdit,
  canDelete,
  onClose,
  onEdit,
  onDelete,
}: ReportDetailModalProps) {
  const [participantNames, setParticipantNames] = useState<string[]>([]);
  const typeDef = getReportTypeDefinition(report.division, report.report_type);
  const authorName = report.author?.mta_nick || report.author?.username || 'Nieznany';

  useEffect(() => {
    async function loadParticipants() {
      if (report.participants.length === 0) return;
      const { data: allUsers } = await getAllUsersWithDetails();
      if (allUsers) {
        const names = report.participants
          .map((pid: string) => {
            const u = allUsers.find((u: any) => u.id === pid);
            return u ? (u.mta_nick || u.username) : 'Nieznany';
          });
        setParticipantNames(names);
      }
    }
    loadParticipants();
  }, [report.participants]);

  const getFieldLabel = (fieldId: string): string => {
    if (!typeDef) return fieldId;
    const field = typeDef.fields.find((f) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const getSelectLabel = (fieldId: string, value: string): string => {
    if (!typeDef) return value;
    const field = typeDef.fields.find((f) => f.id === fieldId);
    if (field?.options) {
      const opt = field.options.find((o) => o.value === value);
      return opt?.label || value;
    }
    return value;
  };

  const date = new Date(report.created_at).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const time = new Date(report.created_at).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Common fields to skip in dynamic rendering
  const commonFields = ['date', 'time', 'location', 'description'];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="panel-raised w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--mdt-btn-face)' }}
      >
        {/* Header */}
        <div className="px-3 py-1 flex items-center justify-between sticky top-0" style={{ backgroundColor: divisionColor }}>
          <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
            {typeDef?.icon} {typeDef?.label || report.report_type}
          </span>
          <div className="flex items-center gap-1">
            {canEdit && (
              <button onClick={onEdit} className="text-white hover:opacity-70 p-0.5">
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {canDelete && (
              <button onClick={onDelete} className="text-white hover:opacity-70 p-0.5">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="text-white hover:opacity-70 p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Meta info */}
          <div className="panel-inset p-3 space-y-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <div className="flex items-center gap-2">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                  Złożono: {date}, {time}
                </span>
              </div>
            </div>
            {report.form_data?.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                  {report.form_data.location}
                </span>
              </div>
            )}
            {report.form_data?.date && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                  Data zdarzenia: {report.form_data.date}, {report.form_data.time || ''}
                </span>
              </div>
            )}
          </div>

          {/* Participants */}
          {participantNames.length > 0 && (
            <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
                <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-muted-text)' }}>
                  Uczestnicy
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {participantNames.map((name, i) => (
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
          {typeDef && (
            <div className="space-y-2">
              {typeDef.fields.map((field) => {
                const value = report.form_data?.[field.id];
                if (!value) return null;

                const displayValue = field.type === 'select'
                  ? getSelectLabel(field.id, value)
                  : value;

                return (
                  <div key={field.id} className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                    <span className="font-mono text-xs font-bold block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                      {field.label}
                    </span>
                    <span className="font-mono text-xs whitespace-pre-wrap" style={{ color: 'var(--mdt-content-text)' }}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Description */}
          {report.form_data?.description && (
            <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
              <span className="font-mono text-xs font-bold block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                Opis sytuacji
              </span>
              <p className="font-mono text-xs whitespace-pre-wrap" style={{ color: 'var(--mdt-content-text)' }}>
                {report.form_data.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
