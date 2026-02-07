import { Plus, Save } from 'lucide-react';

interface MaterialFormProps {
  isEditing: boolean;
  formTitle: string;
  formDescription: string;
  formFileUrl: string;
  formFileType: string;
  formThumbnailUrl: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onFileUrlChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
  onThumbnailUrlChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * MaterialForm - Add/Edit material form
 * - Title + description + file URL + file type + thumbnail URL
 * - Validation messages
 * - Submit + Cancel buttons
 */
export default function MaterialForm({
  isEditing,
  formTitle,
  formDescription,
  formFileUrl,
  formFileType,
  formThumbnailUrl,
  onTitleChange,
  onDescriptionChange,
  onFileUrlChange,
  onFileTypeChange,
  onThumbnailUrlChange,
  onSubmit,
  onCancel,
}: MaterialFormProps) {
  return (
    <div className="mb-6 glass-strong rounded-2xl border border-[#c9a227]/30 p-6 shadow-xl animate-border-glow">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-[#c9a227]" />
        {isEditing ? 'Edytuj Materiał' : 'Dodaj Nowy Materiał'}
      </h3>

      <div className="space-y-4">
        {/* Title */}
        <input
          type="text"
          value={formTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Tytuł materiału..."
          className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
        />

        {/* Description */}
        <textarea
          value={formDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Opis (opcjonalny)..."
          rows={3}
          className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors resize-none"
        />

        {/* File URL */}
        <input
          type="url"
          value={formFileUrl}
          onChange={(e) => onFileUrlChange(e.target.value)}
          placeholder="URL pliku (https://...)..."
          className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
        />

        {/* File Type */}
        <select
          value={formFileType}
          onChange={(e) => onFileTypeChange(e.target.value)}
          className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors"
        >
          <option value="pdf">PDF</option>
          <option value="image">Obraz</option>
          <option value="video">Wideo</option>
          <option value="link">Link</option>
          <option value="other">Inne</option>
        </select>

        {/* Thumbnail URL */}
        <input
          type="url"
          value={formThumbnailUrl}
          onChange={(e) => onThumbnailUrlChange(e.target.value)}
          placeholder="URL miniaturki (opcjonalny)..."
          className="w-full px-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onSubmit}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Zapisz' : 'Dodaj'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}
