// ============================================
// Report Type Configuration per Division
// ============================================

export type FieldType = 'text' | 'textarea' | 'select';

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface ReportTypeDefinition {
  id: string;
  label: string;
  icon: string; // emoji
  fields: FormFieldDefinition[];
}

export interface DivisionReportConfig {
  divisionId: string;
  reportTypes: ReportTypeDefinition[];
}

// ============================================
// Shared field definitions (reused across divisions)
// ============================================

const FIELD_WYNIK_UJETO: FormFieldDefinition = {
  id: 'wynik',
  label: 'Wynik',
  type: 'select',
  required: true,
  options: [
    { value: 'ujeto', label: 'Ujęto' },
    { value: 'nie_ujeto', label: 'Nie ujęto' },
    { value: 'w_toku', label: 'W toku' },
  ],
};

const FIELD_WYNIK_WYKONANO: FormFieldDefinition = {
  id: 'wynik',
  label: 'Wynik',
  type: 'select',
  required: true,
  options: [
    { value: 'wykonano', label: 'Wykonano' },
    { value: 'nie_wykonano', label: 'Nie wykonano' },
  ],
};

const FIELD_WYNIK_SUKCES: FormFieldDefinition = {
  id: 'wynik',
  label: 'Wynik',
  type: 'select',
  required: true,
  options: [
    { value: 'sukces', label: 'Sukces' },
    { value: 'niepowodzenie', label: 'Niepowodzenie' },
  ],
};

// Shared report type definitions
const REPORT_MORDERSTWO: ReportTypeDefinition = {
  id: 'morderstwo',
  label: 'Raport z morderstwa/denata',
  icon: '💀',
  fields: [
    { id: 'ofiara', label: 'Ofiara', type: 'text', required: true, placeholder: 'Imię i nazwisko ofiary' },
    { id: 'podejrzany', label: 'Podejrzany', type: 'text', required: false, placeholder: 'Imię i nazwisko podejrzanego' },
    {
      id: 'rodzaj',
      label: 'Rodzaj',
      type: 'select',
      required: true,
      options: [
        { value: 'morderstwo', label: 'Morderstwo' },
        { value: 'denat', label: 'Denat' },
        { value: 'nieustalony', label: 'Nieustalony' },
      ],
    },
    { id: 'dowody', label: 'Znalezione dowody', type: 'textarea', required: false, placeholder: 'Opis znalezionych dowodów...' },
  ],
};

const REPORT_PRZESZUKANIE: ReportTypeDefinition = {
  id: 'przeszukanie',
  label: 'Raport z przeszukania nieruchomości/pojazdu',
  icon: '🔍',
  fields: [
    {
      id: 'typ_przeszukania',
      label: 'Typ',
      type: 'select',
      required: true,
      options: [
        { value: 'nieruchomosc', label: 'Nieruchomość' },
        { value: 'pojazd', label: 'Pojazd' },
      ],
    },
    { id: 'numer_nakazu', label: 'Numer nakazu', type: 'text', required: false, placeholder: 'Nr nakazu (jeśli dotyczy)' },
    { id: 'znalezione_przedmioty', label: 'Znalezione przedmioty', type: 'textarea', required: false, placeholder: 'Lista znalezionych przedmiotów...' },
  ],
};

const REPORT_NAKAZ: ReportTypeDefinition = {
  id: 'nakaz',
  label: 'Raport z wykonania nakazu',
  icon: '📜',
  fields: [
    {
      id: 'typ_nakazu',
      label: 'Typ nakazu',
      type: 'select',
      required: true,
      options: [
        { value: 'aresztowanie', label: 'Aresztowanie' },
        { value: 'przeszukanie', label: 'Przeszukanie' },
        { value: 'inne', label: 'Inne' },
      ],
    },
    { id: 'cel', label: 'Cel nakazu', type: 'text', required: true, placeholder: 'Osoba/miejsce objęte nakazem' },
    { id: 'wydany_przez', label: 'Wydany przez', type: 'text', required: true, placeholder: 'Organ wydający nakaz' },
    FIELD_WYNIK_WYKONANO,
  ],
};

// ============================================
// Division-specific configurations
// ============================================

const DTU_CONFIG: DivisionReportConfig = {
  divisionId: 'DTU',
  reportTypes: [
    {
      id: 'oblawa',
      label: 'Raport z obławy',
      icon: '🎯',
      fields: [
        { id: 'cel_oblawy', label: 'Cel obławy', type: 'text', required: true, placeholder: 'Cel/powód obławy' },
        { id: 'opis_podejrzanego', label: 'Opis podejrzanego', type: 'textarea', required: false, placeholder: 'Rysopis podejrzanego...' },
        FIELD_WYNIK_UJETO,
      ],
    },
    REPORT_MORDERSTWO,
    REPORT_PRZESZUKANIE,
    REPORT_NAKAZ,
  ],
};

const GU_CONFIG: DivisionReportConfig = {
  divisionId: 'GU',
  reportTypes: [
    {
      id: 'aresztowanie_gangu',
      label: 'Raport z aresztowania członka gangu',
      icon: '🚔',
      fields: [
        { id: 'gang', label: 'Gang', type: 'text', required: true, placeholder: 'Nazwa gangu' },
        { id: 'podejrzany', label: 'Podejrzany', type: 'text', required: true, placeholder: 'Imię i nazwisko podejrzanego' },
        { id: 'zarzuty', label: 'Zarzuty', type: 'textarea', required: true, placeholder: 'Lista zarzutów...' },
      ],
    },
    {
      id: 'gang_suppression',
      label: 'Raport z gang suppression',
      icon: '⚡',
      fields: [
        { id: 'gang', label: 'Gang', type: 'text', required: true, placeholder: 'Nazwa gangu' },
        { id: 'typ_operacji', label: 'Typ operacji', type: 'text', required: true, placeholder: 'Rodzaj przeprowadzonej operacji' },
        { id: 'wynik_opis', label: 'Wynik operacji', type: 'textarea', required: false, placeholder: 'Opis wyniku operacji...' },
      ],
    },
    REPORT_MORDERSTWO,
    REPORT_PRZESZUKANIE,
    REPORT_NAKAZ,
  ],
};

const SWAT_CONFIG: DivisionReportConfig = {
  divisionId: 'SWAT',
  reportTypes: [
    {
      id: 'mobilizacja',
      label: 'Raport z mobilizacji',
      icon: '🚨',
      fields: [
        { id: 'powod', label: 'Powód mobilizacji', type: 'text', required: true, placeholder: 'Powód mobilizacji jednostki' },
        { id: 'sklad_jednostki', label: 'Skład jednostki', type: 'textarea', required: false, placeholder: 'Skład zaangażowanej jednostki...' },
        FIELD_WYNIK_SUKCES,
      ],
    },
    {
      id: 'bomba',
      label: 'Raport z bomby',
      icon: '💣',
      fields: [
        { id: 'typ_ladunku', label: 'Typ ładunku', type: 'text', required: true, placeholder: 'Rodzaj ładunku wybuchowego' },
        { id: 'metoda_neutralizacji', label: 'Metoda neutralizacji', type: 'textarea', required: false, placeholder: 'Opis metody neutralizacji...' },
        {
          id: 'wynik',
          label: 'Wynik',
          type: 'select',
          required: true,
          options: [
            { value: 'zneutralizowano', label: 'Zneutralizowano' },
            { value: 'detonacja', label: 'Detonacja' },
            { value: 'ewakuacja', label: 'Ewakuacja' },
          ],
        },
      ],
    },
    {
      id: 'cqb',
      label: 'Raport z CQB',
      icon: '🏢',
      fields: [
        { id: 'cel_operacji', label: 'Cel operacji', type: 'text', required: true, placeholder: 'Cel operacji CQB' },
        { id: 'typ_budynku', label: 'Typ budynku', type: 'text', required: false, placeholder: 'Rodzaj budynku/obiektu' },
        FIELD_WYNIK_SUKCES,
      ],
    },
    {
      id: 'riot_control',
      label: 'Raport z Riot Control',
      icon: '🛡️',
      fields: [
        { id: 'powod_zamieszek', label: 'Powód zamieszek', type: 'text', required: true, placeholder: 'Przyczyna zamieszek' },
        { id: 'uzyte_srodki', label: 'Użyte środki', type: 'textarea', required: false, placeholder: 'Zastosowane środki przymusu...' },
        {
          id: 'wynik',
          label: 'Wynik',
          type: 'select',
          required: true,
          options: [
            { value: 'opanowano', label: 'Opanowano' },
            { value: 'eskalacja', label: 'Eskalacja' },
          ],
        },
      ],
    },
    {
      id: 'napad',
      label: 'Raport z Napadu',
      icon: '🔫',
      fields: [
        {
          id: 'typ_napadu',
          label: 'Typ napadu',
          type: 'select',
          required: true,
          options: [
            { value: 'bank', label: 'Bank' },
            { value: 'sklep', label: 'Sklep' },
            { value: 'jubiler', label: 'Jubiler' },
            { value: 'inne', label: 'Inne' },
          ],
        },
        { id: 'liczba_podejrzanych', label: 'Liczba podejrzanych', type: 'text', required: false, placeholder: 'Szacowana liczba podejrzanych' },
        {
          id: 'zakladnicy',
          label: 'Zakładnicy',
          type: 'select',
          required: true,
          options: [
            { value: 'tak', label: 'Tak' },
            { value: 'nie', label: 'Nie' },
          ],
        },
        FIELD_WYNIK_UJETO,
      ],
    },
  ],
};

const SS_CONFIG: DivisionReportConfig = {
  divisionId: 'SS',
  reportTypes: [
    {
      id: 'strzaly',
      label: 'Raport ze strzałów',
      icon: '🎯',
      fields: [
        { id: 'kto_oddal', label: 'Kto oddał strzały', type: 'text', required: true, placeholder: 'Imię i nazwisko strzelca' },
        { id: 'powod', label: 'Powód', type: 'textarea', required: true, placeholder: 'Okoliczności użycia broni...' },
        { id: 'poszkodowani', label: 'Poszkodowani', type: 'textarea', required: false, placeholder: 'Informacje o poszkodowanych...' },
        {
          id: 'wynik',
          label: 'Ocena',
          type: 'select',
          required: true,
          options: [
            { value: 'uzasadnione', label: 'Uzasadnione' },
            { value: 'nieuzasadnione', label: 'Nieuzasadnione' },
            { value: 'w_toku', label: 'W toku' },
          ],
        },
      ],
    },
    {
      id: 'akcja',
      label: 'Raport z akcji',
      icon: '⚔️',
      fields: [
        { id: 'typ_akcji', label: 'Typ akcji', type: 'text', required: true, placeholder: 'Rodzaj przeprowadzonej akcji' },
        { id: 'wynik_opis', label: 'Wynik akcji', type: 'textarea', required: false, placeholder: 'Opis wyniku akcji...' },
      ],
    },
  ],
};

// ============================================
// Export: config per division
// ============================================

export const DIVISION_REPORT_CONFIGS: Record<string, DivisionReportConfig> = {
  DTU: DTU_CONFIG,
  GU: GU_CONFIG,
  SWAT: SWAT_CONFIG,
  SS: SS_CONFIG,
};

export function getReportConfig(divisionId: string): DivisionReportConfig | null {
  return DIVISION_REPORT_CONFIGS[divisionId] || null;
}

export function getReportTypeDefinition(divisionId: string, reportType: string): ReportTypeDefinition | null {
  const config = getReportConfig(divisionId);
  if (!config) return null;
  return config.reportTypes.find((rt) => rt.id === reportType) || null;
}

// Division colors for webhooks
export const DIVISION_COLORS: Record<string, number> = {
  DTU: 0x60a5fa,
  GU: 0x10b981,
  SWAT: 0xc41e1e,
  SS: 0xff8c00,
};
