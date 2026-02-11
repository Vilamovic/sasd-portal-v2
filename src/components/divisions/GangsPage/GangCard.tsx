'use client';

import { Edit3, Trash2, Users } from 'lucide-react';

interface GangCardProps {
  gang: {
    id: string;
    title: string;
    description: string | null;
    [key: string]: any;
  };
  editMode: boolean;
  canManage: boolean;
  onEdit: (gang: any) => void;
  onDelete: (gangId: string, gangTitle: string) => void;
}

export default function GangCard({ gang, editMode, canManage, onEdit, onDelete }: GangCardProps) {
  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Header bar */}
      <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: '#10b981' }}>
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 text-white" />
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white truncate">
            {gang.title}
          </span>
        </div>
        {canManage && editMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(gang)}
              className="text-white hover:opacity-70 p-0.5"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(gang.id, gang.title)}
              className="text-white hover:opacity-70 p-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {gang.description ? (
          <div
            className="font-mono text-xs prose-sm max-w-none"
            style={{ color: 'var(--mdt-content-text)' }}
            dangerouslySetInnerHTML={{
              __html: gang.description
                .replace(/&nbsp;/g, ' ')
                .replace(/\u00A0/g, ' '),
            }}
          />
        ) : (
          <p className="font-mono text-xs italic" style={{ color: 'var(--mdt-muted-text)' }}>
            Brak opisu
          </p>
        )}
      </div>
    </div>
  );
}
