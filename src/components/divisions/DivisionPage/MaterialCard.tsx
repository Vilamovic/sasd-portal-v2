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

interface Material {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
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
 * - Hover effects
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
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-7 h-7 text-white" />;
      case 'image':
        return <ImageIcon className="w-7 h-7 text-white" />;
      case 'video':
        return <Video className="w-7 h-7 text-white" />;
      case 'link':
        return <LinkIcon className="w-7 h-7 text-white" />;
      default:
        return <File className="w-7 h-7 text-white" />;
    }
  };

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Glow effect */}
      <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 bg-[#c9a227]/20" />

      {/* Main Card */}
      <div className="relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-6 left-0 w-[2px] h-16 bg-gradient-to-b from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Edit/Delete Buttons (Edit Mode Only) */}
        {canManage && editMode && (
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={() => onEdit(material)}
              className="p-2.5 bg-[#14b8a6]/20 hover:bg-[#14b8a6] border border-[#14b8a6]/50 hover:border-[#14b8a6] rounded-xl transition-all duration-200 group/edit animate-fadeIn shadow-lg shadow-[#14b8a6]/20"
              title="Edytuj materiał"
            >
              <Edit3 className="w-4 h-4 text-[#14b8a6] group-hover/edit:text-white group-hover/edit:scale-110 transition-all" />
            </button>
            <button
              onClick={() => onDelete(material.id, material.title)}
              className="p-2.5 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:border-red-500 rounded-xl transition-all duration-200 group/delete animate-fadeIn shadow-lg shadow-red-500/20"
              title="Usuń materiał"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover/delete:text-white group-hover/delete:scale-110 transition-all" />
            </button>
          </div>
        )}

        {/* Icon Container */}
        <div className="mb-5">
          <div
            className={`w-14 h-14 bg-gradient-to-br ${divisionConfig.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
          >
            {getFileIcon(material.file_type)}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors line-clamp-2">
          {material.title}
        </h3>

        {material.description && (
          <p className="text-[#8fb5a0] text-sm leading-relaxed line-clamp-3 mb-4">
            {material.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-[#1a4d32]/50 flex items-center justify-between">
          <a
            href={material.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-[#c9a227] hover:text-[#e6b830] transition-colors group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Otwórz materiał</span>
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
