'use client';

import { UserMinus } from 'lucide-react';
import type { TrainingGroup, AttendanceRecord } from './hooks/useFtoAttendance';

interface AttendanceTableProps {
  group: TrainingGroup;
  attendance: AttendanceRecord[];
  selectedDate: string;
  saving: boolean;
  isCS: boolean;
  onMarkAttendance: (userId: string, status: 'OB' | 'NB' | 'U') => void;
  onRemoveMember: (userId: string) => void;
}

const STATUS_OPTIONS: { value: 'OB' | 'NB' | 'U'; label: string }[] = [
  { value: 'OB', label: 'OB' },
  { value: 'NB', label: 'NB' },
  { value: 'U', label: 'U' },
];

export default function AttendanceTable({
  group,
  attendance,
  selectedDate,
  saving,
  isCS,
  onMarkAttendance,
  onRemoveMember,
}: AttendanceTableProps) {
  const members = group.members || [];

  if (members.length === 0) {
    return (
      <div className="panel-raised p-6 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
          Brak osób w grupie. {isCS ? 'Dodaj osoby przyciskiem powyżej.' : ''}
        </p>
      </div>
    );
  }

  const getStatus = (userId: string): 'OB' | 'NB' | 'U' | null => {
    const record = attendance.find((a) => a.user_id === userId);
    return record?.status || null;
  };

  const getLastAttendance = (userId: string): string | null => {
    const record = attendance.find((a) => a.user_id === userId);
    if (!record) return null;
    const date = new Date(record.date + 'T00:00:00');
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--mdt-muted-text)' }}>
              {STATUS_OPTIONS.map((opt) => (
                <th
                  key={opt.value}
                  className="px-3 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-center w-14"
                  style={{ color: 'var(--mdt-content-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
                >
                  {opt.label}
                </th>
              ))}
              <th
                className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-left"
                style={{ color: 'var(--mdt-content-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
              >
                Użytkownik
              </th>
              <th
                className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-left"
                style={{ color: 'var(--mdt-content-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
              >
                Stopień
              </th>
              <th
                className="px-3 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-center"
                style={{ color: 'var(--mdt-content-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
              >
                +/-
              </th>
              <th
                className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-left"
                style={{ color: 'var(--mdt-content-text)' }}
              >
                OSTATNIO
              </th>
              {isCS && (
                <th className="px-2 py-2 w-10" />
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const currentStatus = getStatus(member.user_id);
              const userName = member.user?.mta_nick || member.user?.username || '—';

              return (
                <tr
                  key={member.user_id}
                  style={{ borderBottom: '1px solid var(--mdt-muted-text)' }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <td
                      key={opt.value}
                      className="px-3 py-2 text-center"
                      style={{ borderRight: '1px solid var(--mdt-muted-text)' }}
                    >
                      <button
                        onClick={() => onMarkAttendance(member.user_id, opt.value)}
                        disabled={saving}
                        className="w-6 h-6 flex items-center justify-center border-2"
                        style={{
                          backgroundColor: currentStatus === opt.value ? 'var(--mdt-content-text)' : 'var(--mdt-input-bg)',
                          borderColor: 'var(--mdt-content-text)',
                          cursor: saving ? 'wait' : 'pointer',
                        }}
                        title={opt.label}
                      >
                        {currentStatus === opt.value && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M2 7L5.5 10.5L12 3.5"
                              stroke="var(--mdt-btn-face)"
                              strokeWidth="2.5"
                              strokeLinecap="square"
                            />
                          </svg>
                        )}
                      </button>
                    </td>
                  ))}
                  <td
                    className="px-4 py-2 font-mono text-sm"
                    style={{ color: 'var(--mdt-content-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
                  >
                    {userName}
                  </td>
                  <td
                    className="px-4 py-2 font-mono text-xs"
                    style={{ color: 'var(--mdt-muted-text)', borderRight: '1px solid var(--mdt-muted-text)' }}
                  >
                    {(member.user as any)?.badge || 'Trainee'}
                  </td>
                  <td
                    className="px-3 py-2 text-center"
                    style={{ borderRight: '1px solid var(--mdt-muted-text)' }}
                  >
                    <div className="font-mono text-xs leading-tight">
                      <span style={{ color: '#4ade80' }}>{(member.user as any)?.plus_count || 0}+</span>
                      <br />
                      <span style={{ color: '#f87171' }}>-{(member.user as any)?.minus_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                    {getLastAttendance(member.user_id) || formatDate(selectedDate)}
                  </td>
                  {isCS && (
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => onRemoveMember(member.user_id)}
                        className="text-red-400 hover:text-red-300"
                        title="Usuń z grupy"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
