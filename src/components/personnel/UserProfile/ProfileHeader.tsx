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
    <div className="mb-8 glass-strong rounded-2xl border border-[#1a4d32]/50 p-8 shadow-xl">
      <div className="flex items-start gap-6">
        {user.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.username}
            width={96}
            height={96}
            className="w-24 h-24 rounded-2xl border-4 border-[#1a4d32] shadow-lg"
          />
        )}
        <div className="flex-grow">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex flex-col">
              <h2 className="text-3xl font-bold text-white">{user.mta_nick || user.username}</h2>
              <p className="text-[#8fb5a0] text-sm">@{user.username}</p>
            </div>
            <span className={`px-3 py-1 rounded text-xs font-bold ${
              user.role === 'dev' ? 'bg-pink-600' :
              user.role === 'hcs' ? 'bg-red-900' :
              user.role === 'cs' ? 'bg-red-600' :
              user.role === 'deputy' ? 'bg-teal-600' :
              'bg-gray-600'
            } text-white`}>
              {user.role?.toUpperCase()}
            </span>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
  );
}
