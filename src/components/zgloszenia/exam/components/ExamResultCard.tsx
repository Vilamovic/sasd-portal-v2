'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Archive } from 'lucide-react';
import type { PracticalExamResult, PracticalExamType, TraineeChecklistData, StageChecklistData } from '../../types';
import { PRACTICAL_EXAM_TYPES, TRAINEE_PASS_THRESHOLD } from '../../types';

interface ExamResultCardProps {
  result: PracticalExamResult;
  index: number;
  isCS?: boolean;
  onArchive?: (id: string) => void;
}

function isTraineeChecklist(checklist: unknown): checklist is TraineeChecklistData {
  return !!checklist && typeof checklist === 'object' && 'type' in checklist && (checklist as { type: string }).type === 'trainee';
}

function isStageChecklist(checklist: unknown): checklist is StageChecklistData {
  return !!checklist && typeof checklist === 'object' && 'type' in checklist &&
    ((checklist as { type: string }).type === 'seu' || (checklist as { type: string }).type === 'poscigowy');
}

function isSwatChecklist(checklist: unknown): checklist is { type: 'swat' } {
  return !!checklist && typeof checklist === 'object' && 'type' in checklist && (checklist as { type: string }).type === 'swat';
}

function isLegacyChecklist(checklist: unknown): checklist is { item: string; checked: boolean }[] {
  return Array.isArray(checklist);
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

  const showScore = result.max_score > 0;

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

        {/* Score (only for trainee) */}
        <div className="w-20 shrink-0">
          {showScore ? (
            <span className="font-[family-name:var(--font-vt323)] text-base" style={{ color: 'var(--mdt-content-text)' }}>
              {result.score}/{result.max_score}
            </span>
          ) : (
            <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>—</span>
          )}
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
            {/* Trainee checklist */}
            {isTraineeChecklist(result.checklist) && (
              <TraineeDetails checklist={result.checklist} />
            )}

            {/* Stage-based checklist (SEU / Pościgowy) */}
            {isStageChecklist(result.checklist) && (
              <StageDetails checklist={result.checklist} />
            )}

            {/* Legacy checklist (old format) */}
            {isLegacyChecklist(result.checklist) && result.checklist.length > 0 && (
              <LegacyDetails checklist={result.checklist} />
            )}

            {/* SWAT — no checklist to show */}

            {/* Notes */}
            {result.notes && (
              <div>
                <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
                  Dodatkowe uwagi
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

// ==================== Sub-renderers ====================

function TraineeDetails({ checklist }: { checklist: TraineeChecklistData }) {
  return (
    <div className="space-y-2">
      {checklist.sections.map((section, sIdx) => {
        const sectionScore = section.items.reduce((sum, item) => sum + (item.score ?? 0), 0);
        const sectionMax = section.items.reduce((sum, item) => sum + item.maxPoints, 0);
        return (
          <div key={sIdx}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--mdt-muted-text)' }}>
                {section.name}
              </span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-content-text)' }}>
                {sectionScore}/{sectionMax}
              </span>
            </div>
            <div className="space-y-0.5 ml-2">
              {section.items.map((item, iIdx) => (
                <div key={iIdx} className="flex items-center gap-2">
                  <span
                    className="font-mono text-[10px] w-8 text-center shrink-0"
                    style={{
                      color: item.score === item.maxPoints ? '#4a9a4a' : item.score === 0 ? '#cc4444' : 'var(--mdt-content-text)',
                    }}
                  >
                    {item.score}/{item.maxPoints}
                  </span>
                  <span className="font-mono text-xs flex-1" style={{ color: 'var(--mdt-content-text)' }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Bonus */}
      {checklist.bonusPoints !== 0 && (
        <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--mdt-muted-text)' }}>
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
            {checklist.bonusPoints > 0 ? 'BONUS Z AKTYWNOŚCI:' : 'KARA Z AKTYWNOŚCI:'}
          </span>
          <span
            className="font-mono text-xs font-bold"
            style={{ color: checklist.bonusPoints > 0 ? '#4a9a4a' : '#cc4444' }}
          >
            {checklist.bonusPoints > 0 ? '+' : ''}{checklist.bonusPoints}
          </span>
        </div>
      )}
    </div>
  );
}

function StageDetails({ checklist }: { checklist: StageChecklistData }) {
  return (
    <div className="space-y-2">
      {checklist.stages.map((stage, idx) => (
        <div key={idx}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs" style={{ color: stage.passed ? '#4a9a4a' : '#cc4444' }}>
              {stage.passed ? '■' : '□'}
            </span>
            <span className="font-mono text-[10px] font-bold" style={{ color: 'var(--mdt-content-text)' }}>
              {stage.name}
            </span>
            <span className="font-mono text-[10px]" style={{ color: stage.passed ? '#4a9a4a' : '#cc4444' }}>
              {stage.passed ? 'ZDANY' : 'NIEZDANY'}
            </span>
          </div>

          {/* Verification items (Pościgowy stage 2) */}
          {stage.verificationItems && stage.verificationItems.length > 0 && (
            <div className="ml-4 mb-1 space-y-0.5">
              {stage.verificationItems.map((v, vIdx) => (
                <div key={vIdx} className="flex items-center gap-2">
                  <span className="font-mono text-xs" style={{ color: v.checked ? '#4a9a4a' : 'var(--mdt-muted-text)' }}>
                    {v.checked ? '■' : '□'}
                  </span>
                  <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
                    {v.item}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Stage notes */}
          {stage.notes && (
            <div className="ml-4 panel-inset p-1.5 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-panel-content)', color: 'var(--mdt-content-text)' }}>
              {stage.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function LegacyDetails({ checklist }: { checklist: { item: string; checked: boolean }[] }) {
  return (
    <div>
      <span className="font-mono text-[10px] block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
        Sprawdzone elementy
      </span>
      <div className="space-y-1">
        {checklist.map((item, i) => (
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
  );
}
