'use client';

import { useState, useRef } from 'react';
import { Award, X, Save, Plus, Minus } from 'lucide-react';
import { addPenalty } from '@/src/lib/db/penalties';
import { notifyPenalty } from '@/src/utils/discord';

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
        duration_hours: null,
      });
      if (error) throw error;

      // Send Discord notification
      await notifyPenalty({
        type: plusMinusType,
        user: { username: user.username, mta_nick: user.mta_nick },
        description: plusMinusReason.trim(),
        createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: null },
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-[#c9a227]" />
            Dodaj PLUS/MINUS
          </h3>
          <button
            onClick={handleClose}
            className="text-[#8fb5a0] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Typ</label>
            <div className="flex gap-3">
              <button
                onClick={() => setPlusMinusType('plus')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  plusMinusType === 'plus'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                <Plus className="w-5 h-5" />
                PLUS
              </button>
              <button
                onClick={() => setPlusMinusType('minus')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                  plusMinusType === 'minus'
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                <Minus className="w-5 h-5" />
                MINUS
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[#8fb5a0] text-sm font-semibold mb-2">Powód</label>
            <textarea
              value={plusMinusReason}
              onChange={(e) => setPlusMinusReason(e.target.value)}
              placeholder="Opisz powód nadania PLUS/MINUS..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              Dodaj
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
