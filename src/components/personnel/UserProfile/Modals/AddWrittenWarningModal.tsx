'use client';

import { useState, useRef } from 'react';
import { FileText } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/lib/webhooks/personnel';

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
        duration_hours: undefined,
        expires_at: undefined,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: 'upomnienie_pisemne',
        user: { username: user.username, mta_nick: user.mta_nick },
        description: writtenWarningReason.trim(),
        evidenceLink: writtenWarningEvidenceLink.trim() || undefined,
        durationHours: undefined,
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Nadaj Upomnienie Pisemne
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
          {/* Reason */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Powód upomnienia</label>
            <textarea
              value={writtenWarningReason}
              onChange={(e) => setWrittenWarningReason(e.target.value)}
              placeholder="Opisz powód nadania upomnienia..."
              rows={4}
              className="panel-inset w-full px-3 py-2 font-mono text-sm resize-none"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Evidence Link (Optional) */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Link do dowodów <span className="font-normal" style={{ color: 'var(--mdt-muted-text)' }}>(opcjonalny)</span>
            </label>
            <input
              type="url"
              value={writtenWarningEvidenceLink}
              onChange={(e) => setWrittenWarningEvidenceLink(e.target.value)}
              placeholder="https://..."
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Warning */}
          <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <p className="font-mono text-xs" style={{ color: 'var(--mdt-content-text)' }}>
              <strong>Uwaga:</strong> Upomnienie pisemne zostanie zapisane w kartotece użytkownika.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <FileText className="w-4 h-4" />
              Nadaj Upomnienie
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
