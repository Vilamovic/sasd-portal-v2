/**
 * Shared constants - single source of truth
 */

export const BADGES = [
  'Trainee',
  'Deputy Sheriff I',
  'Deputy Sheriff II',
  'Deputy Sheriff III',
  'Senior Deputy Sheriff',
  'Sergeant I',
  'Sergeant II',
  'Detective I',
  'Detective II',
  'Detective III',
  'Lieutenant',
  'Captain I',
  'Captain II',
  'Captain III',
  'Area Commander',
  'Division Chief',
  'Assistant Sheriff',
  'Undersheriff',
  'Sheriff',
] as const;

export const DIVISIONS = ['FTO', 'SS', 'DTU', 'GU', 'SWAT'] as const;

export const PERMISSIONS = ['SWAT', 'SEU', 'AIR', 'Press Desk', 'Dispatch', 'Pościgowe'] as const;

export function getDivisionColor(division: string | null): string {
  switch (division) {
    case 'FTO':
      return 'bg-[#c9a227] text-[#020a06]';
    case 'SS':
      return 'bg-[#ff8c00] text-white';
    case 'DTU':
      return 'bg-[#60a5fa] text-[#020a06]';
    case 'GU':
      return 'bg-[#059669] text-white';
    case 'SWAT':
      return 'bg-[#2d5a2d] text-white';
    default:
      return 'bg-gray-600 text-white';
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
