import {
  Edit3,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  File,
  ArrowRight,
} from 'lucide-react';
import MandatoryBadge from '@/src/components/shared/MandatoryBadge';

interface Material {
  id: string;
  title: string;
  description?: string;
  file_url: string | null;
  file_type: string | null;
  is_mandatory?: boolean;
}

interface DivisionConfig {
  color: string;
}

interface MaterialCardProps {
  material: Material;
  divisionConfig: DivisionConfig;
  editMode: boolean;
  canManage: boolean;
  index: number;
  onEdit: (material: Material) => void;
  onDelete: (materialId: string, materialTitle: string) => void;
}

/**
 * MaterialCard - Material grid card
 * - Icon + title + description
 * - Edit/Delete buttons (edit mode only)
 * - Open material link
 */
export default function MaterialCard({
  material,
  divisionConfig,
  editMode,
  canManage,
  index,
  onEdit,
  onDelete,
}: MaterialCardProps) {
  const getFileIcon = (fileType: string | null) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-white" />;
      case 'image':
        return <ImageIcon className="w-6 h-6 text-white" />;
      case 'video':
        return <Video className="w-6 h-6 text-white" />;
      case 'link':
        return <LinkIcon className="w-6 h-6 text-white" />;
      default:
        return <File className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue header bar with title */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-6 h-6 flex items-center justify-center"
            style={{ backgroundColor: divisionConfig.color }}
          >
            {getFileIcon(material.file_type)}
          </div>
          <span className="font-[family-name:var(--font-vt323)] text-sm tracking-wide text-white truncate">
            {material.title}
          </span>
          <MandatoryBadge isMandatory={material.is_mandatory || false} />
        </div>

        {/* Edit/Delete Buttons (Edit Mode Only) */}
        {canManage && editMode && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(material)}
              className="btn-win95 p-1"
              title="Edytuj materiał"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(material.id, material.title)}
              className="btn-win95 p-1"
              style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
              title="Usuń materiał"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {material.description && (
          <div
            className="font-mono text-xs mb-3 panel-inset p-2"
            style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)' }}
            dangerouslySetInnerHTML={{ __html: material.description }}
          />
        )}

        {/* Footer */}
        {material.file_url && (
          <div className="flex items-center justify-end">
            <a
              href={material.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-win95 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-mono text-xs">Otwórz materiał</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
