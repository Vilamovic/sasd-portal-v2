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
    <div className="mb-8">
      {/* Clear buttons */}
      {isCS && (
        <div className="flex justify-end gap-2 mb-2">
          {selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
              title={`Usuń ${selectedIds.size} zaznaczonych notatek`}
            >
              <Trash2 className="w-3 h-3" />
              Usuń zaznaczone ({selectedIds.size})
            </button>
          )}
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
            title="Wyzeruj wszystkie notatki (CS+)"
          >
            <Trash2 className="w-3 h-3" />
            Wyzeruj wszystko
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#c9a227]" />
          Notatki Prywatne (Admin)
        </h3>
        <button
          onClick={onAddNote}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Dodaj Notatkę
        </button>
      </div>

      {/* Table */}
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
        {notes.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
            <p className="text-[#8fb5a0]">Brak notatek.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1a4d32]/30">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-6 hover:bg-[#0a2818]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {isCS && (
                    <input
                      type="checkbox"
                      checked={selectedIds.has(note.id)}
                      onChange={() => onToggleSelection(note.id)}
                      className="w-4 h-4 mt-1 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#c9a227] font-semibold">{note.admin_username}</span>
                      <span className="text-[#8fb5a0] text-xs">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <p className="text-white">{note.note}</p>
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
