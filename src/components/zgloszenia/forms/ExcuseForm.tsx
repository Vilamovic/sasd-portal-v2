'use client';

import { useState } from 'react';
import { FileText, Send } from 'lucide-react';

import { createSubmission } from '@/src/lib/db/submissions';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';

interface ExcuseFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function getCurrentWeek(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  const weekNum = Math.ceil((diff / oneWeek + start.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

function formatWeekLabel(weekStr: string): string {
  const [year, week] = weekStr.split('-W');
  return `Tydzień ${parseInt(week)}, ${year}`;
}

export default function ExcuseForm({ userId, onSuccess, onCancel }: ExcuseFormProps) {
  const { user } = useAuth();
  const [week, setWeek] = useState(getCurrentWeek());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Powód usprawiedliwienia jest wymagany');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'excuse',
        title: `Usprawiedliwienie — ${formatWeekLabel(week)}`,
        description: reason,
        metadata: { week },
      });

      if (dbError) throw dbError;

      await notifyNewSubmission({
        type: 'excuse',
        title: `Usprawiedliwienie — ${formatWeekLabel(week)}`,
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania usprawiedliwienia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <FileText className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Usprawiedliwienie
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a1a1a', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Week selector */}
        <div className="mb-3">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Tydzień, którego dotyczy usprawiedliwienie *
          </label>
          <input
            type="week"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="panel-inset px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          />
          <span className="font-mono text-[10px] ml-2" style={{ color: 'var(--mdt-muted-text)' }}>
            {formatWeekLabel(week)}
          </span>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Powód * (dlaczego nie zrealizowano normy tygodniowej?)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Opisz powód braku realizacji normy..."
            rows={5}
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none', resize: 'vertical' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-win95 flex items-center gap-1"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Send className="w-3 h-3" />
            <span className="font-mono text-xs">{submitting ? 'Wysyłanie...' : 'Wyślij Usprawiedliwienie'}</span>
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
