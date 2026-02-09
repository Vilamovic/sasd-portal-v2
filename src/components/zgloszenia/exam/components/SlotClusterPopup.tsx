'use client';

import { useEffect, useRef } from 'react';
import { X, ChevronRight } from 'lucide-react';
import type { ExamSlot, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

interface SlotClusterPopupProps {
  slots: ExamSlot[];
  isOpen: boolean;
  onClose: () => void;
  onSelectSlot: (slot: ExamSlot) => void;
  currentUserId: string;
}

const STATUS_LABELS: Record<string, string> = {
  available: 'Wolny',
  booked: 'Zajęty',
  completed: 'Zakończony',
};

export default function SlotClusterPopup({
  slots,
  isOpen,
  onClose,
  onSelectSlot,
  currentUserId,
}: SlotClusterPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid immediate close from the same click that opened it
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen || slots.length === 0) return null;

  // Compute header info
  const timeStart = slots[0]?.time_start?.slice(0, 5) || '';
  const date = slots[0]?.slot_date || '';
  const formattedDate = date
    ? new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })
    : '';

  // Group by type for header
  const typeCounts = new Map<string, number>();
  slots.forEach((s) => {
    typeCounts.set(s.exam_type, (typeCounts.get(s.exam_type) || 0) + 1);
  });

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        ref={popupRef}
        className="panel-raised flex flex-col w-[420px] max-w-[95vw]"
        style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider text-white uppercase">
            {slots.length} {slots.length === 1 ? 'TERMIN' : 'TERMINÓW'} — {formattedDate}
          </span>
          <button
            className="flex h-5 w-5 items-center justify-center text-xs font-bold"
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
            onClick={onClose}
          >
            <X size={12} />
          </button>
        </div>

        {/* Slot list */}
        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
          {slots.map((slot, idx) => {
            const config = PRACTICAL_EXAM_TYPES[slot.exam_type as PracticalExamType];
            const isMyBooking = slot.booked_by === currentUserId;
            const examinerName = slot.creator?.mta_nick || slot.creator?.username || '—';
            const bookerName = slot.booker?.mta_nick || slot.booker?.username;
            const timeDisplay = `${slot.time_start.slice(0, 5)}-${slot.time_end.slice(0, 5)}`;

            // Status color dot
            let statusColor = '#4a9a4a'; // available = green
            if (slot.status === 'booked' && isMyBooking) statusColor = 'var(--mdt-blue-bar)';
            else if (slot.status === 'booked') statusColor = '#c9a227';
            else if (slot.status === 'completed') statusColor = 'var(--mdt-muted-text)';

            return (
              <div
                key={slot.id}
                className="panel-inset flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors"
                style={{ backgroundColor: 'var(--mdt-input-bg)' }}
                onClick={() => onSelectSlot(slot)}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--mdt-btn-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--mdt-input-bg)';
                }}
              >
                {/* Status dot */}
                <div
                  className="w-2.5 h-2.5 shrink-0"
                  style={{ backgroundColor: statusColor, borderRadius: '1px' }}
                />

                {/* Type badge */}
                <span
                  className="px-1.5 py-0.5 font-mono text-[10px] font-bold text-white shrink-0"
                  style={{ backgroundColor: config?.color || '#888' }}
                >
                  {config?.label.replace('Egzamin ', '') || slot.exam_type}
                </span>

                {/* Time */}
                <span className="font-mono text-xs shrink-0" style={{ color: 'var(--mdt-content-text)' }}>
                  {timeDisplay}
                </span>

                {/* Examiner */}
                <span className="font-mono text-[10px] truncate flex-1 min-w-0" style={{ color: 'var(--mdt-muted-text)' }}>
                  Egz: {examinerName}
                </span>

                {/* Status / booking info */}
                <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--mdt-muted-text)' }}>
                  {slot.status === 'available' && 'Wolny'}
                  {slot.status === 'booked' && isMyBooking && (
                    <span style={{ color: 'var(--mdt-blue-bar)' }}>Twoja</span>
                  )}
                  {slot.status === 'booked' && !isMyBooking && bookerName}
                  {slot.status === 'completed' && 'Zakończony'}
                </span>

                {/* Arrow */}
                <ChevronRight className="w-3 h-3 shrink-0" style={{ color: 'var(--mdt-muted-text)' }} />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 flex justify-end" style={{ borderTop: '1px solid var(--mdt-btn-shadow)' }}>
          <button
            className="btn-win95 px-4 py-1 font-[family-name:var(--font-vt323)] text-xs tracking-wider uppercase"
            style={{ color: 'var(--mdt-content-text)' }}
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
