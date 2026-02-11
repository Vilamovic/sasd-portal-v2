'use client';

import { useState, useEffect } from 'react';
import type { SwatChecklistData } from '../../../types';

interface SwatExamFormProps {
  onDataChange: (data: {
    checklist: SwatChecklistData;
    score: number;
    maxScore: number;
    passed: boolean;
  }) => void;
}

export default function SwatExamForm({ onDataChange }: SwatExamFormProps) {
  const [passed, setPassed] = useState(true);

  useEffect(() => {
    onDataChange({
      checklist: { type: 'swat' },
      score: 0,
      maxScore: 0,
      passed,
    });
  }, [passed, onDataChange]);

  return (
    <div className="space-y-3">
      <div className="panel-raised p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="font-mono text-[10px] mb-3" style={{ color: 'var(--mdt-muted-text)' }}>
          WYNIK EGZAMINU STRZELECKIEGO
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setPassed(true)}
            className="btn-win95 font-[family-name:var(--font-vt323)] text-lg flex-1 py-3 tracking-wider"
            style={passed ? {
              backgroundColor: '#3a6a3a',
              color: '#fff',
              borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a',
            } : {}}
          >
            ZDANY
          </button>
          <button
            onClick={() => setPassed(false)}
            className="btn-win95 font-[family-name:var(--font-vt323)] text-lg flex-1 py-3 tracking-wider"
            style={!passed ? {
              backgroundColor: '#8b1a1a',
              color: '#fff',
              borderColor: '#b03a3a #4a0a0a #4a0a0a #b03a3a',
            } : {}}
          >
            NIEZDANY
          </button>
        </div>
      </div>
    </div>
  );
}
