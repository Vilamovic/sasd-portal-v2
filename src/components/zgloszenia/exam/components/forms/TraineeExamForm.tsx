'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { TraineeChecklistSection, TraineeChecklistData } from '../../../types';
import { TRAINEE_CHECKLIST_TEMPLATE, TRAINEE_PASS_THRESHOLD } from '../../../types';

interface TraineeExamFormProps {
  examineePlusCount: number;
  examineeMinusCount: number;
  onDataChange: (data: {
    checklist: TraineeChecklistData;
    score: number;
    maxScore: number;
    passed: boolean;
  }) => void;
}

export default function TraineeExamForm({ examineePlusCount, examineeMinusCount, onDataChange }: TraineeExamFormProps) {
  const [sections, setSections] = useState<TraineeChecklistSection[]>(
    () => TRAINEE_CHECKLIST_TEMPLATE.map(s => ({
      ...s,
      items: s.items.map(item => ({ ...item, score: 0 })),
    }))
  );
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const bonusPoints = useMemo(() => {
    const plusBonus = Math.min(examineePlusCount, 3);
    const minusPenalty = Math.min(examineeMinusCount, 2);
    return plusBonus - minusPenalty;
  }, [examineePlusCount, examineeMinusCount]);

  const { checklistScore, maxScore, totalScore, passed } = useMemo(() => {
    let score = 0;
    let max = 0;
    for (const section of sections) {
      for (const item of section.items) {
        max += item.maxPoints;
        score += item.score;
      }
    }
    const total = Math.max(0, score + bonusPoints);
    return {
      checklistScore: score,
      maxScore: max,
      totalScore: total,
      passed: total >= TRAINEE_PASS_THRESHOLD,
    };
  }, [sections, bonusPoints]);

  useEffect(() => {
    onDataChange({
      checklist: { type: 'trainee', sections, bonusPoints },
      score: totalScore,
      maxScore,
      passed,
    });
  }, [sections, bonusPoints, totalScore, maxScore, passed, onDataChange]);

  const setItemScore = (sectionIdx: number, itemIdx: number, score: number) => {
    setSections(prev => prev.map((s, si) => {
      if (si !== sectionIdx) return s;
      return {
        ...s,
        items: s.items.map((item, ii) => {
          if (ii !== itemIdx) return item;
          return { ...item, score };
        }),
      };
    }));
  };

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const getSectionScore = (section: TraineeChecklistSection) =>
    section.items.reduce((sum, item) => sum + item.score, 0);

  const getSectionMax = (section: TraineeChecklistSection) =>
    section.items.reduce((sum, item) => sum + item.maxPoints, 0);

  return (
    <div className="space-y-3">
      {sections.map((section, sIdx) => {
        const sectionScore = getSectionScore(section);
        const sectionMax = getSectionMax(section);
        const isExpanded = expandedSections.has(sIdx);

        return (
          <div key={sIdx} className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
            <button
              onClick={() => toggleSection(sIdx)}
              className="w-full px-3 py-2 flex items-center justify-between text-left"
              style={{ backgroundColor: 'var(--mdt-header)' }}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                )}
                <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white">
                  {sIdx + 1}. {section.name}
                </span>
              </div>
              <span className="font-[family-name:var(--font-vt323)] text-sm text-white">
                {sectionScore}/{sectionMax} pkt
              </span>
            </button>

            {isExpanded && (
              <div className="panel-inset m-2 p-2 space-y-1.5" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
                {section.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center gap-2 py-0.5">
                    <span className="font-mono text-xs flex-1 min-w-0" style={{ color: 'var(--mdt-content-text)' }}>
                      {item.label}
                    </span>
                    <div className="flex gap-0.5 shrink-0">
                      {Array.from({ length: item.maxPoints + 1 }, (_, pt) => (
                        <button
                          key={pt}
                          onClick={() => setItemScore(sIdx, iIdx, pt)}
                          className="font-mono text-[10px] w-6 h-6 flex items-center justify-center"
                          style={{
                            backgroundColor: item.score === pt
                              ? (pt === 0 ? '#8b1a1a' : '#3a6a3a')
                              : 'var(--mdt-btn-face)',
                            color: item.score === pt ? '#fff' : 'var(--mdt-content-text)',
                            border: '1px solid',
                            borderColor: item.score === pt
                              ? (pt === 0 ? '#b03a3a #4a0a0a #4a0a0a #b03a3a' : '#5a9a5a #1a3a1a #1a3a1a #5a9a5a')
                              : 'var(--mdt-muted-text)',
                          }}
                        >
                          {pt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary bar */}
      <div className="panel-raised p-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="grid grid-cols-2 gap-2">
          <div className="panel-inset px-3 py-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <div className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>PUNKTY Z EGZAMINU</div>
            <div className="font-[family-name:var(--font-vt323)] text-xl" style={{ color: 'var(--mdt-content-text)' }}>
              {checklistScore}/{maxScore}
            </div>
          </div>

          <div className="panel-inset px-3 py-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <div className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>
              {bonusPoints >= 0 ? 'BONUS Z AKTYWNOŚCI' : 'KARA Z AKTYWNOŚCI'}
            </div>
            <div
              className="font-[family-name:var(--font-vt323)] text-xl"
              style={{ color: bonusPoints > 0 ? '#4a9a4a' : bonusPoints < 0 ? '#cc4444' : 'var(--mdt-content-text)' }}
            >
              {bonusPoints >= 0 ? '+' : ''}{bonusPoints}
            </div>
            <div className="font-mono text-[9px]" style={{ color: 'var(--mdt-muted-text)' }}>
              {examineePlusCount} {examineePlusCount === 1 ? 'plus' : 'plusów'}, {examineeMinusCount} {examineeMinusCount === 1 ? 'minus' : 'minusów'}
            </div>
          </div>

          <div className="panel-inset px-3 py-2" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
            <div className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>RAZEM</div>
            <div className="font-[family-name:var(--font-vt323)] text-2xl" style={{ color: 'var(--mdt-content-text)' }}>
              {totalScore}
            </div>
            <div className="font-mono text-[9px]" style={{ color: 'var(--mdt-muted-text)' }}>
              próg zdawalności: {TRAINEE_PASS_THRESHOLD}
            </div>
          </div>

          <div
            className="panel-inset px-3 py-2 flex items-center justify-center"
            style={{
              backgroundColor: passed ? '#1a3a1a' : '#3a1a1a',
              borderColor: passed ? '#0a2a0a #2a4a2a #2a4a2a #0a2a0a' : '#2a0a0a #4a2a2a #4a2a2a #2a0a0a',
            }}
          >
            <span
              className="font-[family-name:var(--font-vt323)] text-2xl tracking-widest"
              style={{ color: passed ? '#4a9a4a' : '#cc4444' }}
            >
              {passed ? 'ZDANY' : 'NIEZDANY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
