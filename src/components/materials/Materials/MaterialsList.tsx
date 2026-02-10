import { BookOpen, Trash2, FileText, ArrowRight } from 'lucide-react';
import MandatoryBadge from '@/src/components/shared/MandatoryBadge';

interface MaterialsListProps {
  materials: any[];
  editMode: boolean;
  isAdmin: boolean;
  onSelectMaterial: (material: any) => void;
  onDelete: (materialId: number, materialTitle: string) => void;
}

/**
 * MaterialsList - Grid z kartami materiałów
 *
 * Features:
 * - Empty state (brak materiałów)
 * - Grid responsywny (1/2/3 kolumny)
 * - Delete button (tylko w edit mode)
 * - Content preview (pierwszy 150 znaków)
 * - MDT Terminal styling
 */
export default function MaterialsList({
  materials,
  editMode,
  isAdmin,
  onSelectMaterial,
  onDelete,
}: MaterialsListProps) {
  // Empty State
  if (materials.length === 0) {
    return (
      <div className="panel-raised p-12 text-center" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--mdt-muted-text)' }} />
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>
          Brak materiałów. Kliknij &quot;Dodaj Materiał&quot; aby stworzyć pierwszy.
        </p>
      </div>
    );
  }

  // Grid with Materials
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((material) => (
        <div
          key={material.id}
          className="relative panel-raised overflow-hidden"
          style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        >
          {/* Blue header with title + badge */}
          <div className="px-3 py-1 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white truncate">
                {material.title}
              </span>
              <MandatoryBadge isMandatory={material.is_mandatory || false} />
            </div>

            {/* Delete Button (Edit Mode Only) */}
            {isAdmin && editMode && (
              <button
                onClick={() => onDelete(material.id, material.title)}
                className="btn-win95 ml-2 p-1"
                style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
                title="Usuń materiał"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Clickable content area */}
          <div
            onClick={() => onSelectMaterial(material)}
            className="p-4 cursor-pointer hover:bg-[var(--mdt-surface-light)] transition-colors"
          >
            {/* Icon + Content Preview */}
            <div className="flex items-start gap-3 mb-3">
              <div className="panel-inset p-2 flex-shrink-0" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
                <FileText className="w-5 h-5" style={{ color: 'var(--mdt-content-text)' }} strokeWidth={2} />
              </div>
              <div
                className="font-mono text-xs leading-relaxed line-clamp-3"
                style={{ color: 'var(--mdt-muted-text)' }}
                dangerouslySetInnerHTML={{
                  __html:
                    material.content.replace(/<[^>]*>/g, ' ').substring(0, 150) +
                    '...',
                }}
              />
            </div>

            {/* Footer */}
            <div className="panel-inset flex items-center justify-between px-2 py-1" style={{ backgroundColor: 'var(--mdt-panel-alt)' }}>
              <span className="font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>Kliknij aby otworzyć</span>
              <ArrowRight className="w-3 h-3" style={{ color: 'var(--mdt-content-text)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
