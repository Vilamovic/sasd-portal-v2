'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardCheck, Trash2 } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { createExamSlot, getBookedSlots, deleteExamSlot, completeSlot } from '@/src/lib/db/examSlots';
import { createPracticalExamResult } from '@/src/lib/db/practicalExamResults';
import CreateSlotForm from './components/CreateSlotForm';
import ExamResultForm from './components/ExamResultForm';
import type { ExamSlot, PracticalExamType } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

export default function ExamManagementPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookedSlots, setBookedSlots] = useState<ExamSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordingSlot, setRecordingSlot] = useState<ExamSlot | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data } = await getBookedSlots();
    if (data) setBookedSlots(data as ExamSlot[]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSlot = async (data: { exam_type: string; slot_date: string; time_start: string; time_end: string }) => {
    if (!user) return;
    const { error } = await createExamSlot({ ...data, created_by: user.id });
    if (!error) {
      alert('Slot utworzony pomyślnie.');
      loadData();
    } else {
      alert('Błąd tworzenia slotu.');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Usunąć ten slot?')) return;
    const { error } = await deleteExamSlot(slotId);
    if (!error) loadData();
  };

  const handleRecordResult = async (result: {
    slot_id: string;
    exam_type: string;
    examinee_id: string;
    examiner_id: string;
    score: number;
    max_score: number;
    passed: boolean;
    checklist: { item: string; checked: boolean }[];
    notes: string;
  }) => {
    const { error } = await createPracticalExamResult(result);
    if (!error) {
      // Mark slot as completed
      await completeSlot(result.slot_id);
      setRecordingSlot(null);
      alert('Wynik zapisany pomyślnie.');
      loadData();
    } else {
      alert('Błąd zapisywania wyniku.');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      weekday: 'short', day: '2-digit', month: '2-digit',
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/zgloszenia/egzamin')} destination="Kalendarz" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            ZARZĄDZANIE EGZAMINAMI PRAKTYCZNYMI
          </span>
        </div>

        {/* Create slot form */}
        <div className="mb-6">
          <CreateSlotForm onSubmit={handleCreateSlot} />
        </div>

        {/* Result recording form (if active) */}
        {recordingSlot && (
          <div className="mb-6">
            <ExamResultForm
              slot={recordingSlot}
              examinerId={user?.id || ''}
              onSubmit={handleRecordResult}
              onCancel={() => setRecordingSlot(null)}
            />
          </div>
        )}

        {/* Booked slots list */}
        <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              ZAREZERWOWANE EGZAMINY ({bookedSlots.length})
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
            </div>
          ) : bookedSlots.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak zarezerwowanych egzaminów.</p>
            </div>
          ) : (
            <div>
              {bookedSlots.map((slot, index) => {
                const config = PRACTICAL_EXAM_TYPES[slot.exam_type as PracticalExamType];
                return (
                  <div
                    key={slot.id}
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                  >
                    {/* Type badge */}
                    <div className="shrink-0">
                      <span
                        className="px-2 py-0.5 font-mono text-[10px] font-bold text-white"
                        style={{ backgroundColor: config?.color || 'var(--mdt-muted-text)' }}
                      >
                        {config?.label.replace('Egzamin ', '') || slot.exam_type}
                      </span>
                    </div>

                    {/* Date + time */}
                    <div className="w-32 shrink-0">
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                        {formatDate(slot.slot_date)} {slot.time_start.slice(0, 5)}–{slot.time_end.slice(0, 5)}
                      </span>
                    </div>

                    {/* Booker */}
                    <div className="w-32 shrink-0">
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                        Zdający: <strong>{slot.booker?.mta_nick || slot.booker?.username || '—'}</strong>
                      </span>
                    </div>

                    {/* Examiner (creator) */}
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
                        Egz: {slot.creator?.mta_nick || slot.creator?.username || '—'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setRecordingSlot(slot)}
                        className="btn-win95 p-1 flex items-center gap-1 font-mono text-[10px]"
                        style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                        title="Zapisz wynik"
                      >
                        <ClipboardCheck className="w-3 h-3" />
                        WYNIK
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="btn-win95 p-1"
                        style={{ backgroundColor: '#8b1a1a', borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a' }}
                        title="Usuń slot"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
