'use client';

import { Filter, Shield, ChevronDown } from 'lucide-react';

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
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
        <select
          value={divisionFilter}
          onChange={(e) => setDivisionFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Wszystkie dywizje</option>
          {divisions.map((div) => (
            <option key={div} value={div}>
              {div}
            </option>
          ))}
          <option value="none">Bez dywizji</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
      </div>

      {/* Role Filter */}
      <div className="relative">
        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">Wszystkie role</option>
          <option value="dev">Dev</option>
          <option value="hcs">HCS (High Command Staff)</option>
          <option value="cs">CS (Command Staff)</option>
          <option value="deputy">Deputy</option>
          <option value="trainee">Trainee</option>
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0] pointer-events-none" />
      </div>
    </>
  );
}
