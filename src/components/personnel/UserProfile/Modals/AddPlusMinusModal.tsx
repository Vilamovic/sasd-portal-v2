'use client';

import { useState, useRef } from 'react';
import { Award, X, Save, Plus, Minus } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/lib/webhooks/personnel';

interface AddPlusMinusModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  currentUser: any;
  user: any;
  onSuccess: () => void;
  refreshUserData?: () => Promise<void>;
}

/**
 * AddPlusMinusModal - Modal do dodawania PLUS/MINUS
 */
export default function AddPlusMinusModal({
  isOpen,
  onClose,
  userId,
  currentUser,
  user,
  onSuccess,
  refreshUserData,
}: AddPlusMinusModalProps) {
  const [plusMinusType, setPlusMinusType] = useState<'plus' | 'minus'>('plus');
  const [plusMinusReason, setPlusMinusReason] = useState('');
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current || !currentUser) return;
    if (!plusMinusReason.trim()) {
      alert('Powód jest wymagany.');
      return;
    }

    submittingRef.current = true;
    try {
      const { error } = await addPenalty({
        user_id: userId,
        created_by: currentUser.id,
        type: plusMinusType,
        description: plusMinusReason.trim(),
        duration_hours: undefined,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: plusMinusType,
        user: { username: user.username, mta_nick: user.mta_nick },
        description: plusMinusReason.trim(),
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
      });

      // Refresh data
      onSuccess();
      if (refreshUserData) await refreshUserData();

      setPlusMinusReason('');
      setPlusMinusType('plus');
      onClose();
      alert(`${plusMinusType === 'plus' ? 'PLUS' : 'MINUS'} dodany.`);
    } catch (error) {
      console.error('Error adding PLUS/MINUS:', error);
      alert('Błąd podczas dodawania.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleClose = () => {
    setPlusMinusReason('');
    setPlusMinusType('plus');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="panel-raised max-w-lg w-full mx-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white flex items-center gap-2">
            <Award className="w-4 h-4" />
            Dodaj PLUS/MINUS
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
          {/* Type Selection */}
          <div>
            <label className="block font-mono text-sm font-bold mb-2" style={{ color: 'var(--mdt-muted-text)' }}>Typ</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPlusMinusType('plus')}
                className="btn-win95 flex-1 flex items-center justify-center gap-2"
                style={plusMinusType === 'plus' ? { backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' } : {}}
              >
                <Plus className="w-4 h-4" />
                PLUS
              </button>
              <button
                onClick={() => setPlusMinusType('minus')}
                className="btn-win95 flex-1 flex items-center justify-center gap-2"
                style={plusMinusType === 'minus' ? { backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' } : {}}
              >
                <Minus className="w-4 h-4" />
                MINUS
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-mono text-sm font-bold mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Powód</label>
            <textarea
              value={plusMinusReason}
              onChange={(e) => setPlusMinusReason(e.target.value)}
              placeholder="Opisz powód nadania PLUS/MINUS..."
              rows={4}
              className="panel-inset w-full px-3 py-2 font-mono text-sm resize-none"
              style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              className="btn-win95 flex-1 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Save className="w-4 h-4" />
              Dodaj
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
