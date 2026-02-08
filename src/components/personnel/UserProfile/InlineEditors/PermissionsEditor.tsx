'use client';

import { useState, useRef } from 'react';
import { Users, Edit3, Save, X } from 'lucide-react';
import { updateUserPermissions } from '@/src/lib/db/users';
import { notifyPermissionChange } from '@/src/lib/webhooks/personnel';

interface PermissionsEditorProps {
  user: any;
  currentUser: any;
  userId: string;
  isHCS: boolean;
  isCS: boolean;
  onUpdate: () => void;
}

const permissions = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch', 'Pościgowe'];

/**
 * Permissions Inline Editor - Edycja uprawnień z checkboxami
 * Multi-select checkboxes + Discord webhooks dla każdej zmiany
 */
export default function PermissionsEditor({ user, currentUser, userId, isHCS, isCS, onUpdate }: PermissionsEditorProps) {
  const [editing, setEditing] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<string[]>(user?.permissions || []);
  const submittingRef = useRef(false);

  // CS/HCS/Dev can edit all users (isCS includes cs/hcs/dev from role hierarchy)
  const canEdit = isCS;

  const togglePermission = (perm: string) => {
    if (tempPermissions.includes(perm)) {
      setTempPermissions(tempPermissions.filter((p) => p !== perm));
    } else {
      setTempPermissions([...tempPermissions, perm]);
    }
  };

  const handleSave = async () => {
    if (submittingRef.current || !user || !currentUser) return;
    submittingRef.current = true;

    try {
      const oldPermissions = user.permissions || [];
      const { error } = await updateUserPermissions(userId, tempPermissions);
      if (error) throw error;

      // Discord webhooks - powiadomienie o każdej zmianie
      const added = tempPermissions.filter((p: string) => !oldPermissions.includes(p));
      const removed = oldPermissions.filter((p: string) => !tempPermissions.includes(p));

      for (const permission of added) {
        await notifyPermissionChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          permission,
          isGranted: true,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
        });
      }

      for (const permission of removed) {
        await notifyPermissionChange({
          user: { username: user.username, mta_nick: user.mta_nick },
          permission,
          isGranted: false,
          createdBy: { username: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Admin', mta_nick: undefined },
        });
      }

      setEditing(false);
      onUpdate();
      alert('Uprawnienia zaktualizowane.');
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Błąd podczas aktualizacji uprawnień.');
    } finally {
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setTempPermissions(user?.permissions || []);
  };

  return (
    <div className="panel-inset p-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" style={{ color: 'var(--mdt-muted-text)' }} />
          <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-muted-text)' }}>Uprawnienia</span>
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
            {permissions.map((perm) => (
              <button
                key={perm}
                onClick={() => togglePermission(perm)}
                className="btn-win95 text-xs py-0.5 px-2 font-bold"
                style={tempPermissions.includes(perm) ? { backgroundColor: '#2563eb', color: '#fff', borderColor: '#60a5fa #1e40af #1e40af #60a5fa' } : {}}
              >
                {perm}
              </button>
            ))}
          </div>
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
          {user?.permissions && user.permissions.length > 0 ? (
            user.permissions.map((perm: string) => (
              <span
                key={perm}
                className="px-1 py-0.5 text-xs font-bold font-mono bg-blue-600 text-white"
              >
                {perm}
              </span>
            ))
          ) : (
            <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>Brak</span>
          )}
        </div>
      )}
    </div>
  );
}
