import { Trash2 } from 'lucide-react';

/**
 * EditModeInfo - Edit mode info box
 * - Displayed when edit mode is active
 * - Shows instructions for managing materials
 */
export default function EditModeInfo() {
  return (
    <div className="mb-6 glass-strong rounded-xl border border-red-500/30 p-4 shadow-lg bg-red-500/5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Tryb zarządzania aktywny</p>
          <p className="text-[#8fb5a0] text-xs">
            Kliknij "Edytuj" lub "Usuń" na kafelku aby zarządzać materiałami
          </p>
        </div>
      </div>
    </div>
  );
}
