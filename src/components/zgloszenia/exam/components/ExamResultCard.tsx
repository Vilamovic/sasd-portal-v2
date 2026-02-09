'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Archive } from 'lucide-react';
import type { PracticalExamResult, PracticalExamType } from '../../types';
import { PRACTICAL_EXAM_TYPES } from '../../types';

interface ExamResultCardProps {
  result: PracticalExamResult;
  index: number;
  isCS?: boolean;
  onArchive?: (id: string) => void;
}

export default function ExamResultCard({ result, index, isCS, onArchive }: ExamResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = PRACTICAL_EXAM_TYPES[result.exam_type as PracticalExamType];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div
        className="px-4 py-3 flex items-center gap-3 cursor-pointer"
        style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand icon */}
        <div className="w-4 shrink-0">
          {expanded ? (
            <ChevronDown className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          ) : (
            <ChevronRight className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          )}
        </div>

        {/* Type badge */}
        <div className="shrink-0">
          <span
            className="px-2 py-0.5 font-mono text-[10px] font-bold text-white"
            style={{ backgroundColor: config?.color || 'var(--mdt-muted-text)' }}
          >
            {config?.label.replace('Egzamin ', '') || result.exam_type}
          </span>
        </div>

        {/* Examinee */}
        <div className="w-32 shrink-0">
          <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
            {result.examinee?.mta_nick || result.examinee?.username || '—'}
          </span>
        </div>

        {/* Score */}
        <div className="w-20 shrink-0">
          <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: 'var(--mdt-content-text)' }}>
            {result.score}/{result.max_score}
          </span>
        </div>

        {/* Pass/Fail */}
        <div className="w-24 shrink-0">
          {result.passed ? (
            <span className="flex items-center gap-1 font-mono text-xs" style={{ color: '#4a9a4a' }}>
              <CheckCircle className="w-3 h-3" /> ZDANY
            </span>
          ) : (
            <span className="flex items-center gap-1 font-mono text-xs" style={{ color: '#cc4444' }}>
              <XCircle className="w-3 h-3" /> NIEZDANY
            </span>
          )}
        </div>

        {/* Examiner */}
        <div className="flex-1 min-w-0">
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
            Egz: {result.examiner?.mta_nick || result.examiner?.username || '—'}
          </span>
        </div>

        {/* Date */}
        <div className="w-32 shrink-0 text-right">
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
            {formatDate(result.created_at)}
          </span>
        </div>

        {/* Archive button (CS+ only) */}
        {isCS && onArchive && (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onArchive(result.id)}
              className="btn-win95 p-1"
              title="Archiwizuj wynik"
              style={{ backgroundColor: '#555555', borderColor: '#777 #333 #333 #777' }}
            >
              <Archive className="w-3 h-3 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-l-4 ml-4" style={{ borderColor: config?.color || 'var(--mdt-blue-bar)', backgroundColor: 'var(--mdt-input-bg)' }}>
          <div className="px-4 py-3 space-y-3">
            {/* Checklist */}
            {result.checklist && result.checklist.length > 0 && (
              <div>
                <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                  Sprawdzone elementy
                </span>
                <div className="space-y-1">
                  {result.checklist.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: item.checked ? '#4a9a4a' : '#cc4444' }}>
                        {item.checked ? '■' : '□'}
                      </span>
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {result.notes && (
              <div>
                <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                  Dodatkowe informacje
                </span>
                <div className="panel-inset p-2 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)' }}>
                  {result.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
