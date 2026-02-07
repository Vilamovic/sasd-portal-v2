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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#c9a227]" />
            Dodaj Notatkę Prywatną
          </h3>
          <button
            onClick={handleClose}
            className="text-[#8fb5a0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Note Text */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Treść notatki</label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Wpisz notatkę widoczną tylko dla administratorów..."
              rows={6}
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-[#c9a227]/10 border border-[#c9a227]/30 rounded-xl">
            <p className="text-[#c9a227] text-xs">
              <strong>Informacja:</strong> Notatki prywatne są widoczne tylko dla administratorów i służą do wewnętrznych uwag.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              Dodaj Notatkę
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              Anuluj
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
