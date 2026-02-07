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

  const canEdit = isHCS || (isCS && (user?.role === 'trainee' || user?.role === 'deputy'));

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
    <div className="glass-medium rounded-xl p-4 border border-[#1a4d32]/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#c9a227]" />
          <span className="text-[#8fb5a0] text-sm">Uprawnienia</span>
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
            {permissions.map((perm) => (
              <button
                key={perm}
                onClick={() => togglePermission(perm)}
                className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                  tempPermissions.includes(perm)
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#0a2818] text-[#8fb5a0] border border-[#1a4d32]'
                }`}
              >
                {perm}
              </button>
            ))}
          </div>
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
          {user?.permissions && user.permissions.length > 0 ? (
            user.permissions.map((perm: string) => (
              <span
                key={perm}
                className="px-2 py-1 rounded text-xs font-bold bg-blue-600 text-white"
              >
                {perm}
              </span>
            ))
          ) : (
            <span className="text-white">Brak</span>
          )}
        </div>
      )}
    </div>
  );
}
