'use client';

import { Award, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import { formatDate } from '@/src/components/shared/constants';

interface PenaltiesTableProps {
  penalties: any[];
  section: 'plusminus' | 'suspensions' | 'warnings';
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onClear: () => void;
  onDeleteSelected: () => void;
  isDev: boolean;
  isHCS: boolean;
  isCS: boolean;
}

/**
 * Penalties Table - Uniwersalna tabela dla kar
 * Obsługuje 3 sekcje: PLUS/MINUS, Zawieszenia, Upomnienia Pisemne
 */
export default function PenaltiesTable({
  penalties,
  section,
  selectedIds,
  onToggleSelection,
  onClear,
  onDeleteSelected,
  isDev,
  isHCS,
  isCS,
}: PenaltiesTableProps) {
  const getPenaltyTypeDisplay = (type: string) => {
    switch (type) {
      case 'plus':
        return 'PLUS';
      case 'minus':
        return 'MINUS';
      case 'suspension':
        return 'Zawieszenie';
      default:
        return type;
    }
  };

  const getPenaltyTypeColor = (type: string) => {
    switch (type) {
      case 'plus':
        return 'text-green-700';
      case 'minus':
        return 'text-red-700';
      case 'suspension':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Config per section
  const config = {
    plusminus: {
      title: 'Historia PLUS/MINUS',
      icon: Award,
      emptyText: 'Brak historii PLUS/MINUS.',
      clearButtonText: 'Wyzeruj +/-',
      canClear: isCS,
      clearTooltip: 'Wyzeruj całą historię PLUS/MINUS (CS+)',
    },
    suspensions: {
      title: 'Historia Kar (Zawieszenia)',
      icon: AlertTriangle,
      emptyText: 'Brak historii kar.',
      clearButtonText: 'Wyzeruj wszystko',
      canClear: isHCS,
      clearTooltip: 'Wyzeruj całą historię zawieszeń (HCS+)',
    },
    warnings: {
      title: 'Historia Upomnienia Pisemne',
      icon: FileText,
      emptyText: 'Brak upomnienia pisemnego.',
      clearButtonText: 'Wyzeruj wszystko',
      canClear: isCS,
      clearTooltip: 'Wyzeruj całą historię upomnienia pisemnych (CS+)',
    },
  };

  const cfg = config[section];
  const Icon = cfg.icon;

  return (
    <div className="mb-4">
      {/* Clear buttons */}
      {cfg.canClear && (
        <div className="flex justify-end gap-2 mb-2">
          {isDev && selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="btn-win95 flex items-center gap-2 text-sm"
              style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
              title={`Usuń ${selectedIds.size} zaznaczonych pozycji${section === 'warnings' ? '' : ' (DEV)'}`}
            >
              <Trash2 className="w-3 h-3" />
              Usuń zaznaczone ({selectedIds.size})
            </button>
          )}
          <button
            onClick={onClear}
            className="btn-win95 flex items-center gap-2 text-sm"
            style={{ backgroundColor: '#c41e1e', color: '#fff', borderColor: '#ff4444 #800000 #800000 #ff4444' }}
            title={cfg.clearTooltip}
          >
            <Trash2 className="w-3 h-3" />
            {cfg.clearButtonText}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="panel-raised" style={{ backgroundColor: 'var(--mdt-btn-face)' }}>
        {/* Blue title bar */}
        <div style={{ backgroundColor: 'var(--mdt-blue-bar)' }} className="px-4 py-2 flex items-center gap-2">
          <Icon className="w-4 h-4 text-white" />
          <h3 className="font-[family-name:var(--font-vt323)] text-base tracking-widest uppercase text-white">
            {cfg.title}
          </h3>
        </div>

        {penalties.length === 0 ? (
          <div className="p-8 text-center">
            <Icon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--mdt-muted-text)' }} />
            <p className="font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>{cfg.emptyText}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--mdt-header)' }}>
                <tr>
                  {isDev && <th className="px-3 py-2 w-10"></th>}
                  {section === 'plusminus' && (
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Typ</th>
                  )}
                  <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Powód</th>
                  {section === 'suspensions' && (
                    <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Czas trwania</th>
                  )}
                  <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Nadane przez</th>
                  <th className="px-4 py-2 text-left font-[family-name:var(--font-vt323)] text-sm tracking-widest uppercase" style={{ color: '#ccc' }}>Data</th>
                </tr>
              </thead>
              <tbody>
                {penalties.map((penalty, index) => (
                  <tr
                    key={penalty.id}
                    style={{ backgroundColor: index % 2 === 0 ? 'var(--mdt-row-even)' : 'var(--mdt-row-odd)' }}
                  >
                    {isDev && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(penalty.id)}
                          onChange={() => onToggleSelection(penalty.id)}
                          className="cursor-pointer"
                        />
                      </td>
                    )}
                    {section === 'plusminus' && (
                      <td className="px-4 py-2">
                        <span className={`font-mono text-sm font-bold ${getPenaltyTypeColor(penalty.penalty_type)}`}>
                          {getPenaltyTypeDisplay(penalty.penalty_type)}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-content-text)' }}>{penalty.reason}</td>
                    {section === 'suspensions' && (
                      <td className="px-4 py-2 font-mono text-sm font-bold" style={{ color: '#c41e1e' }}>
                        {penalty.duration_hours ? `${penalty.duration_hours}h` : 'Permanentne'}
                      </td>
                    )}
                    <td className="px-4 py-2 font-mono text-sm" style={{ color: 'var(--mdt-muted-text)' }}>{penalty.admin_username}</td>
                    <td className="px-4 py-2 font-mono text-xs" style={{ color: 'var(--mdt-muted-text)' }}>{formatDate(penalty.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
