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
  onClick?: () => void;
}

export default function GangCard({ gang, editMode, canManage, onEdit, onDelete, onClick }: GangCardProps) {
  return (
    <div
      className={`panel-raised ${!editMode ? 'cursor-pointer' : ''}`}
      style={{ backgroundColor: 'var(--mdt-btn-face)' }}
      onClick={onClick}
    >
      {/* Header bar */}
      <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: '#059669' }}>
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3 text-white" />
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wider uppercase text-white truncate">
            {gang.title}
          </span>
        </div>
        {canManage && editMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(gang); }}
              className="text-white hover:opacity-70 p-0.5"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(gang.id, gang.title); }}
              className="text-white hover:opacity-70 p-0.5"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content preview */}
      <div className="p-3 max-h-24 overflow-hidden relative">
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
        {!editMode && gang.description && (
          <div className="absolute bottom-0 left-0 right-0 h-6" style={{ background: 'linear-gradient(transparent, var(--mdt-btn-face))' }} />
        )}
      </div>
      {!editMode && (
        <div className="px-3 pb-2">
          <span className="font-mono text-[10px]" style={{ color: 'var(--mdt-muted-text)' }}>Kliknij aby zobaczyć szczegóły</span>
        </div>
      )}
    </div>
  );
}
