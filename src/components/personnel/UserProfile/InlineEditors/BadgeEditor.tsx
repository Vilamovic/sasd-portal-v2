'use client';

import { useState, useRef } from 'react';
import { Award, Edit3, Save, X } from 'lucide-react';
import { updateUserBadge, updateIsCommander } from '@/src/lib/db/users';
import { notifyBadgeChange } from '@/src/lib/webhooks/personnel';
import { BADGES } from '@/src/components/shared/constants';

interface BadgeEditorProps {
  user: any;
  currentUser: any;
  userId: string;
  isHCS: boolean;
  isCS: boolean;
  onUpdate: () => void;
}

const badges = [...BADGES];

/**
 * Badge Inline Editor - Edycja stopnia z dropdown
 * Auto-Commander: Captain III + Division → is_commander = true
 */
export default function BadgeEditor({ user, currentUser, userId, isHCS, isCS, onUpdate }: BadgeEditorProps) {
  const [editing, setEditing] = useState(false);
  const [tempStopień, setTempStopień] = useState(user?.badge || '');
  const submittingRef = useRef(false);

  // CS/HCS/Dev can edit all users (isCS includes cs/hcs/dev from role hierarchy)
  const canEdit = isCS;

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
    <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Award className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-muted-text)' }}>Stopień</span>
        </div>
        {!editing && canEdit && (
          <button
            onClick={() => setEditing(true)}
            className="font-mono text-xs"
            style={{ color: 'var(--mdt-content-text)' }}
          >
            <Edit3 className="w-3 h-3" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-1">
          <select
            value={tempStopień}
            onChange={(e) => setTempStopień(e.target.value)}
            className="panel-inset w-full px-2 py-1 font-mono text-xs"
            style={{ backgroundColor: 'var(--mdt-panel-alt)', color: 'var(--mdt-content-text)', outline: 'none' }}
          >
            <option value="">Brak</option>
            {badges.map((badge) => (
              <option key={badge} value={badge}>
                {badge}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="btn-win95 flex-1 flex items-center justify-center gap-1 text-xs py-0.5"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Save className="w-3 h-3" />
              Zapisz
            </button>
            <button
              onClick={handleCancel}
              className="btn-win95 flex-1 flex items-center justify-center gap-1 text-xs py-0.5"
            >
              <X className="w-3 h-3" />
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <p className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>{user?.badge || 'Brak'}</p>
      )}
    </div>
  );
}
