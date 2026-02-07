import { BookOpen, Trash2, FileText, ArrowRight } from 'lucide-react';

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
 * - Glow effects on hover
 * - Content preview (pierwszy 150 znaków)
 * - Sheriff Theme colors
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
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 p-12 text-center shadow-xl">
        <BookOpen className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
        <p className="text-[#8fb5a0] text-lg">
          Brak materiałów. Kliknij "Dodaj Materiał" aby stworzyć pierwszy.
        </p>
      </div>
    );
  }

  // Grid with Materials
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {materials.map((material, index) => (
        <div
          key={material.id}
          className="group relative"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Glow effect */}
          <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 bg-[#c9a227]/20" />

          {/* Main Card */}
          <button
            onClick={() => onSelectMaterial(material)}
            className="relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl text-left overflow-hidden"
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-6 left-0 w-[2px] h-16 bg-gradient-to-b from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Delete Button (Edit Mode Only) */}
            {isAdmin && editMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(material.id, material.title);
                }}
                className="absolute top-4 right-4 z-10 p-2.5 bg-red-500/20 hover:bg-red-500 border border-red-500/50 hover:border-red-500 rounded-xl transition-all duration-200 group/delete animate-fadeIn shadow-lg shadow-red-500/20"
                title="Usuń materiał"
              >
                <Trash2 className="w-4 h-4 text-red-400 group-hover/delete:text-white group-hover/delete:scale-110 transition-all" />
              </button>
            )}

            {/* Icon Container */}
            <div className="mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <FileText className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c9a227] transition-colors line-clamp-2">
              {material.title}
            </h3>

            {/* Content Preview */}
            <div
              className="text-[#8fb5a0] text-sm leading-relaxed line-clamp-3 prose prose-invert prose-p:text-[#8fb5a0] prose-p:text-sm"
              dangerouslySetInnerHTML={{
                __html:
                  material.content.replace(/<[^>]*>/g, ' ').substring(0, 150) +
                  '...',
              }}
            />

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-[#1a4d32]/50 flex items-center justify-between">
              <span className="text-xs text-[#8fb5a0]">Kliknij aby otworzyć</span>
              <ArrowRight className="w-4 h-4 text-[#c9a227] group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}
