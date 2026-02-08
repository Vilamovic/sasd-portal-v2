'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

// Generate time options every 15 minutes (08:00 - 22:00)
const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 22; h++) {
  for (let m = 0; m < 60; m += 15) {
    if (h === 22 && m > 0) break;
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

interface CreateSlotFormProps {
  onSubmit: (data: { exam_type: string; slot_date: string; time_start: string; time_end: string }) => void;
}

export default function CreateSlotForm({ onSubmit }: CreateSlotFormProps) {
  const [examType, setExamType] = useState<PracticalExamType>('trainee');
  const [slotDate, setSlotDate] = useState('');
  const [timeStart, setTimeStart] = useState('16:00');
  const [timeEnd, setTimeEnd] = useState('17:00');

  const handleSubmit = () => {
    if (!slotDate || !timeStart || !timeEnd) {
      alert('Wypełnij wszystkie pola');
      return;
    }
    if (timeStart >= timeEnd) {
      alert('Godzina końca musi być późniejsza niż początek');
      return;
    }
    onSubmit({ exam_type: examType, slot_date: slotDate, time_start: timeStart, time_end: timeEnd });
    setSlotDate('');
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
          UTWÓRZ NOWY SLOT
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Exam type */}
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Typ egzaminu
            </label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as PracticalExamType)}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            >
              {(Object.entries(PRACTICAL_EXAM_TYPES) as [PracticalExamType, { label: string }][]).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Data
            </label>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Time start */}
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Od
            </label>
            <select
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Time end */}
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Do
            </label>
            <select
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="btn-win95 font-mono text-xs mt-3 flex items-center gap-1"
          style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
        >
          <Plus className="w-3 h-3" />
          DODAJ SLOT
        </button>
      </div>
    </div>
  );
}
