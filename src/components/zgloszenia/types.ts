export interface Submission {
  id: string;
  user_id: string;
  type: SubmissionType;
  title: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  metadata: Record<string, any>;
  admin_response: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  // Joined fields
  user?: { username: string; mta_nick: string | null; avatar_url: string | null };
  reviewed_by_user?: { username: string; mta_nick: string | null } | null;
}

export type SubmissionType =
  | 'bug_report'
  | 'division_application'
  | 'idea'
  | 'vacation'
  | 'excuse'
  | 'exam_booking'
  | 'plus_exchange';

export interface SubmissionTypeConfig {
  type: SubmissionType;
  label: string;
  description: string;
  icon: string;
  roles: string[];
  enabled: boolean;
}

export interface RecruitmentStatus {
  division: string;
  is_open: boolean;
  updated_by: string | null;
  updated_at: string;
}

export const SUBMISSION_TYPES: SubmissionTypeConfig[] = [
  {
    type: 'bug_report',
    label: 'Zgłoszenie Błędu',
    description: 'Zgłoś problem techniczny lub błąd na stronie portalu',
    icon: 'Bug',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'division_application',
    label: 'Podanie do Dywizji',
    description: 'Złóż podanie o przyjęcie do wybranej dywizji',
    icon: 'Shield',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'idea',
    label: 'Pomysł / Propozycja',
    description: 'Podziel się pomysłem na ulepszenie frakcji lub strony',
    icon: 'Lightbulb',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'vacation',
    label: 'Urlop',
    description: 'Złóż wniosek o urlop (max 7 dni, 21 dni/kwartał)',
    icon: 'Calendar',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'excuse',
    label: 'Usprawiedliwienie',
    description: 'Usprawiedliw brak realizacji normy tygodniowej',
    icon: 'FileText',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'exam_booking',
    label: 'Egzamin Praktyczny',
    description: 'Zarezerwuj termin egzaminu praktycznego',
    icon: 'Target',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
  {
    type: 'plus_exchange',
    label: 'Wymiana Plusów',
    description: 'Wymień zebrane plusy na benefity',
    icon: 'ArrowLeftRight',
    roles: ['trainee', 'deputy', 'cs', 'hcs', 'dev'],
    enabled: true,
  },
];

// ==================== Practical Exam Types ====================

export type PracticalExamType = 'trainee' | 'poscigowy' | 'swat' | 'seu';

export interface ExamSlot {
  id: string;
  exam_type: PracticalExamType;
  slot_date: string;
  time_start: string;
  time_end: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  booked_by: string | null;
  booked_at: string | null;
  created_by: string;
  created_at: string;
  booker?: { username: string; mta_nick: string | null } | null;
  creator?: { username: string; mta_nick: string | null } | null;
}

export interface PracticalExamResult {
  id: string;
  slot_id: string | null;
  exam_type: string;
  examinee_id: string;
  examiner_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  checklist: { item: string; checked: boolean }[];
  notes: string | null;
  created_at: string;
  is_archived?: boolean;
  archived_at?: string | null;
  archived_by?: string | null;
  examinee?: { username: string; mta_nick: string | null } | null;
  examiner?: { username: string; mta_nick: string | null } | null;
  archived_by_user?: { username: string; mta_nick: string | null } | null;
}

export const PRACTICAL_EXAM_TYPES: Record<PracticalExamType, { label: string; color: string; duration: number }> = {
  trainee: { label: 'Egzamin Trainee', color: '#c9a227', duration: 60 },
  poscigowy: { label: 'Egzamin Pościgowy', color: '#ff8c00', duration: 60 },
  swat: { label: 'Egzamin SWAT', color: '#dc2626', duration: 15 },
  seu: { label: 'Egzamin SEU', color: '#60a5fa', duration: 60 },
};

export const EXAM_CHECKLISTS: Record<PracticalExamType, string[]> = {
  trainee: [
    'Znajomość regulaminu',
    'Obsługa radia',
    'Procedury zatrzymania',
    'Kontrola pojazdu',
    'Zachowanie na służbie',
  ],
  poscigowy: [
    'Technika jazdy',
    'PIT maneuver',
    'Blokada drogi',
    'Komunikacja radiowa',
    'Bezpieczeństwo pościgu',
  ],
  swat: [
    'Taktyka wejścia',
    'Komunikacja zespołowa',
    'Obsługa broni specjalnej',
    'Negocjacje',
    'Pierwsza pomoc taktyczna',
  ],
  seu: [
    'Rozpoznanie zagrożenia',
    'Procedury SEU',
    'Koordynacja z SS',
    'Raportowanie',
    'Obsługa sprzętu specjalnego',
  ],
};

// ==================== Submission Status/Type Labels ====================

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Oczekujące', color: '#c9a227' },
  approved: { label: 'Zaakceptowane', color: '#3a6a3a' },
  rejected: { label: 'Odrzucone', color: '#8b1a1a' },
  archived: { label: 'Zarchiwizowane', color: '#555555' },
};

export const TYPE_LABELS: Record<string, string> = {
  bug_report: 'Zgłoszenie Błędu',
  division_application: 'Podanie do Dywizji',
  idea: 'Pomysł / Propozycja',
  vacation: 'Urlop',
  excuse: 'Usprawiedliwienie',
  exam_booking: 'Egzamin Praktyczny',
  plus_exchange: 'Wymiana Plusów',
};
