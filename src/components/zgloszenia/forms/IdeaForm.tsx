'use client';

import { useState } from 'react';
import { Lightbulb, Send } from 'lucide-react';
import QuillEditor from '@/src/components/shared/QuillEditor';
import { createSubmission } from '@/src/lib/db/submissions';
import { notifyNewSubmission } from '@/src/lib/webhooks/submissions';
import { useAuth } from '@/src/contexts/AuthContext';

interface IdeaFormProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function IdeaForm({ userId, onSuccess, onCancel }: IdeaFormProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'frakcja' | 'strona'>('frakcja');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Tytuł jest wymagany');
      return;
    }
    if (!description.trim() || description === '<p><br></p>') {
      setError('Opis propozycji jest wymagany');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { error: dbError } = await createSubmission({
        user_id: userId,
        type: 'idea',
        title: title.trim(),
        description,
        metadata: { category },
      });

      if (dbError) throw dbError;

      await notifyNewSubmission({
        type: 'idea',
        title: title.trim(),
        user: { username: user?.user_metadata?.custom_claims?.global_name || '', mta_nick: '' },
        metadata: { category },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas wysyłania propozycji');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <Lightbulb className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Pomysł / Propozycja
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
            Tytuł propozycji *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Np. Nowy system rankingowy..."
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          />
        </div>

        {/* Category */}
        <div className="mb-3">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Kategoria *
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setCategory('frakcja')}
              className={`btn-win95 font-mono text-xs px-4 py-2 ${category === 'frakcja' ? 'btn-win95-active' : ''}`}
            >
              Frakcja
            </button>
            <button
              onClick={() => setCategory('strona')}
              className={`btn-win95 font-mono text-xs px-4 py-2 ${category === 'strona' ? 'btn-win95-active' : ''}`}
            >
              Strona
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Opis propozycji * (co chcesz zaproponować i dlaczego?)
          </label>
          <QuillEditor
            value={description}
            onChange={setDescription}
            placeholder="Opisz szczegółowo swój pomysł..."
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
            <span className="font-mono text-xs">{submitting ? 'Wysyłanie...' : 'Wyślij Propozycję'}</span>
          </button>
          <button onClick={onCancel} className="btn-win95 font-mono text-xs">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
