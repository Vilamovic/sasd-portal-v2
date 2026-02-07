'use client';

import { Award, AlertTriangle, FileText, Trash2 } from 'lucide-react';

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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
        return 'text-green-400';
      case 'minus':
        return 'text-red-400';
      case 'suspension':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  // Config per section
  const config = {
    plusminus: {
      title: 'Historia PLUS/MINUS',
      icon: Award,
      iconColor: 'text-[#c9a227]',
      emptyText: 'Brak historii PLUS/MINUS.',
      clearButtonText: 'Wyzeruj +/-',
      canClear: isCS,
      clearTooltip: 'Wyzeruj całą historię PLUS/MINUS (CS+)',
    },
    suspensions: {
      title: 'Historia Kar (Zawieszenia)',
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      emptyText: 'Brak historii kar.',
      clearButtonText: 'Wyzeruj wszystko',
      canClear: isHCS,
      clearTooltip: 'Wyzeruj całą historię zawieszeń (HCS+)',
    },
    warnings: {
      title: 'Historia Upomnienia Pisemne',
      icon: FileText,
      iconColor: 'text-orange-400',
      emptyText: 'Brak upomnienia pisemnego.',
      clearButtonText: 'Wyzeruj wszystko',
      canClear: isDev,
      clearTooltip: 'Wyzeruj całą historię upomnienia pisemnych (DEV)',
    },
  };

  const cfg = config[section];
  const Icon = cfg.icon;

  return (
    <div className="mb-8">
      {/* Clear buttons */}
      {cfg.canClear && (
        <div className="flex justify-end gap-2 mb-2">
          {isDev && selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 border border-orange-500/50 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600/30 transition-all"
              title={`Usuń ${selectedIds.size} zaznaczonych pozycji${section === 'warnings' ? '' : ' (DEV)'}`}
            >
              <Trash2 className="w-3 h-3" />
              Usuń zaznaczone ({selectedIds.size})
            </button>
          )}
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 text-sm font-bold rounded-lg hover:bg-red-600/30 transition-all"
            title={cfg.clearTooltip}
          >
            <Trash2 className="w-3 h-3" />
            {cfg.clearButtonText}
          </button>
        </div>
      )}

      {/* Header */}
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
        {cfg.title}
      </h3>

      {/* Table */}
      <div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
        {penalties.length === 0 ? (
          <div className="p-12 text-center">
            <Icon className="w-16 h-16 text-[#8fb5a0] mx-auto mb-4" />
            <p className="text-[#8fb5a0]">{cfg.emptyText}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
                <tr>
                  {isDev && <th className="px-4 py-4 w-12"></th>}
                  {section === 'plusminus' && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Typ</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Powód</th>
                  {section === 'suspensions' && (
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Czas trwania</th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Nadane przez</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8fb5a0] uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a4d32]/30">
                {penalties.map((penalty) => (
                  <tr key={penalty.id} className="hover:bg-[#0a2818]/30 transition-colors">
                    {isDev && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(penalty.id)}
                          onChange={() => onToggleSelection(penalty.id)}
                          className="w-4 h-4 rounded border-[#1a4d32] bg-[#0a2818] text-[#c9a227] focus:ring-[#c9a227] focus:ring-offset-0 cursor-pointer"
                        />
                      </td>
                    )}
                    {section === 'plusminus' && (
                      <td className="px-6 py-4">
                        <span className={`font-bold ${getPenaltyTypeColor(penalty.penalty_type)}`}>
                          {getPenaltyTypeDisplay(penalty.penalty_type)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-white">{penalty.reason}</td>
                    {section === 'suspensions' && (
                      <td className="px-6 py-4 text-orange-400 font-semibold">
                        {penalty.duration_hours ? `${penalty.duration_hours}h` : 'Permanentne'}
                      </td>
                    )}
                    <td className="px-6 py-4 text-[#8fb5a0]">{penalty.admin_username}</td>
                    <td className="px-6 py-4 text-[#8fb5a0] text-sm">{formatDate(penalty.created_at)}</td>
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
