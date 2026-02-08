'use client';

import { useState, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/lib/webhooks/personnel';

interface AddPenaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser: any;
  user: any;
  onSuccess: () => void;
  refreshUserData?: () => Promise<void>;
}

type SuspensionSubtype = 'zawieszenie_sluzba' | 'zawieszenie_dywizja' | 'zawieszenie_uprawnienia' | 'zawieszenie_poscigowe';

/**
 * AddPenaltyModal - Modal do nadawania zawieszeń
 */
export default function AddPenaltyModal({
  isOpen,
  onClose,
  userId,
  currentUser,
  user,
  onSuccess,
  refreshUserData,
}: AddPenaltyModalProps) {
  const [suspensionSubtype, setSuspensionSubtype] = useState<SuspensionSubtype>('zawieszenie_sluzba');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [penaltyDuration, setPenaltyDuration] = useState('24');
  const [penaltyEvidenceLink, setPenaltyEvidenceLink] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!penaltyReason.trim()) {
      alert('Powód jest wymagany.');
      return;
    }

    // Duration validation
    const duration = parseInt(penaltyDuration);
    if (isNaN(duration) || duration <= 0) {
      alert('Czas trwania musi być liczbą większą od 0.');
      return;
    }

    // Calculate expires_at (server-based time + duration)
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();

    submittingRef.current = true;
    try {
      const { error } = await addPenalty({
        user_id: userId,
        created_by: currentUser.id,
        type: suspensionSubtype,
        description: penaltyReason.trim(),
        duration_hours: duration,
        expires_at: expiresAt,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: suspensionSubtype,
        user: { username: user.username, mta_nick: user.mta_nick },
        description: penaltyReason.trim(),
        evidenceLink: penaltyEvidenceLink.trim() || undefined,
        durationHours: duration,
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
      });

      // Refresh data
      onSuccess();
      if (refreshUserData) await refreshUserData();

      setPenaltyReason('');
      setPenaltyDuration('24');
      setPenaltyEvidenceLink('');
      setSuspensionSubtype('zawieszenie_sluzba');
      onClose();
      alert('Zawieszenie nadane.');
    } catch (error) {
      console.error('Error adding penalty:', error);
      alert('Błąd podczas nadawania kary.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleClose = () => {
    setPenaltyReason('');
    setPenaltyDuration('24');
    setPenaltyEvidenceLink('');
    setSuspensionSubtype('zawieszenie_sluzba');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: '#8b0000' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Nadaj Karę
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
          {/* Suspension Subtype */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Rodzaj zawieszenia</label>
            <select
              value={suspensionSubtype}
              onChange={(e) => setSuspensionSubtype(e.target.value as SuspensionSubtype)}
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            >
              <option value="zawieszenie_sluzba">Zawieszenie frakcyjne (służba)</option>
              <option value="zawieszenie_dywizja">Zawieszenie dywizyjne</option>
              <option value="zawieszenie_uprawnienia">Zawieszenie uprawnieniowe</option>
              <option value="zawieszenie_poscigowe">Zawieszenie pościgowe</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
              Powód zawieszenia
            </label>
            <textarea
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              placeholder="Opisz powód nadania kary..."
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
              value={penaltyEvidenceLink}
              onChange={(e) => setPenaltyEvidenceLink(e.target.value)}
              placeholder="https://..."
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Czas trwania (godziny)</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['1', '6', '12', '24', '48', '72', '168', '720'].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setPenaltyDuration(hours)}
                  className="btn-win95 font-mono text-xs"
                  style={penaltyDuration === hours ? { backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' } : {}}
                >
                  {parseInt(hours) >= 24 ? `${parseInt(hours) / 24}d` : `${hours}h`}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={penaltyDuration}
              onChange={(e) => setPenaltyDuration(e.target.value)}
              placeholder="Lub wpisz własną liczbę godzin..."
              className="panel-inset w-full px-3 py-2 font-mono text-sm"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Warning */}
          <div className="panel-inset p-2" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
            <p className="font-mono text-xs" style={{ color: '#c41e1e' }}>
              <strong>Uwaga:</strong> Zawieszenie uniemożliwi użytkownikowi dostęp do egzaminów i innych funkcji przez podany czas.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
            >
              <AlertTriangle className="w-4 h-4" />
              Nadaj Karę
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
