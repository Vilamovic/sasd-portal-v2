'use client';

import { useState, useRef } from 'react';
import { Shield, Edit3, Save, X } from 'lucide-react';
import { updateUserDivision, updateIsCommander } from '@/src/lib/db/users';
import { notifyDivisionChange } from '@/src/lib/webhooks/personnel';

interface DivisionEditorProps {
  user: any;
  currentUser: any;
  userId: string;
  isHCS: boolean;
  isCS: boolean;
  onUpdate: () => void;
}

/**
 * Division Inline Editor - Edycja dywizji z przyciskami
 * Single-select buttons + Commander checkbox
 */
export default function DivisionEditor({ user, currentUser, userId, isHCS, isCS, onUpdate }: DivisionEditorProps) {
  const [editing, setEditing] = useState(false);
  const [tempDivision, setTempDivision] = useState(user?.division || '');
  const [tempIsCommander, setTempIsCommander] = useState(user?.is_commander || false);
  const submittingRef = useRef(false);

  // CS/HCS/Dev can edit all users (isCS includes cs/hcs/dev from role hierarchy)
  const canEdit = isCS;

  const getDivisionColor = (division: string | null) => {
    switch (division) {
      case 'FTO':
        return 'bg-[#c9a227] text-[#020a06]';
      case 'SS':
        return 'bg-[#ff8c00] text-white';
      case 'DTU':
        return 'bg-[#60a5fa] text-[#020a06]';
      case 'GU':
        return 'bg-[#10b981] text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const handleSave = async () => {
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldDivision = user.division;

      // Update division
      const { error: divError } = await updateUserDivision(userId, tempDivision || null);
      if (divError) throw divError;

      // Update commander status
      const { error: cmdError } = await updateIsCommander(userId, tempIsCommander);
      if (cmdError) throw cmdError;

      // Discord webhook
      if (oldDivision !== tempDivision) {
        if (tempDivision) {
          // Nadanie dywizji
          await notifyDivisionChange({
            user: { username: user.username, mta_nick: user.mta_nick },
            division: tempDivision,
            isGranted: true,
            isCommander: tempIsCommander,
            createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
          });
        } else if (oldDivision) {
          // Odebranie dywizji
          await notifyDivisionChange({
            user: { username: user.username, mta_nick: user.mta_nick },
            division: oldDivision,
            isGranted: false,
            isCommander: false,
            createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
          });
        }
      }

      setEditing(false);
      onUpdate();
      alert('Dywizja zaktualizowana.');
    } catch (error) {
      console.error('Error updating division:', error);
      alert('Błąd podczas aktualizacji dywizji.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTempDivision(user?.division || '');
    setTempIsCommander(user?.is_commander || false);
  };

  return (
    <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#c9a227]" />
          <span className="text-[#8fb5a0] text-sm">Dywizja</span>
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
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTempDivision('')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tempDivision === ''
                  ? 'bg-gray-600 text-white border-2 border-gray-400'
                  : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32] hover:bg-[#133524]'
              }`}
            >
              Brak
            </button>
            <button
              onClick={() => setTempDivision('FTO')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tempDivision === 'FTO'
                  ? 'bg-[#c9a227] text-[#020a06] border-2 border-[#e6b830]'
                  : 'bg-[#0a2818] text-[#c9a227] border border-[#c9a227]/30 hover:bg-[#c9a227]/10'
              }`}
            >
              FTO
            </button>
            <button
              onClick={() => setTempDivision('SS')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tempDivision === 'SS'
                  ? 'bg-[#ff8c00] text-white border-2 border-[#ff8c00]'
                  : 'bg-[#0a2818] text-[#ff8c00] border border-[#ff8c00]/30 hover:bg-[#ff8c00]/10'
              }`}
            >
              SS
            </button>
            <button
              onClick={() => setTempDivision('DTU')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tempDivision === 'DTU'
                  ? 'bg-[#60a5fa] text-[#020a06] border-2 border-[#60a5fa]'
                  : 'bg-[#0a2818] text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/10'
              }`}
            >
              DTU
            </button>
            <button
              onClick={() => setTempDivision('GU')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                tempDivision === 'GU'
                  ? 'bg-[#10b981] text-white border-2 border-[#10b981]'
                  : 'bg-[#0a2818] text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/10'
              }`}
            >
              GU
            </button>
          </div>
          {tempDivision && (
            <label className="flex items-center gap-2 text-sm text-[#8fb5a0]">
              <input
                type="checkbox"
                checked={tempIsCommander}
                onChange={(e) => setTempIsCommander(e.target.checked)}
                className="rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227]"
              />
              Commander
            </label>
          )}
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
        <div className="flex flex-wrap gap-1">
          {user?.division ? (
            <span className={`px-2 py-1 rounded text-xs font-bold ${getDivisionColor(user.division)}`}>
              {user.division}{user.is_commander ? ' CMD' : ''}
            </span>
          ) : (
            <span className="text-white">Brak</span>
          )}
        </div>
      )}
    </div>
  );
}
