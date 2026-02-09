'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/contexts/AuthContext';
import BackButton from '@/src/components/shared/BackButton';
import AccessDenied from '@/src/components/shared/AccessDenied';
import { getAllPracticalExamResults, archiveExamResult } from '@/src/lib/db/practicalExamResults';
import ExamResultCard from './components/ExamResultCard';
import type { PracticalExamResult, PracticalExamType } from '../types';
import { PRACTICAL_EXAM_TYPES } from '../types';

export default function ExamHistoryPage() {
  const router = useRouter();
  const { user, isCS } = useAuth();
  const [results, setResults] = useState<PracticalExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!isCS) return;
    const load = async () => {
      const filters: { exam_type?: string } = {};
      if (filterType) filters.exam_type = filterType;

      const { data } = await getAllPracticalExamResults(filters);
      if (data) setResults(data as PracticalExamResult[]);
      setLoading(false);
    };
    load();
  }, [filterType, isCS]);

  const handleArchive = async (resultId: string) => {
    if (!user || !confirm('Zarchiwizować ten wynik egzaminu?')) return;

    const { error } = await archiveExamResult(resultId, user.id);
    if (!error) {
      alert('Wynik zarchiwizowany.');
      const filters: { exam_type?: string } = {};
      if (filterType) filters.exam_type = filterType;
      const { data } = await getAllPracticalExamResults(filters);
      if (data) setResults(data as PracticalExamResult[]);
    } else {
      alert('Błąd archiwizacji.');
    }
  };

  if (!isCS) return <AccessDenied onBack={() => router.push('/zgloszenia/egzamin')} message="Brak uprawnień. Wyniki egzaminów są dostępne tylko dla CS/HCS/DEV." />;

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
                <ExamResultCard key={result.id} result={result} index={index} isCS={isCS} onArchive={handleArchive} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
