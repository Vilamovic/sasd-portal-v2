'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

interface TemplatePresetsProps {
  onInsert: (html: string) => void;
}

const TEMPLATES: Record<string, { label: string; html: string }> = {
  procedura: {
    label: 'Procedura (FTS/Pościg)',
    html: `<h1>I. INICJACJA I WARUNKI PRZEPROWADZENIA</h1>
<p>Procedurę wdrażamy, gdy:</p>
<ul>
  <li>Warunek 1...</li>
  <li>Warunek 2...</li>
  <li>Warunek 3...</li>
</ul>

<h1>II. MELDUNEK RADIOWY (10-40)</h1>
<p>Przed rozpoczęciem procedury należy nadać meldunek:</p>
<p><strong>Wzór:</strong> [Kryptonim], 10-40, [Model/Kolor], [Liczba osób], 10-20 [Lokalizacja], CODE 6 at [Kanał TAC].</p>
<p><em>Przykład: LINCOLN-25, 10-40, biały Buffalo, 2 osoby, SF Easter Basin, 10-20, CODE 6 at TAC-1.</em></p>

<h1>III. PROCEDURA KROK PO KROKU</h1>
<ol>
  <li><strong>Krok 1:</strong> Opis pierwszego kroku...</li>
  <li><strong>Krok 2:</strong> Opis drugiego kroku...</li>
  <li><strong>Krok 3:</strong> Opis trzeciego kroku...</li>
</ol>

<h1>IV. ZAKOŃCZENIE</h1>
<p>Po zakończeniu procedury należy...</p>`,
  },
  regulamin: {
    label: 'Regulamin/Zasady',
    html: `<h1>I. DEFINICJA I INICJACJA</h1>
<p><strong>Definicja:</strong> Krótki opis pojęcia lub zasady...</p>
<p>Inicjacja następuje gdy...</p>

<h1>II. SZYKI I STRUKTURA</h1>
<ol>
  <li><strong>Szyk "Gęsiego":</strong> Standardowy, jazda w linii jedna za drugą. Stosowany na drogach jednopasmowych/jednojezdniowych.</li>
  <li><strong>Szyk "Szachownicy":</strong> Stosowany na drogach wielopasmowych i jako przygotowanie do manewrów.</li>
</ol>

<h1>III. PROCEDURA</h1>
<p>Szczegółowy opis przebiegu procedury...</p>

<h1>IV. DODATKOWE ZASADY</h1>
<ul>
  <li>Zasada 1...</li>
  <li>Zasada 2...</li>
  <li>Zasada 3...</li>
</ul>`,
  },
  dywizja: {
    label: 'Materiał Dywizji',
    html: `<h1>CHARAKTERYSTYKA DYWIZJI</h1>

<h2>Definicja</h2>
<p>Jednostka wyspecjalizowana odpowiedzialna za...</p>

<h2>Zakres działań</h2>
<ul>
  <li>Realizacja operacji o najwyższym stopniu ryzyka...</li>
  <li>Interwencje wobec uzbrojonych grup przestępczych...</li>
  <li>Wsparcie jednostek podczas pościgów...</li>
</ul>

<h2>Obowiązki</h2>
<p>Lista obowiązków członków dywizji:</p>
<ul>
  <li>Obowiązek 1...</li>
  <li>Obowiązek 2...</li>
</ul>

<h2>Przywileje</h2>
<p>Dostęp do zaawansowanego arsenału, uprawnienia do...</p>

<h2>Profil kandydata</h2>
<p>Wymagania:</p>
<ul>
  <li>Doświadczenie w pracy w grupie...</li>
  <li>Umiejętność przekazywania wiedzy...</li>
  <li>Nieznaganna postawa służbowa i dyscyplina...</li>
</ul>`,
  },
  lista: {
    label: 'Lista kroków',
    html: `<h2>Tytuł sekcji</h2>
<ol>
  <li><strong>Punkt 1:</strong> Opis pierwszego punktu...</li>
  <li><strong>Punkt 2:</strong> Opis drugiego punktu...</li>
  <li><strong>Punkt 3:</strong> Opis trzeciego punktu...</li>
</ol>

<h2>Uwagi</h2>
<ul>
  <li>Uwaga 1...</li>
  <li>Uwaga 2...</li>
</ul>`,
  },
  pusty: {
    label: 'Pusty (wyczyść)',
    html: '<p><br></p>',
  },
};

/**
 * TemplatePresets - Dropdown z przykładowymi szablonami HTML
 * - 5 presetów: Procedura, Regulamin, Dywizja, Lista, Pusty
 * - Wkleja HTML do QuillEditor jako starting point
 */
export default function TemplatePresets({ onInsert }: TemplatePresetsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (template) {
      onInsert(template.html);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-win95 font-mono text-xs flex items-center gap-1"
      >
        <FileText className="w-3 h-3" />
        Wstaw szablon
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-[9999] panel-raised min-w-[220px]"
          style={{ backgroundColor: 'var(--mdt-btn-face)' }}
        >
          {Object.entries(TEMPLATES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelect(key)}
              className="w-full text-left px-3 py-2 font-mono text-xs transition-colors border-b border-[var(--mdt-border-mid)] last:border-b-0 hover:bg-[var(--mdt-blue-bar)] hover:text-white"
              style={{ color: 'var(--mdt-content-text)' }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop (close on outside click) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
