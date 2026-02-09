'use client';

import { Fragment } from 'react';
import type { ExamSlot, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

interface WeeklyCalendarProps {
  slots: ExamSlot[];
  currentUserId: string;
  selectedType: PracticalExamType | null;
  showCompleted: boolean;
  onSlotClick: (slot: ExamSlot) => void;
  onClusterClick?: (slots: ExamSlot[]) => void;
  onEmptyClick?: (date: string, hour: number) => void;
  weekStart: Date;
}

const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8-22
const HOUR_HEIGHT = 60; // pixels per hour
const START_HOUR = 8;

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

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getSlotTopOffset(timeStart: string): number {
  const startMinutes = timeToMinutes(timeStart);
  const baseMinutes = START_HOUR * 60;
  return ((startMinutes - baseMinutes) / 60) * HOUR_HEIGHT;
}

function getSlotHeight(timeStart: string, timeEnd: string): number {
  const startMinutes = timeToMinutes(timeStart);
  const endMinutes = timeToMinutes(timeEnd);
  return Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 22);
}

// --- Clustering: group overlapping slots ---

interface SlotCluster {
  slots: ExamSlot[];
  startTime: string;  // earliest time_start
  endTime: string;    // latest time_end
}

function clusterOverlappingSlots(daySlots: ExamSlot[]): SlotCluster[] {
  if (daySlots.length === 0) return [];

  // Sort by start time
  const sorted = [...daySlots].sort(
    (a, b) => timeToMinutes(a.time_start) - timeToMinutes(b.time_start)
  );

  const clusters: SlotCluster[] = [];
  let current: SlotCluster = {
    slots: [sorted[0]],
    startTime: sorted[0].time_start,
    endTime: sorted[0].time_end,
  };

  for (let i = 1; i < sorted.length; i++) {
    const slot = sorted[i];
    const slotStart = timeToMinutes(slot.time_start);
    const clusterEnd = timeToMinutes(current.endTime);

    // Overlap: this slot starts before the cluster ends
    if (slotStart < clusterEnd) {
      current.slots.push(slot);
      // Extend cluster end if this slot goes further
      if (timeToMinutes(slot.time_end) > clusterEnd) {
        current.endTime = slot.time_end;
      }
    } else {
      // No overlap → save current, start new cluster
      clusters.push(current);
      current = {
        slots: [slot],
        startTime: slot.time_start,
        endTime: slot.time_end,
      };
    }
  }
  clusters.push(current);

  return clusters;
}

// --- Main component ---

export default function WeeklyCalendar({
  slots,
  currentUserId,
  selectedType,
  showCompleted,
  onSlotClick,
  onClusterClick,
  onEmptyClick,
  weekStart,
}: WeeklyCalendarProps) {
  const weekDays = getWeekDays(weekStart);
  const dateStrings = weekDays.map(toDateString);

  let filteredSlots = selectedType
    ? slots.filter((s) => s.exam_type === selectedType)
    : slots;

  // Filter out completed if not showing them
  if (!showCompleted) {
    filteredSlots = filteredSlots.filter((s) => s.status !== 'completed');
  }

  // Group slots by day, then cluster
  const clustersByDay = new Map<string, SlotCluster[]>();
  for (const dateStr of dateStrings) {
    const daySlots = filteredSlots.filter((s) => s.slot_date === dateStr);
    clustersByDay.set(dateStr, clusterOverlappingSlots(daySlots));
  }

  // Slot visual style - colored backgrounds ensure white text is always readable
  function getSlotColors(slot: ExamSlot) {
    const typeColor = PRACTICAL_EXAM_TYPES[slot.exam_type]?.color || '#888';
    if (slot.status === 'completed') {
      return { border: '#666', bg: '#4a4a4a', text: '#bbb', sub: '#999', opacity: 0.6 };
    }
    if (slot.status === 'booked' && slot.booked_by === currentUserId) {
      return { border: typeColor, bg: '#1e3a5c', text: '#fff', sub: '#aaccee', opacity: 1 };
    }
    if (slot.status === 'booked') {
      return { border: typeColor, bg: '#3a3a3a', text: '#ddd', sub: '#aaa', opacity: 0.85 };
    }
    // available
    return { border: typeColor, bg: '#1a3a1a', text: '#fff', sub: '#88cc88', opacity: 1 };
  }

  // Cluster summary style
  function getClusterColor(cluster: SlotCluster) {
    const availableSlot = cluster.slots.find((s) => s.status === 'available');
    const primarySlot = availableSlot || cluster.slots[0];
    const typeColor = PRACTICAL_EXAM_TYPES[primarySlot.exam_type]?.color || '#888';
    const hasMyBooking = cluster.slots.some((s) => s.booked_by === currentUserId);
    return {
      border: hasMyBooking ? 'var(--mdt-blue-bar)' : typeColor,
      bg: hasMyBooking ? '#1e3a5c' : '#1a3a1a',
      text: '#fff',
      sub: '#bbddbb',
    };
  }

  const isToday = (dateStr: string): boolean => {
    return toDateString(new Date()) === dateStr;
  };

  return (
    <div className="panel-raised p-1">
      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: '56px repeat(7, 1fr)',
          gridTemplateRows: `auto repeat(${HOURS.length}, ${HOUR_HEIGHT}px)`,
          gap: '1px',
          backgroundColor: 'var(--mdt-btn-shadow)',
        }}
      >
        {/* Top-left corner */}
        <div
          className="font-[family-name:var(--font-vt323)] text-xs flex items-center justify-center"
          style={{ backgroundColor: 'var(--mdt-header)', color: 'var(--mdt-header-text)', padding: '6px 2px' }}
        >
          Godz.
        </div>

        {/* Day headers */}
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
        {HOURS.map((hour, hourIndex) => (
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

            {/* Day cells */}
            {dateStrings.map((dateStr) => {
              const key = `${dateStr}_${hour}`;
              const isFirstRow = hourIndex === 0;
              const clusters = clustersByDay.get(dateStr) || [];

              return (
                <div
                  key={key}
                  className="relative cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isToday(dateStr) ? 'var(--mdt-panel-alt)' : 'var(--mdt-content)',
                  }}
                  onClick={() => onEmptyClick?.(dateStr, hour)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--mdt-btn-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor =
                      isToday(dateStr) ? 'var(--mdt-panel-alt)' : 'var(--mdt-content)';
                  }}
                >
                  {/* Render clusters in first row only (absolute positioned) */}
                  {isFirstRow && clusters.map((cluster, clusterIdx) => {
                    const topOffset = getSlotTopOffset(cluster.startTime);
                    const height = getSlotHeight(cluster.startTime, cluster.endTime);

                    // Single slot → render normally
                    if (cluster.slots.length === 1) {
                      const slot = cluster.slots[0];
                      const colors = getSlotColors(slot);
                      const typeInfo = PRACTICAL_EXAM_TYPES[slot.exam_type];
                      const abbr = EXAM_ABBREVIATIONS[slot.exam_type];
                      const timeDisplay = `${slot.time_start.slice(0, 5)}-${slot.time_end.slice(0, 5)}`;
                      const isMyBooking = slot.booked_by === currentUserId;

                      return (
                        <div
                          key={slot.id}
                          className="absolute cursor-pointer overflow-hidden"
                          style={{
                            top: `${topOffset}px`,
                            left: '1px',
                            right: '1px',
                            height: `${height - 1}px`,
                            borderLeft: `3px solid ${colors.border}`,
                            backgroundColor: colors.bg,
                            opacity: colors.opacity,
                            zIndex: 10,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
                          }}
                          onClick={(e) => { e.stopPropagation(); onSlotClick(slot); }}
                          title={`${typeInfo.label} | ${timeDisplay} | ${slot.status}`}
                        >
                          <div className="px-1.5 py-0.5 h-full flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-[family-name:var(--font-vt323)] text-xs font-bold whitespace-nowrap" style={{ color: typeInfo.color }}>
                                {abbr}
                              </span>
                              <span className="font-mono text-[10px] whitespace-nowrap" style={{ color: colors.text }}>
                                {timeDisplay}
                              </span>
                            </div>
                            {height > 35 && (
                              <>
                                {slot.status === 'booked' && isMyBooking && (
                                  <span className="font-mono text-[9px]" style={{ color: '#5ba8f5' }}>Twoja rezerwacja</span>
                                )}
                                {slot.status === 'booked' && !isMyBooking && slot.booker && (
                                  <span className="font-mono text-[9px] truncate" style={{ color: colors.sub }}>
                                    {slot.booker.mta_nick || slot.booker.username}
                                  </span>
                                )}
                                {slot.status === 'available' && (
                                  <span className="font-mono text-[9px]" style={{ color: '#6fcf6f' }}>Wolny</span>
                                )}
                              </>
                            )}
                            {height > 55 && slot.creator && (
                              <span className="font-mono text-[8px] truncate mt-auto" style={{ color: colors.sub }}>
                                Egz: {slot.creator.mta_nick || slot.creator.username}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Multiple slots → Stash summary block
                    const clusterColors = getClusterColor(cluster);
                    const availableCount = cluster.slots.filter((s) => s.status === 'available').length;
                    const bookedCount = cluster.slots.filter((s) => s.status === 'booked').length;
                    const myBooking = cluster.slots.find((s) => s.booked_by === currentUserId);
                    const timeDisplay = `${cluster.startTime.slice(0, 5)}-${cluster.endTime.slice(0, 5)}`;

                    // Count types
                    const typeAbbrs = new Map<string, number>();
                    cluster.slots.forEach((s) => {
                      const a = EXAM_ABBREVIATIONS[s.exam_type as PracticalExamType] || s.exam_type;
                      typeAbbrs.set(a, (typeAbbrs.get(a) || 0) + 1);
                    });
                    const typeLabel = Array.from(typeAbbrs.entries())
                      .map(([abbr, count]) => count > 1 ? `${count}×${abbr}` : abbr)
                      .join(' ');

                    return (
                      <div
                        key={`cluster-${clusterIdx}`}
                        className="absolute cursor-pointer overflow-hidden"
                        style={{
                          top: `${topOffset}px`,
                          left: '1px',
                          right: '1px',
                          height: `${height - 1}px`,
                          borderLeft: `3px solid ${clusterColors.border}`,
                          backgroundColor: clusterColors.bg,
                          zIndex: 10,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onClusterClick) {
                            onClusterClick(cluster.slots);
                          } else {
                            // Fallback: open first slot
                            onSlotClick(cluster.slots[0]);
                          }
                        }}
                        title={`${cluster.slots.length} terminów | ${timeDisplay}`}
                      >
                        <div className="px-1.5 py-0.5 h-full flex flex-col">
                          {/* Header: type + count */}
                          <div className="flex items-center gap-1">
                            <span className="font-[family-name:var(--font-vt323)] text-xs font-bold whitespace-nowrap" style={{ color: clusterColors.border }}>
                              {typeLabel}
                            </span>
                            <span className="font-mono text-[10px] whitespace-nowrap" style={{ color: clusterColors.text }}>
                              {timeDisplay}
                            </span>
                          </div>

                          {/* Slot count badge */}
                          {height > 30 && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span
                                className="font-[family-name:var(--font-vt323)] text-sm font-bold px-1"
                                style={{ backgroundColor: clusterColors.border, color: '#fff', lineHeight: '1.1' }}
                              >
                                ×{cluster.slots.length}
                              </span>
                              <span className="font-mono text-[9px]" style={{ color: clusterColors.sub }}>
                                terminów
                              </span>
                            </div>
                          )}

                          {/* Status summary */}
                          {height > 50 && (
                            <div className="flex flex-wrap gap-x-2 mt-0.5">
                              {availableCount > 0 && (
                                <span className="font-mono text-[9px]" style={{ color: '#6fcf6f' }}>
                                  {availableCount} wolnych
                                </span>
                              )}
                              {bookedCount > 0 && (
                                <span className="font-mono text-[9px]" style={{ color: clusterColors.sub }}>
                                  {bookedCount} zajętych
                                </span>
                              )}
                            </div>
                          )}

                          {/* My booking indicator */}
                          {height > 65 && myBooking && (
                            <span className="font-mono text-[9px] mt-auto" style={{ color: '#5ba8f5' }}>
                              Masz rezerwację
                            </span>
                          )}

                          {/* "Click to expand" hint on tall blocks */}
                          {height > 80 && (
                            <span className="font-mono text-[8px] mt-auto" style={{ color: clusterColors.sub }}>
                              Kliknij aby rozwinąć ▸
                            </span>
                          )}
                        </div>
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
        <span className="font-[family-name:var(--font-vt323)] text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
          Legenda:
        </span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-input-bg)', borderLeft: '3px solid #4a9a4a' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>Wolny</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-input-bg)', borderLeft: '3px solid var(--mdt-blue-bar)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>Twoja rezerwacja</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-panel-content)', borderLeft: '3px solid var(--mdt-muted-text)', opacity: 0.7 }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>Zajęty</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-surface-light)', borderLeft: '3px solid var(--mdt-muted-text)', opacity: 0.6 }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>Zakończony</span>
        </div>
      </div>
    </div>
  );
}
