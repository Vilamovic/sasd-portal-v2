'use client';

import { X, Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import type { ExamSlot, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

interface SlotDetailModalProps {
  slot: ExamSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (slotId: string) => void;
  onCancel: (slotId: string) => void;
  currentUserId: string;
  userRole: string | null;
  userPermissions: string[];
}

const STATUS_MAP: Record<string, string> = {
  available: 'Dostępny',
  booked: 'Zarezerwowany',
  completed: 'Zakończony',
  cancelled: 'Anulowany',
};

// Map exam types to required permission names
const EXAM_PERMISSION_MAP: Record<string, string> = {
  poscigowy: 'Pościgowe',
  swat: 'SWAT',
  seu: 'SEU',
};

const CS_ROLES = ['cs', 'hcs', 'dev'];

function getEligibilityReason(
  slot: ExamSlot,
  currentUserId: string,
  userRole: string | null,
  userPermissions: string[]
): string | null {
  // CS/HCS/DEV bypass all restrictions
  if (userRole && CS_ROLES.includes(userRole)) {
    return null;
  }

  // Self-booking check: creator cannot book own slot
  if (slot.created_by === currentUserId) {
    return 'Nie możesz zapisać się na egzamin, który sam utworzyłeś.';
  }

  const examType = slot.exam_type as PracticalExamType;

  // Trainee exam: only trainee rank
  if (examType === 'trainee') {
    if (userRole !== 'trainee') {
      return 'Egzamin Trainee jest przeznaczony wyłącznie dla osób ze stopniem Trainee.';
    }
  }

  // Permission exams: only for users WITHOUT that permission
  const requiredPermission = EXAM_PERMISSION_MAP[examType];
  if (requiredPermission && userPermissions.includes(requiredPermission)) {
    return `Posiadasz już uprawnienie ${requiredPermission}. Ten egzamin jest dla osób bez tego uprawnienia.`;
  }

  return null;
}

export default function SlotDetailModal({
  slot,
  isOpen,
  onClose,
  onBook,
  onCancel,
  currentUserId,
  userRole,
  userPermissions,
}: SlotDetailModalProps) {
  if (!isOpen || !slot) return null;

  const examType = PRACTICAL_EXAM_TYPES[slot.exam_type];
  const isBookedByMe = slot.booked_by === currentUserId;
  const isAvailable = slot.status === 'available';
  const isBooked = slot.status === 'booked';

  const eligibilityReason = isAvailable
    ? getEligibilityReason(slot, currentUserId, userRole, userPermissions)
    : null;
  const canBook = isAvailable && !eligibilityReason;

  const formattedDate = new Date(slot.slot_date).toLocaleDateString('pl-PL', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = slot.time_start.slice(0, 5) + ' — ' + slot.time_end.slice(0, 5);

  const bookerName = slot.booker
    ? slot.booker.mta_nick || slot.booker.username
    : null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="panel-raised flex w-[480px] max-w-[95vw] flex-col"
        style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ backgroundColor: 'var(--mdt-header)' }}
        >
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            Szczegóły terminu
          </span>
          <button
            className="flex h-5 w-5 items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: '#c41e1e',
              color: '#fff',
              border: '1px solid #555',
            }}
            onClick={onClose}
            aria-label="Zamknij"
          >
            <X size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4" style={{ color: 'var(--mdt-content-text)' }}>
          {/* Exam type badge */}
          <div className="flex items-center gap-2">
            <span
              className="font-[family-name:var(--font-vt323)] text-lg px-3 py-1 tracking-wide uppercase"
              style={{
                backgroundColor: examType.color,
                color: '#fff',
                border: '1px solid rgba(0,0,0,0.3)',
              }}
            >
              {examType.label}
            </span>
          </div>

          {/* Details */}
          <div className="panel-inset p-3 space-y-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            {/* Date */}
            <div className="flex items-center gap-3 font-mono text-sm">
              <Calendar size={16} style={{ color: 'var(--mdt-muted-text)', flexShrink: 0 }} />
              <span className="capitalize">{formattedDate}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-3 font-mono text-sm">
              <Clock size={16} style={{ color: 'var(--mdt-muted-text)', flexShrink: 0 }} />
              <span>{formattedTime}</span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 font-mono text-sm">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    slot.status === 'available'
                      ? '#3a6a3a'
                      : slot.status === 'booked'
                        ? '#c9a227'
                        : slot.status === 'completed'
                          ? '#60a5fa'
                          : '#8b1a1a',
                  flexShrink: 0,
                }}
              />
              <span>
                Status: <strong>{STATUS_MAP[slot.status] || slot.status}</strong>
              </span>
            </div>

            {/* Booked by */}
            {isBooked && bookerName && (
              <div className="flex items-center gap-3 font-mono text-sm">
                <User size={16} style={{ color: 'var(--mdt-muted-text)', flexShrink: 0 }} />
                <span>
                  Zarezerwowany przez: <strong>{bookerName}</strong>
                  {isBookedByMe && (
                    <span style={{ color: '#c9a227' }}> (Ty)</span>
                  )}
                </span>
              </div>
            )}

            {/* Examiner (slot creator) */}
            {slot.creator && (
              <div className="flex items-center gap-3 font-mono text-sm">
                <User size={16} style={{ color: 'var(--mdt-muted-text)', flexShrink: 0 }} />
                <span>
                  Egzaminator: <strong>{slot.creator.mta_nick || slot.creator.username}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Eligibility warning */}
          {eligibilityReason && (
            <div
              className="panel-inset flex items-start gap-2 p-3 font-mono text-xs"
              style={{ backgroundColor: 'rgba(139, 26, 26, 0.15)', color: '#ff6b6b' }}
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{eligibilityReason}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            {canBook && (
              <button
                className="btn-win95 px-5 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase"
                style={{ backgroundColor: '#3a6a3a' }}
                onClick={() => onBook(slot.id)}
              >
                Zarezerwuj
              </button>
            )}

            {isBooked && isBookedByMe && (
              <button
                className="btn-win95 px-5 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase"
                style={{ backgroundColor: '#8b1a1a' }}
                onClick={() => onCancel(slot.id)}
              >
                Anuluj rezerwację
              </button>
            )}

            <button
              className="btn-win95 px-5 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase"
              style={{
                backgroundColor: 'var(--mdt-btn-face)',
                color: 'var(--mdt-content-text)',
              }}
              onClick={onClose}
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
