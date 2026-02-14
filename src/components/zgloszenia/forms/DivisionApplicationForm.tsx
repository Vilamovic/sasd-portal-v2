'use client';

import { useState, useEffect } from 'react';
import { Shield, Send } from 'lucide-react';

import { createSubmission } from '@/src/lib/db/submissions';
import { getRecruitmentStatus } from '@/src/lib/db/recruitment';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';
import type { RecruitmentStatus } from '../types';

const DIVISION_COLORS: Record<string, string> = {
  FTO: '#c9a227',
  SS: '#ff8c00',
  DTU: '#60a5fa',
  GU: '#059669',
};

const DIVISION_NAMES: Record<string, string> = {
  FTO: 'Training Staff (FTO)',
  SS: 'Supervisory Staff (SS)',
  DTU: 'Detective Task Unit (DTU)',
  GU: 'Gang Unit (GU)',
};

interface DivisionApplicationFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DivisionApplicationForm({ userId, onSuccess, onCancel }: DivisionApplicationFormProps) {
  const { user } = useAuth();
  const [selectedDivision, setSelectedDivision] = useState('');
  const [motivation, setMotivation] = useState('');
  const [recruitment, setRecruitment] = useState<RecruitmentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecruitment();
  }, []);

  const loadRecruitment = async () => {
    const { data } = await getRecruitmentStatus();
    if (data) setRecruitment(data);
    setLoading(false);
  };

  const openDivisions = recruitment.filter((r) => r.is_open);

  const handleSubmit = async () => {
    if (!selectedDivision) {
      setError('Wybierz dywizję');
      return;
    }
    if (!motivation.trim()) {
      setError('Motywacja jest wymagana');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'division_application',
        title: `Podanie do ${selectedDivision}`,
        description: motivation,
        metadata: { division: selectedDivision },
      });

      if (dbError) throw dbError;

      await notifyNewSubmission({
        type: 'division_application',
        title: `Podanie do ${DIVISION_NAMES[selectedDivision] || selectedDivision}`,
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
        metadata: { division: selectedDivision },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania podania');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <Shield className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Podanie do Dywizji
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a1a1a', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Division Selection */}
        <div className="mb-3">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Wybierz dywizję * (tylko z otwartą rekrutacją)
          </label>

          {loading ? (
            <div className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Ładowanie...</div>
          ) : openDivisions.length === 0 ? (
            <div className="panel-inset px-3 py-2 font-mono text-xs" style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-muted-text)' }}>
              Brak dywizji z otwartą rekrutacją. Spróbuj później.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {openDivisions.map((r) => (
                <button
                  key={r.division}
                  onClick={() => setSelectedDivision(r.division)}
                  className={`btn-win95 font-mono text-xs px-4 py-2 ${selectedDivision === r.division ? 'btn-win95-active' : ''}`}
                  style={selectedDivision === r.division ? { backgroundColor: DIVISION_COLORS[r.division], color: '#fff' } : {}}
                >
                  {r.division}
                </button>
              ))}
            </div>
          )}

          {/* Show all divisions with status */}
          <div className="mt-2 flex flex-wrap gap-1">
            {recruitment.map((r) => (
              <span
                key={r.division}
                className="font-mono text-[10px] px-2 py-0.5"
                style={{
                  color: r.is_open ? '#3a6a3a' : 'var(--mdt-muted-text)',
                  backgroundColor: 'var(--mdt-input-bg)',
                }}
              >
                {r.division}: {r.is_open ? 'OTWARTA' : 'ZAMKNIĘTA'}
              </span>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Motywacja * (dlaczego chcesz dołączyć do tej dywizji?)
          </label>
          <textarea
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            placeholder="Opisz swoją motywację i doświadczenie..."
            rows={6}
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || openDivisions.length === 0}
            className="btn-win95 flex items-center gap-1"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Send className="w-3 h-3" />
            <span className="font-mono text-xs">{submitting ? 'Wysyłanie...' : 'Wyślij Podanie'}</span>
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
