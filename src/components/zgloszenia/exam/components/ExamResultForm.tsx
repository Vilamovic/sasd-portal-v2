'use client';

import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { supabase } from '@/src/supabaseClient';
import type { ExamSlot, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES, EXAM_CHECKLISTS } from '../../types';

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
    checklist: { item: string; checked: boolean }[];
    notes: string;
  }) => void;
  onCancel: () => void;
}

export default function ExamResultForm({ slot, examinerId, onSubmit, onCancel }: ExamResultFormProps) {
  const examType = slot.exam_type as PracticalExamType;
  const checklistItems = EXAM_CHECKLISTS[examType] || [];

  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(100);
  const [passed, setPassed] = useState(true);
  const [checklist, setChecklist] = useState<{ item: string; checked: boolean }[]>(
    checklistItems.map((item) => ({ item, checked: false }))
  );
  const [notes, setNotes] = useState('');
  const [allUsers, setAllUsers] = useState<{ id: string; username: string; mta_nick: string | null }[]>([]);
  const [examineeId, setExamineeId] = useState(slot.booked_by || '');

  useEffect(() => {
    // Load users for examinee select (if slot has no booker)
    const loadUsers = async () => {
      const { data } = await supabase
        .from('users')
        .select('id, username, mta_nick')
        .order('mta_nick', { ascending: true });
      if (data) setAllUsers(data);
    };
    loadUsers();
  }, []);

  const toggleChecklistItem = (index: number) => {
    const updated = [...checklist];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    setChecklist(updated);
  };

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
      score,
      max_score: maxScore,
      passed,
      checklist,
      notes,
    });
  };

  const config = PRACTICAL_EXAM_TYPES[examType];

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ backgroundColor: config?.color || 'var(--mdt-header)' }}>
        <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white">
          WYNIK EGZAMINU — {config?.label || slot.exam_type}
        </span>
        <button onClick={onCancel} className="text-white hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Examinee */}
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

        {/* Score */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Punkty
            </label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value) || 0)}
              min={0}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Max punktów
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(parseInt(e.target.value) || 100)}
              min={1}
              className="panel-inset w-full px-2 py-1.5 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Wynik
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPassed(true)}
                className={`btn-win95 font-mono text-xs flex-1 py-1`}
                style={passed ? { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' } : {}}
              >
                ZDANY
              </button>
              <button
                onClick={() => setPassed(false)}
                className={`btn-win95 font-mono text-xs flex-1 py-1`}
                style={!passed ? { backgroundColor: '#8b1a1a', color: '#fff', borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a' } : {}}
              >
                NIEZDANY
              </button>
            </div>
          </div>
        </div>

        {/* Checklist */}
        {checklist.length > 0 && (
          <div>
            <label className="font-mono text-[10px] block mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
              Sprawdzone elementy
            </label>
            <div className="panel-inset p-3 space-y-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
              {checklist.map((item, index) => (
                <label key={index} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(index)}
                    className="w-3.5 h-3.5"
                  />
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                    {item.item}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Dodatkowe informacje
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
