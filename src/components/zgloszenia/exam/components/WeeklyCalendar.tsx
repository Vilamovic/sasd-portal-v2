'use client';

import { Fragment } from 'react';
import type { ExamSlot, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

interface WeeklyCalendarProps {
  slots: ExamSlot[];
  currentUserId: string;
  selectedType: PracticalExamType | null;
  onSlotClick: (slot: ExamSlot) => void;
  onEmptyClick?: (date: string, hour: number) => void;
  weekStart: Date;
}

const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22

const EXAM_ABBREVIATIONS: Record<PracticalExamType, string> = {
  trainee: 'TRN',
  poscigowy: 'POC',
  swat: 'SWT',
  seu: 'SEU',
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getSlotHour(timeStart: string): number {
  return parseInt(timeStart.split(':')[0], 10);
}

function getSlotTimeDisplay(timeStart: string, timeEnd: string): string {
  const start = timeStart.slice(0, 5);
  const end = timeEnd.slice(0, 5);
  return `${start}-${end}`;
}

export default function WeeklyCalendar({
  slots,
  currentUserId,
  selectedType,
  onSlotClick,
  onEmptyClick,
  weekStart,
}: WeeklyCalendarProps) {
  const weekDays = getWeekDays(weekStart);
  const dateStrings = weekDays.map(toDateString);

  // Filter slots by selected type if specified
  const filteredSlots = selectedType
    ? slots.filter((s) => s.exam_type === selectedType)
    : slots;

  // Build a lookup map: "YYYY-MM-DD_HH" -> ExamSlot[]
  const slotMap = new Map<string, ExamSlot[]>();
  for (const slot of filteredSlots) {
    const hour = getSlotHour(slot.time_start);
    const key = `${slot.slot_date}_${hour}`;
    const existing = slotMap.get(key);
    if (existing) {
      existing.push(slot);
    } else {
      slotMap.set(key, [slot]);
    }
  }

  function getSlotStyle(slot: ExamSlot): {
    borderLeftColor: string;
    backgroundColor: string;
    color: string;
    opacity: number;
  } {
    if (slot.status === 'completed') {
      return {
        borderLeftColor: 'var(--mdt-muted-text)',
        backgroundColor: 'var(--mdt-surface-light)',
        color: 'var(--mdt-muted-text)',
        opacity: 0.6,
      };
    }
    if (slot.status === 'booked' && slot.booked_by === currentUserId) {
      return {
        borderLeftColor: 'var(--mdt-blue-bar)',
        backgroundColor: 'var(--mdt-input-bg)',
        color: 'var(--mdt-content-text)',
        opacity: 1,
      };
    }
    if (slot.status === 'booked') {
      return {
        borderLeftColor: 'var(--mdt-muted-text)',
        backgroundColor: 'var(--mdt-panel-content)',
        color: 'var(--mdt-muted-text)',
        opacity: 0.7,
      };
    }
    // available
    return {
      borderLeftColor: '#4a9a4a',
      backgroundColor: 'var(--mdt-input-bg)',
      color: 'var(--mdt-content-text)',
      opacity: 1,
    };
  }

  const isToday = (dateStr: string): boolean => {
    const now = new Date();
    return toDateString(now) === dateStr;
  };

  return (
    <div className="panel-raised p-1">
      {/* Grid container */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '56px repeat(7, 1fr)',
          gridTemplateRows: `auto repeat(${HOURS.length}, 1fr)`,
          gap: '1px',
          backgroundColor: 'var(--mdt-btn-shadow)',
          minHeight: '600px',
        }}
      >
        {/* Top-left corner cell */}
        <div
          className="font-[family-name:var(--font-vt323)] text-xs flex items-center justify-center"
          style={{
            backgroundColor: 'var(--mdt-header)',
            color: 'var(--mdt-header-text)',
            padding: '6px 2px',
          }}
        >
          Godz.
        </div>

        {/* Day header cells */}
        {weekDays.map((day, idx) => {
          const dateStr = dateStrings[idx];
          const today = isToday(dateStr);
          return (
            <div
              key={dateStr}
              className="font-[family-name:var(--font-vt323)] text-sm flex flex-col items-center justify-center"
              style={{
                backgroundColor: today ? 'var(--mdt-blue-bar)' : 'var(--mdt-header)',
                color: today ? '#ffffff' : 'var(--mdt-header-text)',
                padding: '6px 4px',
              }}
            >
              <span className="font-bold">{DAY_NAMES[idx]}</span>
              <span className="text-xs opacity-80">{formatDate(day)}</span>
            </div>
          );
        })}

        {/* Hour rows */}
        {HOURS.map((hour) => (
          <Fragment key={`hour-row-${hour}`}>
            {/* Hour label */}
            <div
              className="font-mono text-xs flex items-start justify-center pt-1"
              style={{
                backgroundColor: 'var(--mdt-btn-face)',
                color: 'var(--mdt-muted-text)',
                borderRight: '1px solid var(--mdt-btn-shadow)',
              }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>

            {/* Day cells for this hour */}
            {dateStrings.map((dateStr) => {
              const key = `${dateStr}_${hour}`;
              const cellSlots = slotMap.get(key) || [];

              return (
                <div
                  key={key}
                  className="relative min-h-[44px] cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isToday(dateStr)
                      ? 'var(--mdt-panel-alt)'
                      : 'var(--mdt-content)',
                  }}
                  onClick={() => {
                    if (cellSlots.length === 0 && onEmptyClick) {
                      onEmptyClick(dateStr, hour);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (cellSlots.length === 0) {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        'var(--mdt-btn-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = isToday(dateStr)
                      ? 'var(--mdt-panel-alt)'
                      : 'var(--mdt-content)';
                  }}
                >
                  {cellSlots.map((slot) => {
                    const style = getSlotStyle(slot);
                    const typeInfo = PRACTICAL_EXAM_TYPES[slot.exam_type];
                    const abbr = EXAM_ABBREVIATIONS[slot.exam_type];
                    const timeDisplay = getSlotTimeDisplay(slot.time_start, slot.time_end);

                    return (
                      <div
                        key={slot.id}
                        className="panel-inset mx-0.5 mb-0.5 px-1 py-0.5 cursor-pointer transition-opacity hover:opacity-90"
                        style={{
                          borderLeft: `3px solid ${style.borderLeftColor}`,
                          backgroundColor: style.backgroundColor,
                          color: style.color,
                          opacity: style.opacity,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlotClick(slot);
                        }}
                        title={`${typeInfo.label} | ${timeDisplay} | ${slot.status}${slot.creator ? ` | Egz: ${slot.creator.mta_nick || slot.creator.username}` : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="font-[family-name:var(--font-vt323)] text-xs font-bold"
                            style={{ color: typeInfo.color }}
                          >
                            {abbr}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: style.color }}>
                            {timeDisplay}
                          </span>
                        </div>
                        {slot.status === 'booked' && slot.booked_by === currentUserId && (
                          <div
                            className="font-mono text-[9px]"
                            style={{ color: 'var(--mdt-blue-bar)' }}
                          >
                            Twoja rezerwacja
                          </div>
                        )}
                        {slot.status === 'booked' &&
                          slot.booked_by !== currentUserId &&
                          slot.booker && (
                            <div
                              className="font-mono text-[9px] truncate"
                              style={{ color: 'var(--mdt-muted-text)' }}
                            >
                              {slot.booker.mta_nick || slot.booker.username}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      {/* Legend */}
      <div
        className="flex flex-wrap items-center gap-4 mt-2 px-2 py-1"
        style={{ borderTop: '1px solid var(--mdt-btn-shadow)' }}
      >
        <span
          className="font-[family-name:var(--font-vt323)] text-xs"
          style={{ color: 'var(--mdt-muted-text)' }}
        >
          Legenda:
        </span>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: 'var(--mdt-input-bg)',
              borderLeft: '3px solid #4a9a4a',
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>
            Wolny
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: 'var(--mdt-input-bg)',
              borderLeft: '3px solid var(--mdt-blue-bar)',
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>
            Twoja rezerwacja
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: 'var(--mdt-panel-content)',
              borderLeft: '3px solid var(--mdt-muted-text)',
              opacity: 0.7,
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>
            Zajęty
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3"
            style={{
              backgroundColor: 'var(--mdt-surface-light)',
              borderLeft: '3px solid var(--mdt-muted-text)',
              opacity: 0.6,
            }}
          />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>
            Zakończony
          </span>
        </div>
      </div>
    </div>
  );
}
