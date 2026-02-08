import { Trash2 } from 'lucide-react';

/**
 * EditModeInfo - Edit mode info box
 * - Displayed when edit mode is active
 * - Shows instructions for managing materials
 */
export default function EditModeInfo() {
  return (
    <div className="panel-inset mb-4 p-3 flex items-center gap-3" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
      <Trash2 className="w-4 h-4 flex-shrink-0" style={{ color: '#c41e1e' }} />
      <div>
        <p className="font-mono text-sm font-bold" style={{ color: 'var(--mdt-content-text)' }}>Tryb zarządzania aktywny</p>
        <p className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>
          Kliknij &quot;Edytuj&quot; lub &quot;Usuń&quot; na kafelku aby zarządzać materiałami
        </p>
      </div>
    </div>
  );
}
