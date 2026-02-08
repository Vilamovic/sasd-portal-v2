'use client';

import BadgeEditor from './InlineEditors/BadgeEditor';
import DivisionEditor from './InlineEditors/DivisionEditor';
import PermissionsEditor from './InlineEditors/PermissionsEditor';

interface ProfileHeaderProps {
  user: any;
  currentUser: any;
  userId: string;
  isHCS: boolean;
  isCS: boolean;
  isDev: boolean;
  onUpdate: () => void;
}

/**
 * Profile Header - Avatar, nick, role badge, editable fields
 */
export default function ProfileHeader({ user, currentUser, userId, isHCS, isCS, isDev, onUpdate }: ProfileHeaderProps) {
  return (
    <div className="mb-4 panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2">
        <h2 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          Profil Użytkownika
        </h2>
      </div>

      <div className="p-4">
        <div className="flex items-start gap-4">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.username}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full"
              style={{ border: '2px solid var(--mdt-subtle-text)' }}
            />
          )}
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex flex-col">
                <h2 className="font-mono text-xl font-bold" style={{ color: 'var(--mdt-content-text)' }}>{user.mta_nick || user.username}</h2>
                <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>@{user.username}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold font-mono ${
                user.role === 'dev' ? 'bg-pink-600 text-white' :
                user.role === 'hcs' ? 'bg-red-900 text-white' :
                user.role === 'cs' ? 'bg-red-600 text-white' :
                user.role === 'deputy' ? 'bg-teal-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {user.role?.toUpperCase()}
              </span>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <BadgeEditor
                user={user}
                currentUser={currentUser}
                userId={userId}
                isHCS={isHCS}
                isCS={isCS}
                onUpdate={onUpdate}
              />
              <DivisionEditor
                user={user}
                currentUser={currentUser}
                userId={userId}
                isHCS={isHCS}
                isCS={isCS}
                onUpdate={onUpdate}
              />
              <PermissionsEditor
                user={user}
                currentUser={currentUser}
                userId={userId}
                isHCS={isHCS}
                isCS={isCS}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
