import { Edit3, Plus } from 'lucide-react';

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
    <div className="panel-raised mb-6" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
      {/* Blue title bar */}
      <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: 'var(--mdt-blue-bar)' }}>
        <div className="flex items-center gap-3">
          <span
            className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white"
          >
            {divisionConfig.name} [{divisionId}]
          </span>
          {materialsCount > 0 && (
            <span
              className="font-mono text-xs text-white"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '1px 6px' }}
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

        {/* Admin Controls */}
        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleEditMode}
              className="btn-win95 flex items-center gap-1"
              style={
                editMode
                  ? { backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }
                  : undefined
              }
            >
              <Edit3 className="w-3 h-3" />
              <span className="font-mono text-xs">{editMode ? 'Zakończ Edycję' : 'Tryb Edycji'}</span>
            </button>

            <button
              onClick={onToggleAddForm}
              className="btn-win95 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span className="font-mono text-xs">Dodaj Materiał</span>
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-4 py-3">
        <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>
          Materiały specjalistyczne dla {divisionId}
        </p>
      </div>
    </div>
  );
}
