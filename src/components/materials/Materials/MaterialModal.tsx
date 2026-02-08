import { Edit3, Save, X, Maximize2, Minimize2 } from 'lucide-react';
import QuillEditor from '@/src/components/shared/QuillEditor';

interface MaterialModalProps {
  selectedMaterial: any | null;
  editing: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
  isAdmin: boolean;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}

/**
 * MaterialModal - Combined modal dla materiałów
 *
 * Modes:
 * 1. View Mode - read-only content display
 * 2. Edit Mode - WYSIWYG editor in modal
 * 3. Fullscreen Mode - WYSIWYG editor fullscreen
 *
 * Features:
 * - Shared QuillEditor integration
 * - Fullscreen toggle
 * - MDT Terminal styling
 */
export default function MaterialModal({
  selectedMaterial,
  editing,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  fullscreen,
  setFullscreen,
  isAdmin,
  onStartEdit,
  onSave,
  onCancel,
  onClose,
}: MaterialModalProps) {
  if (!selectedMaterial) return null;

  // Fullscreen Mode
  if (fullscreen && editing) {
    return (
      <div className="fixed inset-0 z-[70] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--mdt-sidebar)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white bg-transparent border-none flex-grow"
            style={{ outline: 'none' }}
            placeholder="Tytul materialu..."
          />
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setFullscreen(false)}
              className="btn-win95 p-1"
              title="Wyjdz z pelnego ekranu"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onSave}
              className="btn-win95 flex items-center gap-1"
              style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="btn-win95 p-1"
              style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-grow overflow-hidden p-4">
          <QuillEditor
            value={editContent}
            onChange={setEditContent}
            className="quill-fullscreen"
            minHeight="calc(100vh - 200px)"
          />
        </div>
      </div>
    );
  }

  // Modal (View/Edit Mode)
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
          {editing ? (
            // Edit Mode
            <>
              {/* Edit Header */}
              <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white bg-transparent border-none flex-grow"
                  style={{ outline: 'none' }}
                  placeholder="Tytul materialu..."
                />
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setFullscreen(true)}
                    className="btn-win95 p-1"
                    title="Pelny ekran"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onSave}
                    className="btn-win95 flex items-center gap-1"
                    style={{ backgroundColor: '#3a6a3a', color: '#fff', borderColor: '#5a9a5a #1a3a1a #1a3a1a #5a9a5a' }}
                  >
                    <Save className="w-4 h-4" />
                    Zapisz
                  </button>
                  <button
                    onClick={onCancel}
                    className="btn-win95 p-1"
                    style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <QuillEditor
                  value={editContent}
                  onChange={setEditContent}
                  minHeight="450px"
                />
              </div>
            </>
          ) : (
            // View Mode
            <>
              {/* View Header */}
              <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
                <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white truncate flex-1">
                  {selectedMaterial.title}
                </span>
                <div className="flex items-center gap-2 ml-4">
                  {isAdmin && (
                    <button
                      onClick={onStartEdit}
                      className="btn-win95 flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edytuj
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="btn-win95 p-1"
                    style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div
                  className="prose max-w-none font-mono text-sm"
                  style={{ color: 'var(--mdt-content-text)', wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
