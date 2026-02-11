'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '@/src/supabaseClient';
import type { ExamSlot, PracticalExamType, PracticalExamChecklist } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';
import TraineeExamForm from './forms/TraineeExamForm';
import SwatExamForm from './forms/SwatExamForm';
import StageExamForm from './forms/StageExamForm';

interface ExamResultFormProps {
  slot: ExamSlot;
  examinerId: string;
  onSubmit: (result: {
    slot_id: string;
    exam_type: string;
    examinee_id: string;
    examiner_id: string;
    score: number;
    max_score: number;
    passed: boolean;
    checklist: PracticalExamChecklist;
    notes: string;
  }) => void;
  onCancel: () => void;
}

interface UserOption {
  id: string;
  username: string;
  mta_nick: string | null;
  plus_count: number;
  minus_count: number;
}

export default function ExamResultForm({ slot, examinerId, onSubmit, onCancel }: ExamResultFormProps) {
  const examType = slot.exam_type as PracticalExamType;
  const config = PRACTICAL_EXAM_TYPES[examType];

  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [examineeId, setExamineeId] = useState(slot.booked_by || '');
  const [notes, setNotes] = useState('');

  // Form data from sub-components
  const formDataRef = useRef<{
    checklist: PracticalExamChecklist;
    score: number;
    maxScore: number;
    passed: boolean;
  }>({
    checklist: { type: 'swat' },
    score: 0,
    maxScore: 0,
    passed: true,
  });

  useEffect(() => {
    const loadUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, username, mta_nick, plus_count, minus_count')
        .order('mta_nick', { ascending: true });
      if (data) setAllUsers(data.map(u => ({
        ...u,
        plus_count: u.plus_count || 0,
        minus_count: u.minus_count || 0,
      })));
    };
    loadUsers();
  }, []);

  const selectedExaminee = allUsers.find(u => u.id === examineeId);

  const handleFormDataChange = useCallback((data: {
    checklist: PracticalExamChecklist;
    score: number;
    maxScore: number;
    passed: boolean;
  }) => {
    formDataRef.current = data;
  }, []);

  const handleSubmit = () => {
    if (!examineeId) {
      alert('Wybierz zdającego');
      return;
    }
    onSubmit({
      slot_id: slot.id,
      exam_type: slot.exam_type,
      examinee_id: examineeId,
      examiner_id: examinerId,
      score: formDataRef.current.score,
      max_score: formDataRef.current.maxScore,
      passed: formDataRef.current.passed,
      checklist: formDataRef.current.checklist,
      notes,
    });
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Header */}
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: config?.color || 'var(--mdt-header)' }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white">
          WYNIK EGZAMINU — {config?.label || slot.exam_type}
        </span>
        <button onClick={onCancel} className="text-white hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Examinee select */}
        <div>
          <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Zdający
          </label>
          {slot.booked_by ? (
            <div className="panel-inset px-3 py-1.5 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}>
              {slot.booker?.mta_nick || slot.booker?.username || slot.booked_by}
            </div>
          ) : (
            <select
              value={examineeId}
              onChange={(e) => setExamineeId(e.target.value)}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            >
              <option value="">— Wybierz zdającego —</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.mta_nick || u.username}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Type-specific form */}
        {examType === 'trainee' && (
          <TraineeExamForm
            examineePlusCount={selectedExaminee?.plus_count ?? 0}
            examineeMinusCount={selectedExaminee?.minus_count ?? 0}
            onDataChange={handleFormDataChange}
          />
        )}

        {examType === 'swat' && (
          <SwatExamForm onDataChange={handleFormDataChange} />
        )}

        {(examType === 'seu' || examType === 'poscigowy') && (
          <StageExamForm examType={examType} onDataChange={handleFormDataChange} />
        )}

        {/* Notes */}
        <div>
          <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Dodatkowe uwagi
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Uwagi, komentarze do egzaminu..."
            rows={3}
            className="panel-inset w-full px-3 py-2 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            className="btn-win95 font-mono text-xs flex items-center gap-1"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Save className="w-3 h-3" />
            ZAPISZ WYNIK
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            ANULUJ
          </button>
        </div>
      </div>
    </div>
  );
}
