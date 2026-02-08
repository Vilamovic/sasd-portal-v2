'use client';

import { useState, useRef } from 'react';
import { Shield, Edit3, Save, X } from 'lucide-react';
import { updateUserDivision, updateIsCommander } from '@/src/lib/db/users';
import { notifyDivisionChange } from '@/src/lib/webhooks/personnel';
import { getDivisionColor } from '@/src/components/shared/constants';

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
    <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-muted-text)' }}>Dywizja</span>
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
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setTempDivision('')}
              className="btn-win95 text-xs py-0.5 px-2"
              style={tempDivision === '' ? { backgroundColor: 'var(--mdt-subtle-text)', color: '#fff', borderColor: 'var(--mdt-muted-text) #fff #fff var(--mdt-muted-text)' } : {}}
            >
              Brak
            </button>
            <button
              onClick={() => setTempDivision('FTO')}
              className="btn-win95 text-xs py-0.5 px-2 font-bold"
              style={tempDivision === 'FTO' ? { backgroundColor: '#c9a227', color: '#000', borderColor: '#555 #fff #fff #555' } : {}}
            >
              FTO
            </button>
            <button
              onClick={() => setTempDivision('SS')}
              className="btn-win95 text-xs py-0.5 px-2 font-bold"
              style={tempDivision === 'SS' ? { backgroundColor: '#ff8c00', color: '#fff', borderColor: '#555 #fff #fff #555' } : {}}
            >
              SS
            </button>
            <button
              onClick={() => setTempDivision('DTU')}
              className="btn-win95 text-xs py-0.5 px-2 font-bold"
              style={tempDivision === 'DTU' ? { backgroundColor: '#60a5fa', color: '#000', borderColor: '#555 #fff #fff #555' } : {}}
            >
              DTU
            </button>
            <button
              onClick={() => setTempDivision('GU')}
              className="btn-win95 text-xs py-0.5 px-2 font-bold"
              style={tempDivision === 'GU' ? { backgroundColor: '#10b981', color: '#fff', borderColor: '#555 #fff #fff #555' } : {}}
            >
              GU
            </button>
          </div>
          {tempDivision && (
            <label className="flex items-center gap-2 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
              <input
                type="checkbox"
                checked={tempIsCommander}
                onChange={(e) => setTempIsCommander(e.target.checked)}
              />
              Commander
            </label>
          )}
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
        <div className="flex flex-wrap gap-1">
          {user?.division ? (
            <span className={`px-1 py-0.5 text-xs font-bold font-mono ${getDivisionColor(user.division)}`}>
              {user.division}{user.is_commander ? ' CMD' : ''}
            </span>
          ) : (
            <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Brak</span>
          )}
        </div>
      )}
    </div>
  );
}
