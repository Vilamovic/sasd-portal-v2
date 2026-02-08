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
 * - Sheriff Theme styling
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
      <div className="fixed inset-0 bg-[#020a06] z-[70] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#051a0f] border-b border-[#1a4d32]">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="text-2xl font-bold bg-transparent text-white border-none focus:outline-none flex-grow"
            placeholder="Tytuł materiału..."
          />
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setFullscreen(false)}
              className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
              title="Wyjdź z pełnego ekranu"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              Zapisz
            </button>
            <button
              onClick={onCancel}
              className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-grow overflow-hidden p-6">
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
        <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl">
          {editing ? (
            // Edit Mode
            <div className="glass-strong border border-[#1a4d32]/50">
              {/* Edit Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#1a4d32]/50 bg-[#051a0f]/50">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold bg-[#0a2818]/50 text-white border border-[#1a4d32] rounded-xl px-4 py-3 flex-grow focus:outline-none focus:border-[#c9a227] transition-colors"
                  placeholder="Tytuł materiału..."
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFullscreen(true)}
                    className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                    title="Pełny ekran"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg"
                  >
                    <Save className="w-4 h-4" />
                    Zapisz
                  </button>
                  <button
                    onClick={onCancel}
                    className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <QuillEditor
                  value={editContent}
                  onChange={setEditContent}
                  minHeight="450px"
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="glass-strong border border-[#1a4d32]/50">
              {/* View Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-b border-[#1a4d32]/50 bg-[#051a0f]/50">
                <h3 className="text-2xl font-bold text-white">
                  {selectedMaterial.title}
                </h3>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={onStartEdit}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edytuj
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2.5 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div
                  className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-[#8fb5a0] prose-a:text-[#c9a227] prose-strong:text-white prose-li:text-[#8fb5a0] break-words"
                  style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: selectedMaterial.content }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
}
