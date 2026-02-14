import { Plus, Save } from 'lucide-react';
import QuillEditor from '@/src/components/shared/QuillEditor';


interface MaterialFormProps {
  isEditing: boolean;
  formTitle: string;
  formDescription: string;
  isMandatory: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onMandatoryChange: (value: boolean) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * MaterialForm - Add/Edit material form with rich text editor
 * - Title (required)
 * - Mandatory checkbox
 * - Description with Quill editor (rich text)
 * - Template presets
 */
export default function MaterialForm({
  isEditing,
  formTitle,
  formDescription,
  isMandatory,
  onTitleChange,
  onDescriptionChange,
  onMandatoryChange,
  onSubmit,
  onCancel,
}: MaterialFormProps) {
  return (
    <div className="panel-raised mb-4" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <Plus className="w-4 h-4 text-white" />
        <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
          {isEditing ? 'Edytuj Materiał' : 'Dodaj Nowy Materiał'}
        </span>
      </div>

      <div className="p-4">
        {/* Title */}
        <div className="mb-3">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>Tytuł materiału *</label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Tytuł materiału..."
            className="panel-inset w-full px-3 py-2 font-mono text-sm"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
          />
        </div>

        {/* Mandatory Checkbox */}
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isMandatory}
              onChange={(e) => onMandatoryChange(e.target.checked)}
              className="cursor-pointer"
            />
            <span className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
              Materiał obowiązkowy
            </span>
          </label>
        </div>

        {/* Rich Text Description */}
        <div className="mb-4">
          <label className="font-mono text-xs block mb-1" style={{ color: 'var(--mdt-muted-text)' }}>
            Opis
          </label>
          <QuillEditor
            value={formDescription}
            onChange={onDescriptionChange}
            placeholder="Opis materiału..."
            minHeight="200px"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSubmit}
            className="btn-win95 flex items-center gap-1"
            style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
          >
            <Save className="w-3 h-3" />
            <span className="font-mono text-xs">{isEditing ? 'Zapisz' : 'Dodaj'}</span>
          </button>
          <button
            onClick={onCancel}
            className="btn-win95 font-mono text-xs"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}
