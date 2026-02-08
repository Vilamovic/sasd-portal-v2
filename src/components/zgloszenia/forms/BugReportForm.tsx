'use client';

import { useState } from 'react';
import { Bug, Send } from 'lucide-react';
import QuillEditor from '@/src/components/shared/QuillEditor';
import { createSubmission } from '@/src/lib/db/submissions';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';

interface BugReportFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BugReportForm({ userId, onSuccess, onCancel }: BugReportFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Tytuł jest wymagany');
      return;
    }
    if (!description.trim() || description === '<p><br></p>') {
      setError('Opis błędu jest wymagany');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'bug_report',
        title: title.trim(),
        description,
      });

      if (dbError) throw dbError;

      // Discord webhook
      await notifyNewSubmission({
        type: 'bug_report',
        title: title.trim(),
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania zgłoszenia');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <Bug className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Zgłoszenie Błędu
        </span>
      </div>

      <div className="p-4">
        {error && (
          <div className="panel-inset px-3 py-2 mb-3 font-mono text-xs" style={{ backgroundColor: '#4a1a1a', color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Title */}
        <div className="mb-3">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Tytuł błędu *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Np. Nie działa przycisk logowania..."
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Opis problemu * (kroki reprodukcji, co się dzieje, co powinno się dziać)
          </label>
          <QuillEditor
            value={description}
            onChange={setDescription}
            placeholder="Opisz szczegółowo napotkany problem..."
            minHeight="200px"
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
            <span className="font-mono text-xs">{submitting ? 'Wysyłanie...' : 'Wyślij Zgłoszenie'}</span>
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
