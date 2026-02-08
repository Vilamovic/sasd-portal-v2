'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import { getAllPracticalExamResults } from '@/src/lib/db/practicalExamResults';
import ExamResultCard from './components/ExamResultCard';
import type { PracticalExamResult, PracticalExamType } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

export default function ExamHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [results, setResults] = useState<PracticalExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  useEffect(() => {
    const load = async () => {
      const filters: { exam_type?: string; examinee_id?: string } = {};
      if (filterType) filters.exam_type = filterType;
      if (showOnlyMine && user?.id) filters.examinee_id = user.id;

      const { data } = await getAllPracticalExamResults(filters);
      if (data) setResults(data as PracticalExamResult[]);
      setLoading(false);
    };
    load();
  }, [filterType, showOnlyMine, user?.id]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--mdt-content)' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <BackButton onClick={() => router.push('/zgloszenia/egzamin')} destination="Kalendarz" />

        {/* Page Header */}
        <div className="px-4 py-2 mb-6" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white">
            HISTORIA EGZAMINÓW PRAKTYCZNYCH
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="panel-inset px-3 py-1.5 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Wszystkie typy</option>
            {(Object.entries(PRACTICAL_EXAM_TYPES) as [PracticalExamType, { label: string }][]).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyMine}
              onChange={(e) => setShowOnlyMine(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            <span className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
              Tylko moje
            </span>
          </label>

          <span className="font-mono text-xs self-center" style={{ color: 'var(--mdt-muted-text)' }}>
            Wyników: {results.length}
          </span>
        </div>

        {/* Results list */}
        <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="px-3 py-1.5" style={{ backgroundColor: 'var(--mdt-header)' }}>
            <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase" style={{ color: 'var(--mdt-header-text)' }}>
              WYNIKI ({results.length})
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <span className="font-mono text-sm cursor-blink" style={{ color: 'var(--mdt-muted-text)' }}>ŁADOWANIE_</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak wyników egzaminów.</p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <ExamResultCard key={result.id} result={result} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
