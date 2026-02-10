import { useState } from 'react';
import { Edit3, Save, X, Maximize2, Minimize2 } from 'lucide-react';
import QuillEditor from '@/src/components/shared/QuillEditor';
import ProtectedContent from '@/src/components/shared/ProtectedContent';
import MandatoryBadge from '@/src/components/shared/MandatoryBadge';
import TemplatePresets from '@/src/components/shared/TemplatePresets';

interface MaterialModalProps {
  selectedMaterial: any | null;
  editing: boolean;
  editTitle: string;
  setEditTitle: (title: string) => void;
  editContent: string;
  setEditContent: (content: string) => void;
  editMandatory: boolean;
  setEditMandatory: (value: boolean) => void;
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
  isAdmin: boolean;
  username: string;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onClose: () => void;
}

/**
 * MaterialModal - Combined modal dla materiałów
 *
 * Modes:
 * 1. View Mode - read-only content display (z ProtectedContent)
 * 2. View Fullscreen - fullscreen read-only
 * 3. Edit Mode - WYSIWYG editor in modal
 * 4. Edit Fullscreen - WYSIWYG editor fullscreen
 */
export default function MaterialModal({
  selectedMaterial,
  editing,
  editTitle,
  setEditTitle,
  editContent,
  setEditContent,
  editMandatory,
  setEditMandatory,
  fullscreen,
  setFullscreen,
  isAdmin,
  username,
  onStartEdit,
  onSave,
  onCancel,
  onClose,
}: MaterialModalProps) {
  const [viewFullscreen, setViewFullscreen] = useState(false);

  if (!selectedMaterial) return null;

  // ==================== SHARED COMPONENTS ====================

  const EditHeader = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white bg-transparent border-none flex-grow"
        style={{ outline: 'none' }}
        placeholder="Tytuł materiału..."
      />
      <div className="flex items-center gap-2 ml-4">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={editMandatory}
            onChange={(e) => setEditMandatory(e.target.checked)}
            className="cursor-pointer"
          />
          <span className="font-mono text-xs text-white">Obowiązkowy</span>
        </label>
        <TemplatePresets onInsert={setEditContent} />
        <button
          onClick={() => setFullscreen(!isFullscreen)}
          className="btn-win95 p-1"
          title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
  );

  const ViewHeader = ({ isFullscreen }: { isFullscreen: boolean }) => (
    <div className="flex items-center justify-between px-3 py-1" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase text-white truncate">
          {selectedMaterial.title}
        </span>
        <MandatoryBadge isMandatory={selectedMaterial.is_mandatory || false} />
      </div>
      <div className="flex items-center gap-2 ml-4">
        <button
          onClick={() => setViewFullscreen(!isFullscreen)}
          className="btn-win95 p-1"
          title={isFullscreen ? 'Wyjdź z pełnego ekranu' : 'Pełny ekran'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        {isAdmin && (
          <button
            onClick={() => { setViewFullscreen(false); onStartEdit(); }}
            className="btn-win95 flex items-center gap-1"
          >
            <Edit3 className="w-4 h-4" />
            Edytuj
          </button>
        )}
        <button
          onClick={() => { setViewFullscreen(false); onClose(); }}
          className="btn-win95 p-1"
          style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const MaterialContent = () => {
    // Replace non-breaking spaces (&nbsp; / \u00A0) with regular spaces
    // Quill often saves content with &nbsp; which prevents word wrapping
    const sanitizedContent = (selectedMaterial.content || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\u00A0/g, ' ');

    return (
      <div className="panel-inset p-6" style={{ backgroundColor: 'var(--mdt-input-bg)' }}>
        <ProtectedContent username={username}>
          <div
            className="material-content"
            style={{ color: 'var(--mdt-content-text)' }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </ProtectedContent>
      </div>
    );
  };

  // ==================== FULLSCREEN EDIT ====================
  if (fullscreen && editing) {
    return (
      <div className="fixed inset-0 z-[70] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--mdt-sidebar)' }}>
        <EditHeader isFullscreen />
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

  // ==================== FULLSCREEN VIEW ====================
  if (viewFullscreen && !editing) {
    return (
      <div className="fixed inset-0 z-[70] overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--mdt-sidebar)' }}>
        <ViewHeader isFullscreen />
        <div className="flex-grow overflow-y-auto overflow-x-hidden p-6 min-w-0">
          <div className="max-w-4xl mx-auto">
            <MaterialContent />
          </div>
        </div>
      </div>
    );
  }

  // ==================== MODAL (View/Edit) ====================
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden panel-raised flex flex-col" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {editing ? (
          <>
            <EditHeader isFullscreen={false} />
            <div className="p-4 overflow-y-auto flex-grow">
              <QuillEditor
                value={editContent}
                onChange={setEditContent}
                minHeight="450px"
              />
            </div>
          </>
        ) : (
          <>
            <ViewHeader isFullscreen={false} />
            <div className="p-4 overflow-y-auto overflow-x-hidden flex-grow min-w-0">
              <MaterialContent />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
