'use client';

import { Filter, Shield } from 'lucide-react';

interface FiltersPanelProps {
  divisions: string[];
  divisionFilter: string;
  setDivisionFilter: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
}

/**
 * FiltersPanel - Filtry dla kartoteki (dywizje + role)
 */
export default function FiltersPanel({
  divisions,
  divisionFilter,
  setDivisionFilter,
  roleFilter,
  setRoleFilter,
}: FiltersPanelProps) {
  return (
    <>
      {/* Division Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--mdt-muted-text)' }} />
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="panel-inset w-full pl-9 pr-4 py-2 font-mono text-sm appearance-none cursor-pointer"
          style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
        >
          <option value="all">Wszystkie dywizje</option>
          {divisions.map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
          <option value="none">Bez dywizji</option>
        </select>
      </div>

      {/* Role Filter */}
      <div className="relative">
        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--mdt-muted-text)' }} />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="panel-inset w-full pl-9 pr-4 py-2 font-mono text-sm appearance-none cursor-pointer"
          style={{ backgroundColor: 'var(--mdt-input-bg)', color: 'var(--mdt-content-text)', outline: 'none' }}
        >
          <option value="all">Wszystkie role</option>
          <option value="dev">Dev</option>
          <option value="hcs">HCS (High Command Staff)</option>
          <option value="cs">CS (Command Staff)</option>
          <option value="deputy">Deputy</option>
          <option value="trainee">Trainee</option>
        </select>
      </div>
    </>
  );
}
