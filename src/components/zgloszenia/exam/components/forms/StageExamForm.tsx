'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { StageChecklistData, StageData } from '../../../types';
import {
  SEU_STAGES,
  POSCIGOWY_STAGES,
  POSCIGOWY_VERIFICATION_ITEMS,
} from '../../../types';

interface StageExamFormProps {
  examType: 'seu' | 'poscigowy';
  onDataChange: (data: {
    checklist: StageChecklistData;
    score: number;
    maxScore: number;
    passed: boolean;
  }) => void;
}

export default function StageExamForm({ examType, onDataChange }: StageExamFormProps) {
  const stageNames = examType === 'seu' ? SEU_STAGES : POSCIGOWY_STAGES;

  const [stages, setStages] = useState<StageData[]>(() =>
    stageNames.map((name, idx) => ({
      name,
      passed: true,
      notes: '',
      ...(examType === 'poscigowy' && idx === 1
        ? { verificationItems: POSCIGOWY_VERIFICATION_ITEMS.map(item => ({ item, checked: false })) }
        : {}),
    }))
  );

  const allPassed = useMemo(() => stages.every(s => s.passed), [stages]);
  const passedCount = useMemo(() => stages.filter(s => s.passed).length, [stages]);

  // Notify parent of changes
  useEffect(() => {
    onDataChange({
      checklist: { type: examType, stages },
      score: passedCount,
      maxScore: stages.length,
      passed: allPassed,
    });
  }, [stages, examType, allPassed, passedCount, onDataChange]);

  const updateStage = (idx: number, updates: Partial<StageData>) => {
    setStages(prev => prev.map((s, i) => (i === idx ? { ...s, ...updates } : s)));
  };

  const toggleVerification = (stageIdx: number, itemIdx: number) => {
    setStages(prev =>
      prev.map((s, i) => {
        if (i !== stageIdx || !s.verificationItems) return s;
        return {
          ...s,
          verificationItems: s.verificationItems.map((v, vi) =>
            vi === itemIdx ? { ...v, checked: !v.checked } : v
          ),
        };
      })
    );
  };

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => (
        <div key={idx} className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          {/* Stage header */}
          <div
            className="px-3 py-2 flex items-center justify-between"
            style={{ backgroundColor: 'var(--mdt-header)' }}
          >
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white">
              {stage.name}
            </span>
            <span className="flex items-center gap-1">
              {stage.passed ? (
                <CheckCircle className="w-4 h-4" style={{ color: '#4a9a4a' }} />
              ) : (
                <XCircle className="w-4 h-4" style={{ color: '#cc4444' }} />
              )}
            </span>
          </div>

          <div className="p-3 space-y-3">
            {/* Pass/Fail toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => updateStage(idx, { passed: true })}
                className="btn-win95 font-mono text-xs flex-1 py-1.5"
                style={stage.passed ? {
                  backgroundColor: '#3a6a3a',
                  color: '#fff',
                  borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a',
                } : {}}
              >
                ZDANY
              </button>
              <button
                onClick={() => updateStage(idx, { passed: false })}
                className="btn-win95 font-mono text-xs flex-1 py-1.5"
                style={!stage.passed ? {
                  backgroundColor: '#8b1a1a',
                  color: '#fff',
                  borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a',
                } : {}}
              >
                NIEZDANY
              </button>
            </div>

            {/* Verification checkboxes (Pościgowy Etap 2 only) */}
            {stage.verificationItems && (
              <div>
                <div className="font-mono text-[10px] mb-1.5" style={{ color: 'var(--mdt-muted-text)' }}>
                  LISTA WERYFIKACYJNA
                </div>
                <div className="panel-inset p-2 space-y-1" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                  {stage.verificationItems.map((v, vIdx) => (
                    <label key={vIdx} className="flex items-center gap-2 cursor-pointer py-0.5">
                      <input
                        type="checkbox"
                        checked={v.checked}
                        onChange={() => toggleVerification(idx, vIdx)}
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                        {v.item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Notes per stage */}
            <div>
              <label className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                {!stage.passed ? 'UWAGI (POWÓD NIEZDANIA)' : 'UWAGI'}
              </label>
              <textarea
                value={stage.notes}
                onChange={(e) => updateStage(idx, { notes: e.target.value })}
                placeholder={!stage.passed ? 'Opisz powód niezdania etapu...' : 'Dodatkowe uwagi (opcjonalnie)...'}
                rows={2}
                className="panel-inset w-full px-3 py-2 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Overall result */}
      <div
        className="panel-raised p-3 flex items-center justify-center"
        style={{
          backgroundColor: allPassed ? '#1a3a1a' : '#3a1a1a',
          borderColor: allPassed ? '#0a2a0a #2a4a2a #2a4a2a #0a2a0a' : '#2a0a0a #4a2a2a #4a2a2a #2a0a0a',
        }}
      >
        <div className="text-center">
          <div className="font-mono text-[10px] mb-1" style={{ color: allPassed ? '#6a9a6a' : '#aa6a6a' }}>
            WYNIK KOŃCOWY ({passedCount}/{stages.length} ETAPÓW ZDANYCH)
          </div>
          <span
            className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest"
            style={{ color: allPassed ? '#4a9a4a' : '#cc4444' }}
          >
            {allPassed ? 'ZDANY' : 'NIEZDANY'}
          </span>
        </div>
      </div>
    </div>
  );
}
