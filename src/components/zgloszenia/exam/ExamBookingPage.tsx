'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Settings, History } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getExamSlots, bookExamSlot, cancelBooking } from '@/src/lib/db/examSlots';
import { notifyExamBooking, notifyExamCancellation } from '@/src/lib/webhooks/examBooking';
import WeeklyCalendar from './components/WeeklyCalendar';
import SlotDetailModal from './components/SlotDetailModal';
import SlotClusterPopup from './components/SlotClusterPopup';
import type { ExamSlot, PracticalExamType } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return end;
}

function formatWeekRange(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
  return `${weekStart.toLocaleDateString('pl-PL', opts)} — ${end.toLocaleDateString('pl-PL', opts)}`;
}

export default function ExamBookingPage() {
  const router = useRouter();
  const { user, mtaNick, isCS, role, permissions } = useAuth();
  const [slots, setSlots] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [selectedType, setSelectedType] = useState<PracticalExamType | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ExamSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [clusterSlots, setClusterSlots] = useState<ExamSlot[]>([]);
  const [clusterOpen, setClusterOpen] = useState(false);

  const loadSlots = useCallback(async () => {
    setLoading(true);
    const start = formatDateISO(weekStart);
    const end = formatDateISO(getWeekEnd(weekStart));
    const { data } = await getExamSlots(start, end);
    if (data) setSlots(data as ExamSlot[]);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const navigateWeek = (direction: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setWeekStart(newStart);
  };

  const goToCurrentWeek = () => {
    setWeekStart(getWeekStart(new Date()));
  };

  const handleSlotClick = (slot: ExamSlot) => {
    setClusterOpen(false);
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleClusterClick = (clusterSlots: ExamSlot[]) => {
    setClusterSlots(clusterSlots);
    setClusterOpen(true);
  };

  const handleClusterSelectSlot = (slot: ExamSlot) => {
    setClusterOpen(false);
    setSelectedSlot(slot);
    setModalOpen(true);
  };

  const handleBook = async (slotId: string) => {
    if (!user) return;
    const { error } = await bookExamSlot(slotId, user.id);
    if (!error) {
      // Discord webhook notification
      const slot = slots.find(s => s.id === slotId);
      if (slot) {
        const examConfig = PRACTICAL_EXAM_TYPES[slot.exam_type];
        await notifyExamBooking({
          booker: {
            username: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown',
            mta_nick: mtaNick || null,
          },
          examiner: {
            username: slot.creator?.username || 'Unknown',
            mta_nick: slot.creator?.mta_nick || null,
          },
          examType: examConfig?.label || slot.exam_type,
          date: slot.slot_date,
          timeStart: slot.time_start,
          timeEnd: slot.time_end,
        });
      }
      setModalOpen(false);
      setSelectedSlot(null);
      loadSlots();
    } else {
      alert('Błąd rezerwacji. Slot mógł zostać już zarezerwowany.');
    }
  };

  const handleCancelBooking = async (slotId: string) => {
    if (!user) return;
    // Get slot data before cancelling (booker info will be cleared)
    const slot = slots.find(s => s.id === slotId);
    const { error } = await cancelBooking(slotId);
    if (!error) {
      // Discord webhook notification
      if (slot) {
        const examConfig = PRACTICAL_EXAM_TYPES[slot.exam_type];
        await notifyExamCancellation({
          booker: {
            username: user.user_metadata?.full_name || user.user_metadata?.name || 'Unknown',
            mta_nick: mtaNick || null,
          },
          examiner: {
            username: slot.creator?.username || 'Unknown',
            mta_nick: slot.creator?.mta_nick || null,
          },
          examType: examConfig?.label || slot.exam_type,
          date: slot.slot_date,
          timeStart: slot.time_start,
          timeEnd: slot.time_end,
        });
      }
      setModalOpen(false);
      setSelectedSlot(null);
      loadSlots();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/zgloszenia')} destination="Zgłoszenia" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            EGZAMINY PRAKTYCZNE — KALENDARZ
          </span>
        </div>

        {/* Quick links (CS+ only) */}
        {isCS && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => router.push('/zgloszenia/egzamin/management')}
              className="btn-win95 font-mono text-xs flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              ZARZĄDZANIE
            </button>
            <button
              onClick={() => router.push('/zgloszenia/egzamin/history')}
              className="btn-win95 font-mono text-xs flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              HISTORIA WYNIKÓW
            </button>
          </div>
        )}

        {/* Exam type filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType(null)}
            className={`btn-win95 font-mono text-xs ${!selectedType ? 'btn-win95-active' : ''}`}
          >
            WSZYSTKIE
          </button>
          {(Object.entries(PRACTICAL_EXAM_TYPES) as [PracticalExamType, { label: string; color: string; duration: number }][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`btn-win95 font-mono text-xs ${selectedType === key ? 'btn-win95-active' : ''}`}
              style={selectedType === key ? { backgroundColor: config.color, color: '#fff' } : {}}
            >
              {config.label.replace('Egzamin ', '').toUpperCase()}
            </button>
          ))}
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--mdt-muted-text)', opacity: 0.3, margin: '0 4px' }} />
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={`btn-win95 font-mono text-xs ${showCompleted ? 'btn-win95-active' : ''}`}
            style={showCompleted ? { backgroundColor: '#555', color: '#fff' } : {}}
          >
            {showCompleted ? '✓ ZAKOŃCZONE' : 'ZAKOŃCZONE'}
          </button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigateWeek(-1)} className="btn-win95 p-1">
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--mdt-btn-text)' }} />
          </button>
          <div className="panel-inset px-4 py-1.5 flex-1 text-center" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-lg tracking-wider" style={{ color: 'var(--mdt-content-text)' }}>
              {formatWeekRange(weekStart)}
            </span>
          </div>
          <button onClick={() => navigateWeek(1)} className="btn-win95 p-1">
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--mdt-btn-text)' }} />
          </button>
          <button onClick={goToCurrentWeek} className="btn-win95 font-mono text-xs px-3">
            DZIŚ
          </button>
        </div>

        {/* Calendar */}
        {loading ? (
          <div className="panel-raised p-12 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>
              ŁADOWANIE KALENDARZA_
            </span>
          </div>
        ) : (
          <WeeklyCalendar
            slots={slots}
            currentUserId={user?.id || ''}
            selectedType={selectedType}
            showCompleted={showCompleted}
            onSlotClick={handleSlotClick}
            onClusterClick={handleClusterClick}
            weekStart={weekStart}
          />
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: '#4a9a4a' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>Wolny</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-blue-bar)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>Twoja rezerwacja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: 'var(--mdt-muted-text)' }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>Zajęty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ backgroundColor: '#4a4a4a', opacity: 0.6 }} />
            <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>Zakończony</span>
          </div>
        </div>
      </div>

      {/* Cluster popup (multiple slots) */}
      <SlotClusterPopup
        slots={clusterSlots}
        isOpen={clusterOpen}
        onClose={() => setClusterOpen(false)}
        onSelectSlot={handleClusterSelectSlot}
        currentUserId={user?.id || ''}
      />

      {/* Slot detail modal */}
      <SlotDetailModal
        slot={selectedSlot}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedSlot(null); }}
        onBook={handleBook}
        onCancel={handleCancelBooking}
        currentUserId={user?.id || ''}
        userRole={role}
        userPermissions={permissions}
      />
    </div>
  );
}
