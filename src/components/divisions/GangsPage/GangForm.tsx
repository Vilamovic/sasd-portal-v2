'use client';

import { Save, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('@/src/components/shared/QuillEditor'), { ssr: false });

interface GangFormProps {
  isEditing: boolean;
  formTitle: string;
  formDescription: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function GangForm({
  isEditing,
  formTitle,
  formDescription,
  onTitleChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}: GangFormProps) {
  return (
    <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      <div className="px-3 py-1" style={{ backgroundColor: '#059669' }}>
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          {isEditing ? 'Edytuj gang' : 'Dodaj gang'}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <div>
          <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
            Nazwa gangu *
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Nazwa gangu lub organizacji"
            className="panel-inset w-full px-2 py-1 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
          />
        </div>

        {/* Description (Quill) */}
        <div>
          <label className="font-mono text-xs font-bold mb-1 block" style={{ color: 'var(--mdt-muted-text)' }}>
            Opis
          </label>
          <QuillEditor
            value={formDescription}
            onChange={onDescriptionChange}
            placeholder="Opis gangu, terytorium, aktywność..."
            minHeight="150px"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSubmit}
            className="btn-win95 flex items-center gap-1 text-xs py-1 px-3"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Save className="w-3 h-3" />
            {isEditing ? 'Zaktualizuj' : 'Dodaj'}
          </button>
          <button onClick={onCancel} className="btn-win95 flex items-center gap-1 text-xs py-1 px-3">
            <X className="w-3 h-3" />
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
