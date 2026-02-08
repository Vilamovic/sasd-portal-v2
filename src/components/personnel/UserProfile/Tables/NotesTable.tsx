'use client';

import { FileText, Plus, Trash2 } from 'lucide-react';
import { formatDate } from '@/src/components/shared/constants';

interface NotesTableProps {
  notes: any[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onClear: () => void;
  onDeleteSelected: () => void;
  onAddNote: () => void;
  isCS: boolean;
}

/**
 * Notes Table - Tabela notatek prywatnych (Admin)
 */
export default function NotesTable({
  notes,
  selectedIds,
  onToggleSelection,
  onClear,
  onDeleteSelected,
  onAddNote,
  isCS,
}: NotesTableProps) {
  return (
    <div className="mb-4">
      {/* Clear buttons */}
      {isCS && (
        <div className="flex justify-end gap-2 mb-2">
          {selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="btn-win95 flex items-center gap-2 text-sm"
              style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
              title={`Usuń ${selectedIds.size} zaznaczonych notatek`}
            >
              <Trash2 className="w-3 h-3" />
              Usuń zaznaczone ({selectedIds.size})
            </button>
          )}
          <button
            onClick={onClear}
            className="btn-win95 flex items-center gap-2 text-sm"
            style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
            title="Wyzeruj wszystkie notatki (CS+)"
          >
            <Trash2 className="w-3 h-3" />
            Wyzeruj wszystko
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 flex items-center gap-2 flex-1 mr-4">
          <FileText className="w-4 h-4 text-white" />
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
            Notatki Prywatne (Admin)
          </h3>
        </div>
        <button
          onClick={onAddNote}
          className="btn-win95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Dodaj Notatkę
        </button>
      </div>

      {/* Table */}
      <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {notes.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--mdt-muted-text)' }} />
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>Brak notatek.</p>
          </div>
        ) : (
          <div>
            {notes.map((note, index) => (
              <div
                key={note.id}
                className="px-4 py-3 border-b border-gray-300 last:border-b-0"
                style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
              >
                <div className="flex items-start gap-3">
                  {isCS && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(note.id)}
                      onChange={() => onToggleSelection(note.id)}
                      className="mt-1 cursor-pointer"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>{note.admin_username}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>{note.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
