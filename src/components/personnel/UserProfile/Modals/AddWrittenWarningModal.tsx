'use client';

import { useState, useRef } from 'react';
import { FileText, X } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/utils/discord';

interface AddWrittenWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser: any;
  user: any;
  onSuccess: () => void;
  refreshUserData?: () => Promise<void>;
}

/**
 * AddWrittenWarningModal - Modal do nadawania upomnienia pisemnego
 */
export default function AddWrittenWarningModal({
  isOpen,
  onClose,
  userId,
  currentUser,
  user,
  onSuccess,
  refreshUserData,
}: AddWrittenWarningModalProps) {
  const [writtenWarningReason, setWrittenWarningReason] = useState('');
  const [writtenWarningEvidenceLink, setWrittenWarningEvidenceLink] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!writtenWarningReason.trim()) {
      alert('Powód jest wymagany.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addPenalty({
        user_id: userId,
        created_by: currentUser.id,
        type: 'upomnienie_pisemne',
        description: writtenWarningReason.trim(),
        duration_hours: null,
        expires_at: null,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: 'upomnienie_pisemne',
        user: { username: user.username, mta_nick: user.mta_nick },
        description: writtenWarningReason.trim(),
        evidenceLink: writtenWarningEvidenceLink.trim() || null,
        durationHours: null,
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
      });

      // Refresh data
      onSuccess();
      if (refreshUserData) await refreshUserData();

      setWrittenWarningReason('');
      setWrittenWarningEvidenceLink('');
      onClose();
      alert('Upomnienie pisemne nadane.');
    } catch (error) {
      console.error('Error adding written warning:', error);
      alert('Błąd podczas nadawania upomnienia.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleClose = () => {
    setWrittenWarningReason('');
    setWrittenWarningEvidenceLink('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl border border-orange-500/30 p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-orange-400" />
            Nadaj Upomnienie Pisemne
          </h3>
          <button
            onClick={handleClose}
            className="text-[#8fb5a0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Reason */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Powód upomnienia</label>
            <textarea
              value={writtenWarningReason}
              onChange={(e) => setWrittenWarningReason(e.target.value)}
              placeholder="Opisz powód nadania upomnienia..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Evidence Link (Optional) */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
              Link do dowodów <span className="text-xs text-[#8fb5a0]/70">(opcjonalny)</span>
            </label>
            <input
              type="url"
              value={writtenWarningEvidenceLink}
              onChange={(e) => setWrittenWarningEvidenceLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <p className="text-orange-400 text-xs">
              <strong>Uwaga:</strong> Upomnienie pisemne zostanie zapisane w kartotece użytkownika.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <FileText className="w-4 h-4" />
              Nadaj Upomnienie
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
