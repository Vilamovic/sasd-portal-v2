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

// ==================== Practical Exam Checklist Types ====================

export interface TraineeChecklistSection {
  name: string;
  maxPoints: number;
  items: { label: string; points: number; checked: boolean; group?: string }[];
}

export interface TraineeChecklistData {
  type: 'trainee';
  sections: TraineeChecklistSection[];
  bonusPoints: number;
}

export interface SwatChecklistData {
  type: 'swat';
}

export interface StageData {
  name: string;
  passed: boolean;
  notes: string;
  verificationItems?: { item: string; checked: boolean }[];
}

export interface StageChecklistData {
  type: 'seu' | 'poscigowy';
  stages: StageData[];
}

export type PracticalExamChecklist = TraineeChecklistData | SwatChecklistData | StageChecklistData;

// Legacy format for backward compatibility
export type LegacyChecklist = { item: string; checked: boolean }[];

export interface PracticalExamResult {
  id: string;
  slot_id: string | null;
  exam_type: string;
  examinee_id: string;
  examiner_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  checklist: PracticalExamChecklist | LegacyChecklist;
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

// ==================== Trainee Checklist Template ====================

export const TRAINEE_CHECKLIST_TEMPLATE: TraineeChecklistSection[] = [
  {
    name: 'Lokalizacje',
    maxPoints: 10,
    items: [
      { label: 'Lokalizacja 1: Orientacyjne wskazanie rejonu', points: 1, checked: false },
      { label: 'Lokalizacja 1: Dojazd pod same drzwi/punkt', points: 1, checked: false },
      { label: 'Lokalizacja 2: Orientacyjne wskazanie rejonu', points: 1, checked: false },
      { label: 'Lokalizacja 2: Dojazd pod same drzwi/punkt', points: 1, checked: false },
      { label: 'Lokalizacja 3: Orientacyjne wskazanie rejonu', points: 1, checked: false },
      { label: 'Lokalizacja 3: Dojazd pod same drzwi/punkt', points: 1, checked: false },
      { label: 'Lokalizacja 4: Orientacyjne wskazanie rejonu', points: 1, checked: false },
      { label: 'Lokalizacja 4: Dojazd pod same drzwi/punkt', points: 1, checked: false },
      { label: 'Lokalizacja 5: Orientacyjne wskazanie rejonu', points: 1, checked: false },
      { label: 'Lokalizacja 5: Dojazd pod same drzwi/punkt', points: 1, checked: false },
    ],
  },
  {
    name: 'Pytania Otwarte',
    maxPoints: 5,
    items: [
      { label: 'Pytanie 1: Odpowiedź poprawna', points: 1, checked: false },
      { label: 'Pytanie 2: Odpowiedź częściowo poprawna', points: 1, checked: false },
      { label: 'Pytanie 2: Uzupełnienie do pełnej odpowiedzi', points: 1, checked: false },
      { label: 'Pytanie 3: Odpowiedź częściowo poprawna', points: 1, checked: false },
      { label: 'Pytanie 3: Uzupełnienie do pełnej odpowiedzi', points: 1, checked: false },
    ],
  },
  {
    name: 'Zatrzymanie Drogowe',
    maxPoints: 10,
    items: [
      { label: 'Informacja o nakazie zatrzymania (ALT)', points: 1, checked: false },
      { label: 'Użycie sygnałów świetlnych i dźwiękowych', points: 1, checked: false },
      { label: 'Prawidłowe użycie megafonu', points: 1, checked: false },
      { label: 'Zatrzymanie się w bezpiecznym, wyznaczonym miejscu', points: 1, checked: false },
      { label: 'Ustawienie radiowozu (odpowiedni kąt/odległość)', points: 1, checked: false },
      { label: 'Przedstawienie się i podanie stopnia', points: 1, checked: false },
      { label: 'Podanie powodu zatrzymania', points: 1, checked: false },
      { label: 'Prośba o okazanie prawa jazdy', points: 1, checked: false },
      { label: 'Weryfikacja osoby i pojazdu w MDT', points: 1, checked: false },
      { label: 'Symulacja mandatu/pouczenia i zwrot dokumentów', points: 1, checked: false },
    ],
  },
  {
    name: 'Zabezpieczenie Terenu',
    maxPoints: 11,
    items: [
      { label: 'Odpowiednia wielkość strefy', points: 1, checked: false, group: 'Ocena wielkości strefy zagrożenia' },
      { label: 'Zapewnienie miejsca dla pojazdów ratowniczych', points: 1, checked: false, group: 'Ocena wielkości strefy zagrożenia' },
      { label: 'Użycie radiowozu jako zabezpieczenie', points: 1, checked: false, group: 'Ustawienie radiowozu jako bariery' },
      { label: 'Poprawne ustawienie kierunkowe radiowozu', points: 1, checked: false, group: 'Ustawienie radiowozu jako bariery' },
      { label: 'Użycie barierek', points: 1, checked: false, group: 'Zabezpieczenie zgodnie z normami' },
      { label: 'Użycie pachołków', points: 1, checked: false, group: 'Zabezpieczenie zgodnie z normami' },
      { label: 'Użycie znaków drogowych', points: 1, checked: false, group: 'Zabezpieczenie zgodnie z normami' },
      { label: 'Zachowanie estetyki i równej linii barierek/pachołków', points: 1, checked: false },
      { label: 'Brak utrudniania przejazdu w miejscach nieobjętych zdarzeniem', points: 1, checked: false },
      { label: 'Oznaczenie miejsca kolizji/zdarzenia na drodze', points: 1, checked: false },
      { label: 'Utrzymanie widoczności (świetlne)', points: 1, checked: false },
    ],
  },
  {
    name: 'Pierwsza Pomoc (PPP)',
    maxPoints: 15,
    items: [
      { label: 'Sprawdzenie bezpieczeństwa własnego i otoczenia', points: 1, checked: false },
      { label: 'Założenie rękawiczek', points: 1, checked: false },
      { label: 'Sprawdzenie przytomności poszkodowanego', points: 1, checked: false },
      { label: 'Weryfikacja stanu przez komendę /do', points: 1, checked: false },
      { label: 'Ułożenie poszkodowanego w pozycji bezpiecznej', points: 1, checked: false },
      { label: 'Prawidłowe powiadomienie EMS', points: 1, checked: false },
      { label: 'Udrożnienie dróg oddechowych', points: 1, checked: false },
      { label: 'Sprawdzenie tętna/oddechu', points: 1, checked: false },
      { label: 'Rana cięta lub kłuta — opatrunek', points: 1, checked: false, group: 'Zastosowanie środka opatrunkowego' },
      { label: 'Złamanie/ciało obce — Stabilizacja (unieruchomienie)', points: 1, checked: false, group: 'Zastosowanie środka opatrunkowego' },
      { label: 'Złamanie/ciało obce — Ochrona (jałowe osłonięcie, okład)', points: 1, checked: false, group: 'Zastosowanie środka opatrunkowego' },
      { label: 'Złamanie/ciało obce — Kontrola krążenia (tętno palce/stopa)', points: 1, checked: false, group: 'Zastosowanie środka opatrunkowego' },
      { label: 'Wykonanie RKO (jeśli wymagane przez /do)', points: 1, checked: false },
      { label: 'Zabezpieczenie termiczne poszkodowanego', points: 1, checked: false },
      { label: 'Przekazanie raportu medycznego po przyjeździe EMS', points: 1, checked: false },
    ],
  },
];

export const TRAINEE_PASS_THRESHOLD = 37;

// ==================== Pościgowy Verification Items ====================

export const POSCIGOWY_VERIFICATION_ITEMS: string[] = [
  'Informacja o nakazie zatrzymania (ALT)',
  'Użycie sygnałów świetlnych i dźwiękowych',
  'Symulacja zgłoszenia pościgu',
  'Stosowanie się do bezpiecznego stylu jazdy',
  'Wydanie zgód',
  'Informacja o nakazie zatrzymania (ALT) po przesiadce kierowcy',
  'Redukcja dźwiękowych (o ile CODE 100)',
  'Wydanie zgód na kolce / skracanie zakrętów',
  'Wydanie zgód na ostrzał',
  'Prawidłowa odmowa wydania zgody na manewr (np. most, tunel)',
  'Prawidłowe wykonanie manewru',
];

// ==================== Stage Definitions ====================

export const SEU_STAGES = ['Etap 1', 'Etap 2', 'Etap 3'];
export const POSCIGOWY_STAGES = ['Etap 1 – Trasa', 'Etap 2 – Pościg', 'Etap 3 – FTS'];

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
