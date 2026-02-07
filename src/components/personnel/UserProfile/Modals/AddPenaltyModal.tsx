'use client';

import { useState, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/utils/discord';

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
        evidenceLink: penaltyEvidenceLink.trim() || null,
        durationHours: duration,
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl border border-red-500/30 p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Nadaj Karę
          </h3>
          <button
            onClick={handleClose}
            className="text-[#8fb5a0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Suspension Subtype */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Rodzaj zawieszenia</label>
            <select
              value={suspensionSubtype}
              onChange={(e) => setSuspensionSubtype(e.target.value as SuspensionSubtype)}
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              <option value="zawieszenie_sluzba">Zawieszenie frakcyjne (służba)</option>
              <option value="zawieszenie_dywizja">Zawieszenie dywizyjne</option>
              <option value="zawieszenie_uprawnienia">Zawieszenie uprawnieniowe</option>
              <option value="zawieszenie_poscigowe">Zawieszenie pościgowe</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
              Powód zawieszenia
            </label>
            <textarea
              value={penaltyReason}
              onChange={(e) => setPenaltyReason(e.target.value)}
              placeholder="Opisz powód nadania kary..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          {/* Evidence Link (Optional) */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">
              Link do dowodów <span className="text-xs text-[#8fb5a0]/70">(opcjonalny)</span>
            </label>
            <input
              type="url"
              value={penaltyEvidenceLink}
              onChange={(e) => setPenaltyEvidenceLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Czas trwania (godziny)</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {['1', '6', '12', '24', '48', '72', '168', '720'].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setPenaltyDuration(hours)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    penaltyDuration === hours
                      ? 'bg-red-500 text-white'
                      : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32] hover:bg-[#133524]'
                  }`}
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
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-xs">
              <strong>Uwaga:</strong> Zawieszenie uniemożliwi użytkownikowi dostęp do egzaminów i innych funkcji przez podany czas.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              Nadaj Karę
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
