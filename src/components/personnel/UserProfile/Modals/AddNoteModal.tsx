'use client';

import { useState, useRef } from 'react';
import { FileText, X, Save } from 'lucide-react';
import { addUserNote } from '@/src/lib/db/notes';

interface AddNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUserId: string;
  onSuccess: () => void;
}

/**
 * AddNoteModal - Modal do dodawania prywatnych notatek administratora
 */
export default function AddNoteModal({
  isOpen,
  onClose,
  userId,
  currentUserId,
  onSuccess,
}: AddNoteModalProps) {
  const [noteText, setNoteText] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    if (!noteText.trim()) {
      alert('Treść notatki jest wymagana.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addUserNote({
        user_id: userId,
        created_by: currentUserId,
        note: noteText.trim(),
      });
      if (error) throw error;

      setNoteText('');
      onClose();
      onSuccess();
      alert('Notatka dodana.');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Błąd podczas dodawania notatki.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleClose = () => {
    setNoteText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Dodaj Notatkę Prywatną
          </h3>
          <button
            onClick={handleClose}
            style={{ backgroundColor: '#c41e1e', color: '#fff', border: '1px solid #555' }}
            className="w-6 h-6 flex items-center justify-center text-xs font-bold"
          >
            X
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Note Text */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Treść notatki</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Wpisz notatkę widoczną tylko dla administratorów..."
              rows={6}
              className="panel-inset w-full px-3 py-2 font-mono text-sm resize-none"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Info */}
          <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <p className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
              <strong>Informacja:</strong> Notatki prywatne są widoczne tylko dla administratorów i służą do wewnętrznych uwag.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Save className="w-4 h-4" />
              Dodaj Notatkę
            </button>
            <button
              onClick={handleClose}
              className="btn-win95 px-6"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
