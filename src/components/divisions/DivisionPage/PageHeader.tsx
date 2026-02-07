import { Sparkles, Edit3, Plus } from 'lucide-react';

interface DivisionConfig {
  name: string;
  color: string;
  textColor: string;
}

interface PageHeaderProps {
  divisionId: string;
  divisionConfig: DivisionConfig;
  materialsCount: number;
  canManage: boolean;
  editMode: boolean;
  showAddForm: boolean;
  onToggleEditMode: () => void;
  onToggleAddForm: () => void;
}

/**
 * PageHeader - Division page header
 * - Division badge + name + underline
 * - Materials count
 * - Admin controls (Edit Mode + Add Material buttons)
 */
export default function PageHeader({
  divisionId,
  divisionConfig,
  materialsCount,
  canManage,
  editMode,
  showAddForm,
  onToggleEditMode,
  onToggleAddForm,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        {/* Division Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${divisionConfig.color} bg-opacity-20 border border-white/20 text-white text-sm font-medium mb-4`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{divisionId}</span>
        </div>

        {/* Division Name */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          <span className={divisionConfig.textColor}>{divisionConfig.name}</span>
        </h2>

        {/* Underline */}
        <div
          className={`w-24 h-1 bg-gradient-to-r ${divisionConfig.color} rounded-full mb-3`}
        />

        {/* Description + Count */}
        <div className="flex items-center gap-3">
          <p className="text-[#8fb5a0]">Materiały specjalistyczne dla {divisionId}</p>
          {materialsCount > 0 && (
            <span
              className={`px-3 py-1 bg-gradient-to-r ${divisionConfig.color} bg-opacity-10 border border-white/30 rounded-full text-white text-xs font-bold`}
            >
              {materialsCount}{' '}
              {materialsCount === 1
                ? 'materiał'
                : materialsCount < 5
                ? 'materiały'
                : 'materiałów'}
            </span>
          )}
        </div>
      </div>

      {/* Admin Controls */}
      {canManage && (
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleEditMode}
            className={`flex items-center gap-2 px-6 py-3 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg ${
              editMode
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/20'
                : 'bg-gradient-to-r from-[#14b8a6] to-[#0d9488] text-white shadow-[#14b8a6]/20'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            {editMode ? 'Zakończ Edycję' : 'Tryb Edycji'}
          </button>

          <button
            onClick={onToggleAddForm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] text-[#020a06] font-bold rounded-xl hover:opacity-90 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#c9a227]/20"
          >
            <Plus className="w-4 h-4" />
            Dodaj Materiał
          </button>
        </div>
      )}
    </div>
  );
}
