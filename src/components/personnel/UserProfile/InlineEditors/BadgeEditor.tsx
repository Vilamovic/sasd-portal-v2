'use client';

import { useState, useRef } from 'react';
import { Award, Edit3, Save, X } from 'lucide-react';
import { updateUserBadge, updateIsCommander } from '@/src/lib/db/users';
import { notifyBadgeChange } from '@/src/lib/webhooks/personnel';

interface BadgeEditorProps {
  user: any;
  currentUser: any;
  userId: string;
  isHCS: boolean;
  isCS: boolean;
  onUpdate: () => void;
}

const badges = [
  'Trainee',
  'Deputy Sheriff I',
  'Deputy Sheriff II',
  'Deputy Sheriff III',
  'Senior Deputy Sheriff',
  'Sergeant I',
  'Sergeant II',
  'Detective I',
  'Detective II',
  'Detective III',
  'Lieutenant',
  'Captain I',
  'Captain II',
  'Captain III',
  'Area Commander',
  'Division Chief',
  'Assistant Sheriff',
  'Undersheriff',
  'Sheriff'
];

/**
 * Badge Inline Editor - Edycja stopnia z dropdown
 * Auto-Commander: Captain III + Division → is_commander = true
 */
export default function BadgeEditor({ user, currentUser, userId, isHCS, isCS, onUpdate }: BadgeEditorProps) {
  const [editing, setEditing] = useState(false);
  const [tempStopień, setTempStopień] = useState(user?.badge || '');
  const submittingRef = useRef(false);

  const canEdit = isHCS || (isCS && (user?.role === 'trainee' || user?.role === 'deputy'));

  const handleSave = async () => {
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldBadge = user.badge;
      const { error } = await updateUserBadge(userId, tempStopień || null);
      if (error) throw error;

      // Auto-Commander: Captain III + Division → is_commander = true
      let autoCommander = false;
      if (tempStopień === 'Captain III' && user.division) {
        const { error: commanderError } = await updateIsCommander(userId, true);
        if (!commanderError) {
          autoCommander = true;
        }
      }

      // Discord webhook
      if (oldBadge !== tempStopień) {
        const badgesList = [
          'Trainee', 'Deputy Sheriff I', 'Deputy Sheriff II', 'Deputy Sheriff III',
          'Senior Deputy Sheriff', 'Sergeant I', 'Sergeant II',
          'Detective I', 'Detective II', 'Detective III',
          'Lieutenant', 'Captain I', 'Captain II', 'Captain III',
          'Area Commander', 'Division Chief', 'Assistant Sheriff', 'Undersheriff', 'Sheriff'
        ];
        const oldIndex = badgesList.indexOf(oldBadge || '');
        const newIndex = badgesList.indexOf(tempStopień || '');
        const isPromotion = newIndex > oldIndex;

        await notifyBadgeChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          oldBadge: oldBadge || 'Brak',
          newBadge: tempStopień || 'Brak',
          isPromotion,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
        });
      }

      setEditing(false);
      onUpdate();
      alert('Stopień zaktualizowany.' + (autoCommander ? ' Automatycznie nadano funkcję Commander.' : ''));
    } catch (error) {
      console.error('Error updating badge:', error);
      alert('Błąd podczas aktualizacji stopnia.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTempStopień(user?.badge || '');
  };

  return (
    <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#c9a227]" />
          <span className="text-[#8fb5a0] text-sm">Stopień</span>
        </div>
        {!editing && canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="text-[#c9a227] hover:text-[#e6b830] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <select
            value={tempStopień}
            onChange={(e) => setTempStopień(e.target.value)}
            className="w-full px-3 py-2 bg-[#0a2818]/50 border border-[#1a4d32] rounded-lg text-white text-sm focus:outline-none focus:border-[#c9a227]"
          >
            <option value="">Brak</option>
            {badges.map((badge) => (
              <option key={badge} value={badge}>
                {badge}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-3 h-3" />
              Zapisz
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0a2818] text-white text-xs rounded-lg hover:bg-[#133524] transition-colors"
            >
              <X className="w-3 h-3" />
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <p className="text-white font-semibold">{user?.badge || 'Brak'}</p>
      )}
    </div>
  );
}
