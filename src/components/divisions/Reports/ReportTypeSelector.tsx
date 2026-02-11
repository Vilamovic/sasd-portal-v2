'use client';

import { ArrowRight } from 'lucide-react';
import { getReportConfig, type ReportTypeDefinition } from './reportConfig';

interface ReportTypeSelectorProps {
  divisionId: string;
  onSelect: (reportType: ReportTypeDefinition) => void;
}

export default function ReportTypeSelector({ divisionId, onSelect }: ReportTypeSelectorProps) {
  const config = getReportConfig(divisionId);
  if (!config) return null;

  return (
    <div className="space-y-2">
      <p className="font-mono text-xs mb-2" style={{ color: 'var(--mdt-muted-text)' }}>
        Wybierz typ raportu:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {config.reportTypes.map((rt) => (
          <button
            key={rt.id}
            onClick={() => onSelect(rt)}
            className="panel-raised p-3 text-left flex items-center justify-between hover:opacity-90"
            style={{ backgroundColor: 'var(--mdt-btn-face)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{rt.icon}</span>
              <span className="font-mono text-xs font-bold" style={{ color: 'var(--mdt-content-text)' }}>
                {rt.label}
              </span>
            </div>
            <ArrowRight className="w-4 h-4" style={{ color: 'var(--mdt-muted-text)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
