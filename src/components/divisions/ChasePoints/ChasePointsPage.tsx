'use client';

import { useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Zap, AlertTriangle, Eye, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useChasePoints, type UserSummary, type ChasePointEntry } from './hooks/useChasePoints';
import LoadingState from '@/src/components/shared/LoadingState';

const WARNING_THRESHOLD = 15;

export default function ChasePointsPage() {
  const { user, isCS } = useAuth();
  const {
    userSummaries,
    deputies,
    loading,
    saving,
    handleAddPoints,
    handleDeletePoint,
  } = useChasePoints(user?.id);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [formTarget, setFormTarget] = useState('');
  const [formPoints, setFormPoints] = useState(1);
  const [formReason, setFormReason] = useState('');
  const [formEvidence, setFormEvidence] = useState('');

  // History modal
  const [historyUser, setHistoryUser] = useState<UserSummary | null>(null);

  if (loading) {
    return <LoadingState message="Ładowanie punktów pościgowych..." />;
  }

  const resetForm = () => {
    setFormTarget('');
    setFormPoints(1);
    setFormReason('');
    setFormEvidence('');
    setShowForm(false);
  };

  const onSubmit = async () => {
    if (!formTarget || !formReason.trim()) return;
    await handleAddPoints({
      target_user_id: formTarget,
      points: formPoints,
      reason: formReason,
      evidence_url: formEvidence || null,
    });
    resetForm();
  };

  return (
    <div>
      {/* Header */}
      <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: '#ff8c00' }}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
              Punkty Pościgowe
            </span>
          </div>
          <span className="font-mono text-xs text-white opacity-80">
            {userSummaries.length} osób
          </span>
        </div>

        <div className="p-3 flex items-center justify-between">
          <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            15 punktów = ostrzeżenie. Punkty nie są widoczne dla osoby, której dotyczą.
          </p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="btn-win95 flex items-center gap-1 text-xs py-0.5 px-2"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Plus className="w-3 h-3" />
            Nadaj punkty
          </button>
        </div>
      </div>

      {/* Add Points Form */}
      {showForm && (
        <div className="panel-raised mb-4 p-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-sm tracking-widest mb-3" style={{ color: 'var(--mdt-content-text)' }}>
            NADAJ PUNKTY POŚCIGOWE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Osoba *</label>
              <select
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              >
                <option value="">-- wybierz osobę --</option>
                {deputies
                  .filter((d) => d.id !== user?.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.mta_nick || d.username} ({d.badge || d.role})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Punkty</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formPoints}
                onChange={(e) => setFormPoints(Math.max(1, parseInt(e.target.value) || 1))}
                className="panel-inset w-full px-2 py-1 font-mono text-xs"
                style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Powód *</label>
            <textarea
              value={formReason}
              onChange={(e) => setFormReason(e.target.value)}
              rows={2}
              className="panel-inset w-full px-2 py-1 font-mono text-xs resize-none"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              placeholder="Opisz powód nadania punktów..."
            />
          </div>
          <div className="mb-3">
            <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Dowód / Link (opcjonalne)</label>
            <input
              type="url"
              value={formEvidence}
              onChange={(e) => setFormEvidence(e.target.value)}
              className="panel-inset w-full px-2 py-1 font-mono text-xs"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
              placeholder="https://youtube.com/... lub https://medal.tv/..."
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSubmit}
              disabled={saving || !formTarget || !formReason.trim()}
              className="btn-win95 text-xs"
              style={{
                backgroundColor: !formTarget || !formReason.trim() ? 'var(--mdt-btn-face)' : '#3a6a3a',
                color: !formTarget || !formReason.trim() ? 'var(--mdt-muted-text)' : '#fff',
                borderColor: !formTarget || !formReason.trim() ? undefined : '#5a9a5a #1a3a1a #1a3a1a #5a9a5a',
              }}
            >
              {saving ? 'ZAPISYWANIE...' : 'NADAJ'}
            </button>
            <button onClick={resetForm} className="btn-win95 text-xs">ANULUJ</button>
          </div>
        </div>
      )}

      {/* Points Table */}
      {userSummaries.length === 0 ? (
        <div className="panel-raised p-8 flex flex-col items-center gap-3" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <Zap className="w-10 h-10" style={{ color: 'var(--mdt-muted-text)' }} />
          <p className="font-[family-name:var(--font-vt323)] text-lg tracking-widest" style={{ color: 'var(--mdt-content-text)' }}>
            BRAK PUNKTÓW
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
            Żaden deputy nie ma jeszcze punktów pościgowych.
          </p>
        </div>
      ) : (
        <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--mdt-muted-text)' }}>
                  <th className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-left" style={{ color: 'var(--mdt-content-text)' }}>
                    Użytkownik
                  </th>
                  <th className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-left" style={{ color: 'var(--mdt-content-text)' }}>
                    Stopień
                  </th>
                  <th className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-center" style={{ color: 'var(--mdt-content-text)' }}>
                    Punkty
                  </th>
                  <th className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-center" style={{ color: 'var(--mdt-content-text)' }}>
                    Status
                  </th>
                  <th className="px-4 py-2 font-[family-name:var(--font-vt323)] text-sm tracking-widest text-center" style={{ color: 'var(--mdt-content-text)' }}>
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody>
                {userSummaries.map((summary) => (
                  <tr
                    key={summary.userId}
                    style={{
                      borderBottom: '1px solid var(--mdt-muted-text)',
                      backgroundColor: summary.totalPoints >= WARNING_THRESHOLD ? 'rgba(239,68,68,0.1)' : undefined,
                    }}
                  >
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
                      {summary.mtaNick || summary.username}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                      {summary.badge || '—'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className="font-[family-name:var(--font-vt323)] text-lg tracking-widest"
                        style={{ color: summary.totalPoints >= WARNING_THRESHOLD ? '#ef4444' : summary.totalPoints >= 10 ? '#f59e0b' : 'var(--mdt-content-text)' }}
                      >
                        {summary.totalPoints}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      {summary.totalPoints >= WARNING_THRESHOLD ? (
                        <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5" style={{ backgroundColor: '#8b1a1a', color: '#fff' }}>
                          <AlertTriangle className="w-3 h-3" />
                          OSTRZEŻENIE
                        </span>
                      ) : (
                        <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => setHistoryUser(summary)}
                        className="btn-win95 text-xs py-0 px-2"
                        title="Pokaż historię"
                      >
                        <Eye className="w-3 h-3 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyUser && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div
            className="panel-raised flex flex-col max-h-[85vh] w-full max-w-2xl mx-4"
            style={{ backgroundColor: 'var(--mdt-btn-face)' }}
          >
            {/* Title bar */}
            <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#ff8c00' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-white" />
                <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest text-white uppercase">
                  Historia: {historyUser.mtaNick || historyUser.username}
                </span>
              </div>
              <button
                onClick={() => setHistoryUser(null)}
                className="flex h-5 w-5 items-center justify-center text-xs font-bold"
                style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
                aria-label="Zamknij"
              >
                X
              </button>
            </div>

            {/* Summary bar */}
            <div className="px-4 py-2 flex items-center gap-4" style={{ borderBottom: '1px solid var(--mdt-muted-text)' }}>
              <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                Suma punktów:
              </span>
              <span
                className="font-[family-name:var(--font-vt323)] text-xl tracking-widest"
                style={{ color: historyUser.totalPoints >= WARNING_THRESHOLD ? '#ef4444' : 'var(--mdt-content-text)' }}
              >
                {historyUser.totalPoints}
              </span>
              {historyUser.totalPoints >= WARNING_THRESHOLD && (
                <span className="inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5" style={{ backgroundColor: '#8b1a1a', color: '#fff' }}>
                  <AlertTriangle className="w-3 h-3" />
                  PRÓG OSTRZEŻENIA PRZEKROCZONY
                </span>
              )}
            </div>

            {/* Entries */}
            <div className="flex-1 overflow-auto p-4 space-y-2">
              {historyUser.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="panel-inset p-3"
                  style={{ backgroundColor: 'var(--mdt-input-bg)' }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-[family-name:var(--font-vt323)] text-sm tracking-widest px-1.5"
                        style={{ backgroundColor: '#ff8c00', color: '#fff' }}
                      >
                        +{entry.points}
                      </span>
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                        {new Date(entry.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        {', '}
                        {new Date(entry.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.evidence_url && (
                        <a
                          href={entry.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                          title="Dowód"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {isCS && (
                        <button
                          onClick={async () => {
                            await handleDeletePoint(entry.id);
                            // Refresh the summary
                            const updatedEntries = historyUser.entries.filter((e) => e.id !== entry.id);
                            const updatedTotal = updatedEntries.reduce((sum, e) => sum + e.points, 0);
                            if (updatedEntries.length === 0) {
                              setHistoryUser(null);
                            } else {
                              setHistoryUser({
                                ...historyUser,
                                entries: updatedEntries,
                                totalPoints: updatedTotal,
                              });
                            }
                          }}
                          className="text-red-400 hover:text-red-300"
                          title="Usuń wpis"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-xs break-words" style={{ color: 'var(--mdt-content-text)' }}>
                    {entry.reason}
                  </p>
                  <p className="font-mono text-[10px] mt-1" style={{ color: 'var(--mdt-muted-text)' }}>
                    Nadał: {entry.giver?.mta_nick || entry.giver?.username || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t-2 border-[#999] p-3">
              <button className="btn-win95 text-xs" onClick={() => setHistoryUser(null)}>
                ZAMKNIJ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
