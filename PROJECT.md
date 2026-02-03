# 🛡️ SASD Portal - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [AI Operational Rules](#ai-operational-rules)
3. [Project Architecture](#project-architecture)
4. [UI Design System (Police Dark Theme)](#ui-design-system-police-dark-theme)
5. [Completed Features & Tasks](#completed-features--tasks)
6. [Technical Patterns](#technical-patterns)
7. [Deployment & Troubleshooting](#deployment--troubleshooting)
8. [File Locations](#file-locations)

---

## 📖 Project Overview

**SASD Portal** - Portal szkoleniowy San Andreas Sheriff's Department (MTA)

### Identity & Security
- **Main Developer**: sancte_padre (UUID: `c254fb57-72d4-450c-87b7-cd7ffad5b715`)
- **Hierarchy**: `dev` (Super-user) > `admin` > `user`
- **Rule**: Rola `dev` jest przypisana na sztywno do UUID w AuthContext.jsx. Jest **NIETYKALNA**.

### Core Technologies
- **Frontend**: Next.js 14, React 19, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RPC)
- **Editor**: React-Quill (WYSIWYG)
- **Webhooks**: Discord notifications
- **Deployment**: Vercel (auto-deploy on push to master)

---

## ⚙️ AI Operational Rules

### CRITICAL - Must Follow ALWAYS

1. **WAIT FOR TASK**
   - Twoim pierwszym zadaniem po przeczytaniu briefu jest potwierdzenie gotowości i zapytanie: "Co dzisiaj robimy?"
   - **NIE GENERUJ** kodu dopóki nie otrzymasz konkretnego zadania

2. **PLANNING FIRST (To-Do List)**
   - Gdy otrzymasz zadanie, wypisz listę kroków w formacie: `[ ] krok 1, [ ] krok 2`
   - W każdej kolejnej odpowiedzi odhaczaj ukończone zadania `[X]` i pokazuj postęp
   - Używaj TodoWrite tool do trackowania

3. **AUTONOMOUS DETECTIVE**
   - Samodzielnie analizuj strukturę plików
   - **NIE PYTAJ** o lokalizację istniejącej logiki
   - Używaj Glob, Grep, Read do eksploracji

4. **NO NEW FILES**
   - **NIE TWÓRZ** nowych plików bez wyraźnej zgody
   - Jeśli nowa funkcja wymaga nowego pliku → **MUSISZ** zapytać o pozwolenie

5. **PRESERVE BUSINESS LOGIC**
   - **NIE ZMIENIAJ** logiki w funkcjach (useEffect, handlers, async operations)
   - **TYLKO UI**: kolory, layout, classes, ikony
   - Przykład: W ExamTaker zachowaj `generateExam()`, `calculateExamResult()`, `saveExamResult()`

6. **DRY & UTILS**
   - Używaj istniejących narzędzi (np. `generateExam` z examUtils.js, supabaseHelpers.js)

7. **STALE CLOSURES**
   - W AuthContext i listenerach używaj `useRef` (np. `userRef`, `hasNotifiedLogin`)

8. **DEPLOYMENT AWARENESS**
   - Po zakończeniu prac przypomnij o `git commit` i `push` na GitHub
   - Vercel automatycznie deployuje po pushu

---

## 🏗️ Project Architecture

### 📂 src/data/ (Stałe Dane)
- **examQuestions.js**: Baza 30 pytań do egzaminu (LEGACY - nie używane)
- **materials.js**: Domyślne treści szkoleniowe Markdown (LEGACY)
- **translations.js**: Tłumaczenia UI (wielojęzyczność)
- **iconMap.js**: Ikony Lucide React

### 📂 src/contexts/ (Stan Globalny)

#### AuthContext.jsx
**Główny context sesji użytkownika**
- Sesja Supabase Auth
- Polling roli z bazy (co 5s)
- Reload przy zmianie uprawnień
- Sprawdzanie `mta_nick` po logowaniu (`checkMtaNick`)
- Obsługa modala MTA nick (`showMtaNickModal`, `handleMtaNickComplete`)
- Discord notifications **TYLKO** dla rejestracji (nie login/logout)
- **Force Logout System**:
  - `loginTimestampRef` śledzi czas logowania
  - Interval (co 5s) sprawdza `force_logout_after` w bazie
  - Wymusza wylogowanie jeśli `timestamp > loginTime`
  - `forceLogoutAll()`: dev → wszyscy oprócz dev, admin → tylko userzy

#### TranslationContext.jsx
- Obsługa wielojęzyczności (`t()` function)
- PL/EN support

### 📂 src/components/ (UI Components)

#### auth/Login.jsx
- Discord OAuth login
- Złota odznaka z pulsującym glow
- Police dark background
- Złote bullet points w features list

#### auth/MtaNickModal.jsx
- Modal do ustawienia nicku MTA
- Wyświetla się jednorazowo po pierwszym logowaniu (dla użytkowników bez `mta_nick`)
- Walidacja 3-24 znaki
- Anti-spam (`useRef`)

#### dashboard/Dashboard.jsx
- Główny ekran z kafelkami nawigacyjnymi
- 3 karty z glow effect on hover
- Ikony w kolorowych square containers (badge-gold/blue/purple)
- Live stats (12 dokumentów, 7 typów egzaminów)
- Call-to-action buttons (gradient)

#### dashboard/Navbar.jsx
- Górna belka nawigacyjna
- Złota odznaka z pulsującym glow
- Ikony przy każdej sekcji (Shield, Gamepad2, Mail, LogOut)
- Kolorowe role badges (czerwony=dev, fioletowy=admin, niebieski=user)
- Online indicator (zielony punkt)
- "TRAINING PORTAL" subtitle w złotym kolorze
- **Fixed dropdown bug** (tekst się nakładał)

#### exam/Exam.jsx
- Router systemu egzaminacyjnego
- Zarządza nawigacją między: ExamDashboard, ExamTaker, ExamStatistics, ExamQuestions, ExamArchive

#### exam/ExamDashboard.jsx
- **User view**: duża centered karta "Rozpocznij Egzamin"
- **Admin/Dev view**: grid 4 kafelków (Start, Statistics, Questions, Archive)
- Konsystentny design z Dashboard

#### exam/ExamTaker.jsx
**Frontend egzaminu**
- Wykorzystuje `examUtils.js`
- Generuje `exam_id`, zapisuje do `exam_results` z `exam_type_id`
- **Obsługa pytań wielokrotnego wyboru** (checkboxy)
- **Timer dla każdego pytania**:
  - Auto-advance przy timeout (zapisuje `-1` jako "nie wybrano")
  - Timer colors: >10s=zielony, 6-10s=żółty, <5s=czerwony
- **Brak przycisku "Poprzednie"**
- **Progi zdawalności**:
  - trainee/pościgowy/SWAT: **50%**
  - pozostałe (gu/dtu/ss/advanced): **75%**
- **Walidacja odpowiedzi**:
  - Single choice: porównanie wartości
  - Multiple choice: porównanie posortowanych tablic
- 3 ekrany: Wybór typu → Interface pytań → Wyniki

#### exam/ExamStatistics.jsx
**Wyświetla wyniki egzaminów (nie-zarchiwizowane)**
- Wyszukiwanie po nicku/ID
- Filtrowanie po typie egzaminu
- Archiwizacja wyników
- **Szczegóły pytanie-po-pytaniu modal**:
  - Header: Nick (główny tytuł), Badge (podtytuł)
  - Kolumna "Nick" (nie "Zdający")
- **Obsługa pytań wielokrotnego wyboru w wynikach**:
  - Zielone = poprawnie wybrano
  - Niebieskie = poprawne nie wybrano
  - Czerwone = błędnie wybrano
- **Wyświetla "Nie wybrano odpowiedzi"** dla timeout (-1)
- **Kontrola dostępu**: user (brak), admin/dev (pełny)

#### exam/ExamQuestions.jsx
**Zarządzanie pytaniami egzaminacyjnymi**
- Wybór typu → lista pytań → formularz add/edit/delete
- Pytanie, 4 odpowiedzi, multiple choice checkbox
- **Edycja in-place** (formularz pojawia się na miejscu klikniętego pytania, scroll preserved)
- Discord webhooks przy add/edit/delete
- 7 typów egzaminów: trainee, pościgowy, swat, gu, dtu, ss, advanced

#### exam/ExamArchive.jsx
**Zarchiwizowane egzaminy**
- Wyszukiwanie po nicku/ID
- Filtrowanie po typie egzaminu
- Przycisk "Usuń" (trwałe usunięcie)
- Discord webhooks przy delete

#### materials/Materials.jsx
**WYSIWYG editor dla adminów**
- React-Quill editor
- Materiały w Supabase (tabela `materials`)
- localStorage jako cache
- **Dropdown "Zarządzaj"** (dodawanie/usuwanie)
- **Pełnoekranowy widok edycji**
- Auto-render obrazów
- Sidebar z listą materiałów (police-dark-700 bg)

#### admin/AdminPanel.jsx
**Panel zarządzania użytkownikami**
- RPC `update_user_role`
- Force Logout + Delete User
- **Wyszukiwanie po nicku/username/badge** (bez emailu dla non-dev)
- **Dropdown "Akcja"** nad przyciskiem:
  - Dev: Nadaj/Odbierz Admin, Wyrzuć
  - Admin: Wyrzuć (tylko userów)
- **Sortowanie**: username, nick, badge, role, created_at, last_seen (klik nagłówki ze strzałkami ↑↓)
- **Przycisk "Wyrzuć"**:
  1. `setForceLogoutForUser()` (force logout)
  2. Wait 2s
  3. `deleteUser()` (trwałe usunięcie z bazy)
- Discord webhook przy usunięciu
- **Email maskowane** (dev only)
- Kolumna "Nick" przed "Użytkownik" z `mta_nick`

### 📂 src/utils/ (Logika Biznesowa)

#### examUtils.js
- `generateExam()`: Losowanie pytań, Fisher-Yates shuffle odpowiedzi

#### supabaseHelpers.js
**Wszystkie CRUDy tabel**

**Users**:
- `upsertUser()`
- `getUserById()`
- `updateMtaNick()`
- `updateUserRole()`
- `deleteUser()`

**Exam Results**:
- `getAllExamResults()`
- `getAllExamResultsNonArchived()`
- `getAllExamResultsArchived()`
- `archiveExamResult()`
- `deleteExamResult()`
- `saveExamResult()`

**Exam Types**:
- `getAllExamTypes()`

**Exam Questions**:
- `getQuestionsByExamType()`
- `addExamQuestion()`
- `updateExamQuestion()`
- `deleteExamQuestion()`

**Materials**:
- `getAllMaterials()`
- `upsertMaterial()`
- `deleteMaterialFromDb()`
- `seedMaterials()`

**Force Logout**:
- `setForceLogoutForUser(userId)` - pojedynczy user
- `setForceLogoutTimestamp(role)` - role-based: 'all' dla dev, 'user' dla admin

#### discord.js
**API Webhooków**

**Channels**:
- `#portal-exams` - powiadomienia o egzaminach
- `#portal-admin` - akcje administratora

**Functions**:
- `notifyUserAuth()` - **TYLKO rejestracja** (nie login/logout)
- `notifyExamSubmission(examType, passingThreshold)` - z typem egzaminu i progiem zdania
- `notifyAdminAction(targetUser)` - z opcjonalnym targetUser dla akcji na użytkowniku
- `notifyExamQuestionAction()` - add/edit/delete pytań

---

## 🎨 UI Design System (Police Dark Theme)

### Color Palette

#### Główne Kolory
```css
/* Tła */
police-dark-900: #0a0f1a  /* Najciemniejsze */
police-dark-800: #151c28
police-dark-700: #1a2332  /* Karty */
police-dark-600: #1e2836  /* Dropdown */

/* Złote Akcenty (Odznaka Sherifa) */
badge-gold-600: #d4af37
badge-gold-500: #e5c158
badge-gold-400: #fbbf24

/* Niebieski Policyjny */
police-blue-700: #1e40af
police-blue-600: #2563eb
police-blue-500: #3b82f6
police-blue-400: #60a5fa

/* Statusy */
Success: #10b981 (zielony)
Warning: #f59e0b (amber)
Danger: #ef4444 (czerwony)
Info: #3b82f6 (niebieski)
```

### Standard Component Patterns

#### 1. Page Background
```jsx
<div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-police-dark-900 via-police-dark-800 to-police-dark-700 p-8">
```

#### 2. Page Header
```jsx
<div className="mb-8">
  <h2 className="text-4xl font-bold text-white mb-2">
    TYTUŁ SEKCJI
  </h2>
  <div className="w-24 h-1 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 rounded-full"></div>
  <p className="text-gray-400 mt-4">
    Opis sekcji
  </p>
</div>
```

#### 3. Card with Glow Effect
```jsx
<div className="group relative">
  {/* Glow effect */}
  <div className="absolute inset-0 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500"></div>

  {/* Main card */}
  <div className="relative bg-police-dark-700 rounded-2xl p-6 border border-white/10 hover:border-badge-gold-600/50 transition-all duration-300 hover:scale-[1.02] shadow-xl hover:shadow-2xl">
    {/* Icon */}
    <div className="w-14 h-14 bg-gradient-to-br from-badge-gold-600 to-badge-gold-400 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
    </div>

    {/* Content + Stats + Button */}
  </div>
</div>
```

#### 4. Buttons

**Gold Primary Button** (CTA, główne akcje):
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-badge-gold-600 to-badge-gold-400 hover:from-badge-gold-400 hover:to-badge-gold-600 text-police-dark-900 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg">
  Tekst Przycisku
</button>
```

**Blue Secondary Button** (edycja, akcje secondary):
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg">
  Edytuj
</button>
```

**Green Success Button** (zapisz, dodaj):
```jsx
<button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors">
  Zapisz
</button>
```

**Red Danger Button** (usuń):
```jsx
<button className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors">
  Usuń
</button>
```

**Back Button Pattern**:
```jsx
<button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all duration-200">
  <ChevronLeft className="w-5 h-5" />
  <span className="text-sm font-medium">Powrót</span>
</button>
```

#### 5. Inputs

**Text Input / Search**:
```jsx
<input
  type="text"
  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-badge-gold-400 transition-colors"
  placeholder="Placeholder..."
/>
```

**Select Dropdown**:
```jsx
<select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:border-badge-gold-400 transition-colors">
  <option value="all" className="bg-police-dark-700">Wszystkie typy</option>
</select>
```

#### 6. Tables

**Table Container**:
```jsx
<div className="bg-police-dark-700 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden shadow-xl">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-white/5 border-b border-white/10">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Header</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-white/10 hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 text-white">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### 7. Loading Spinner
```jsx
<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-badge-gold-400 mx-auto mb-4"></div>
<p className="text-gray-400">Ładowanie...</p>
```

#### 8. Modal
```jsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="bg-police-dark-700 rounded-xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
    {/* Header */}
    <div className="p-6 border-b border-white/10">
      {/* Content */}
    </div>

    {/* Body */}
    <div className="p-6 overflow-y-auto flex-grow">
      {/* Content */}
    </div>

    {/* Footer */}
    <div className="p-6 border-t border-white/10">
      {/* Buttons */}
    </div>
  </div>
</div>
```

### Lucide React Icons (Commonly Used)
- **Shield** - odznaka (logo, role)
- **Target** - egzaminy
- **BookOpen** - materiały
- **CheckCircle** - success/correct
- **XCircle** - error/incorrect
- **Clock** - timer
- **ArrowRight** - CTA buttons
- **ChevronLeft** - back buttons
- **Trophy** - passing threshold
- **AlertCircle** - warnings
- **Search** - search bars
- **Archive** - archiwum
- **Eye** - szczegóły/preview
- **Edit2** - edycja
- **Trash2** - usuwanie
- **Plus** - dodawanie

### Responsive Patterns
```jsx
// Grid responsive
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Hide on mobile
hidden md:flex

// Text sizes responsive
text-4xl md:text-5xl
```

---

## ✅ Completed Features & Tasks

### Phase 1-5: Initial Development
✅ Complete UI redesign based on reference design
✅ Exam system implementation (7 types)
✅ Materials editor & AdminPanel
✅ Discord OAuth authentication
✅ MTA nick setup modal

### Zadanie 1: Refaktor Sekcji Materiałów ✅
- [X] Nowy UX Zarządzania: Dropdown "Zarządzaj" zamiast osobnych przycisków
- [X] Widok Tworzenia: Pełnoekranowy editor (ukrywa listę materiałów)
- [X] Nowy Edytor: React-Quill z pełnym WYSIWYG
- [X] Obsługa Obrazów: Auto-render obrazów z linków
- [X] Skróty klawiszowe: Ctrl+Z, Ctrl+C, Ctrl+V, Ctrl+X
- [X] Placeholder: Czytelne placeholdery w polach edycji

### Zadanie 2: Logowanie i Profile ✅
- [X] Rejestracja Nicku: Modal "Ustaw nick z SocialProject (MTA)" po pierwszym logowaniu
- [X] Ograniczenie Logów: Discord wysyła TYLKO powiadomienia o rejestracji (nie login/logout)

### Zadanie 3: System Egzaminacyjny ✅
- [X] Nowy Layout Egzaminu: 4 kafelki (Zacznij, Statystyki, Zarządzanie, Archiwum)
- [X] Moje Statystyki:
  - [X] Zgłoszenia egzaminacyjne (user: brak dostępu, admin/dev: pełny)
  - [X] Zmiana "zastępca" na "zdający"
  - [X] Kolumna "ID" z exam_id
  - [X] Wyszukiwanie po nicku/ID
  - [X] Możliwość przeniesienia do archiwum
- [X] Zarządzanie Pytaniami:
  - [X] Wybór typu egzaminu (7 typów)
  - [X] CRUD pytań: pytanie + 4 odpowiedzi + wielokrotny wybór
  - [X] In-place editing (scroll preserved)
  - [X] Discord webhooks przy add/edit/delete
- [X] Archiwum:
  - [X] Zarchiwizowane egzaminy
  - [X] Wyszukiwanie po nicku/ID
  - [X] Przycisk "Usuń" (trwałe usunięcie)
  - [X] Discord webhooks przy delete
- [X] Wszystkie akcje admin/dev logowane w #portal-admin

### Zadanie 4: Prywatność i Bezpieczeństwo ✅
- [X] Maskowanie Danych: Email widoczny TYLKO dla dev
- [X] Dropdown akcji z kontrolą:
  - [X] Dev: Nadaj/Odbierz Admina, Wyrzuć
  - [X] Admin: Wyrzuć tylko user
- [X] Kolumna "Nick" przed "Użytkownik" z mta_nick
- [X] Sortowanie tabeli: klik na nagłówki (Nick, Użytkownik, Badge, Rola, Data rejestracji, Ostatnia aktywność) ze strzałkami ↑↓
- [X] ExamDashboard dla user: ukryto Statystyki/Zarządzanie/Archiwum, duży wyśrodkowany przycisk "Zacznij Egzamin"

### Zadanie Exams (tasks2) ✅
- [X] W "Zarządzaniu Pytaniami" edycja in-place (nie wyrzuca na górę)
- [X] Usunięcie przycisku "Poprzednie" w egzaminie
- [X] Przy niezaznaczeniu odpowiedzi i minięciu czasu: "nie wybrano nic" → nieprawidłowa odpowiedź
- [X] Progi zdawalności:
  - [X] Trainee, pościgowy, SWAT: **50%**
  - [X] Pozostałe: **75%**
- [X] Checkbox zamiast radio w egzaminie (dla multi-choice)
- [X] Edycja pytania pokazuje się w logach jako "edycja pytania" (nie "dodanie nowego")
- [X] Pasek wyszukiwania użytkowników w AdminPanel
- [X] Multi-option pytanie: poprawne wyświetlanie odpowiedzi
- [X] Webhook w portal-exams pokazuje typ egzaminu: "ukończył egzamin [Typ Egzaminu]"
- [X] Zmień w "Zdający" zamiast Badge na Nick

### Zadanie Admin Panel (tasks2) ✅
- [X] Przycisk "Wyrzuć" rzeczywiście usuwa osobę z bazy SQL i ze strony
- [X] "Wymuś wylogowanie wszystkich" działa:
  - [X] Dev: wylogowanie wszystkich oprócz dev
  - [X] Admin: wylogowanie tylko userów
- [X] Sortowanie po Badge

### Zadanie Pozostałe (tasks2) ✅
- [X] Przy nowej rejestracji pokazuje logi na Discordzie (fix: testowano po wyrzuceniu)
- [X] W "zarządzanie użytkownikami" tabela nie buguje się gdy osoba jest na samej dole (fix: overflow)

### Police Dark Theme Redesign ✅
- [X] tailwind.config.ts - Pełna paleta police theme
- [X] app/globals.css - Kompletne style (fonty Inter + Montserrat, utility classes, Quill overrides, custom scrollbar)
- [X] Navbar.jsx - Złota odznaka, fixed dropdown bug, ikony, role badges, online indicator
- [X] Dashboard.jsx - 3 karty z glow effect, ikony w square containers, live stats
- [X] ExamDashboard.jsx - User/Admin views, konsystentny design
- [X] ExamTaker.jsx - 3 ekrany przeprojektowane, timer colors, glow effects
- [X] Login.jsx - Złota odznaka, police dark bg, card glow
- [X] **Materials.jsx** - Sidebar, buttons, Quill editor (COMPLETED)
- [X] **AdminPanel.jsx** - Tabela użytkowników, action dropdown (COMPLETED)
- [X] **ExamStatistics.jsx** - Tabela wyników, modal szczegółów (COMPLETED)
- [X] **ExamQuestions.jsx** - Lista pytań, inline edit (COMPLETED)
- [X] **ExamArchive.jsx** - Tabela, search (COMPLETED)
- [X] Usunięte MOCKUP files

---

## ⚙️ Technical Patterns

### Routing Pattern
- Stan `activeTab` w App.jsx steruje widokami (renderowanie warunkowe)
- Persist via `sessionStorage`: `activeTab`, `selectedMaterial`

### Exam Flow
```
Exam.jsx → examUtils.js → supabaseHelpers.js → discord.js
```

1. User wybiera typ egzaminu
2. `generateExam()` losuje pytania i shuffluje odpowiedzi
3. `ExamTaker` renderuje pytania z timerem
4. `saveExamResult()` zapisuje do `exam_results` z `exam_id` i `exam_type_id`
5. `notifyExamSubmission()` wysyła webhook do Discord z typem i progiem

### Anti-Spam Pattern
```jsx
const submittingRef = useRef(false);

const handleSubmit = async () => {
  if (submittingRef.current) return;
  submittingRef.current = true;

  try {
    // API call
  } finally {
    submittingRef.current = false;
  }
};
```

### Data Persistence
- **Supabase jako Single Source of Truth**
- **Materials**: `sessionStorage` dla UI state, `localStorage` jako cache
- **Users**: kolumny `mta_nick` (TEXT, nullable), `force_logout_after` (TIMESTAMP, nullable)
- **localStorage**: `login_timestamp_${userId}` dla force logout detection

### Content Rendering
- `marked()` konwertuje Markdown → HTML (kompatybilność wsteczna)
- Quill zapisuje HTML
- `dangerouslySetInnerHTML` renderuje (auto-wyświetla obrazy)

### MTA Nick Flow
```
1. Po logowaniu → checkMtaNick() → getUserById()
2. Jeśli brak mta_nick → wyświetla MtaNickModal
3. User wpisuje nick → updateMtaNick() zapisuje
4. handleMtaNickComplete() aktualizuje stan
5. Modal wyświetla się jednorazowo (dla nowych i istniejących użytkowników bez nicku)
```

### Discord Notifications Pattern
- **Rejestracja**: `notifyUserAuth()` jeśli `timeDiff < 60s`
- **Login/logout**: WYŁĄCZONE
- **Admin akcje**: webhooks do `#portal-admin`
  - Archiwizacja egzaminu
  - Usuwanie użytkownika
  - Dodawanie/edycja/usuwanie pytań
- **Egzaminy**: `notifyExamSubmission()` z typem egzaminu i progiem zdania

### Exam System Database Schema

**exam_results**:
```sql
- exam_id (UUID, PRIMARY KEY)
- user_id (UUID, FOREIGN KEY → users.id)
- exam_type_id (INT, FOREIGN KEY → exam_types.id)
- score (INT)
- total_questions (INT)
- percentage (DECIMAL)
- passed (BOOLEAN)
- questions (JSONB)
- answers (JSONB)
- is_archived (BOOLEAN, DEFAULT false)
- created_at (TIMESTAMP)
```

**exam_types** (7 typów):
1. Egzamin Trainee
2. Egzamin Pościgowy
3. Egzamin SWAT
4. Egzamin GU
5. Egzamin DTU
6. Egzamin SS
7. Egzamin z Wiedzy Ponadpodstawowej

**exam_questions**:
```sql
- id (INT, PRIMARY KEY)
- exam_type_id (INT, FOREIGN KEY → exam_types.id)
- question (TEXT)
- options (JSONB array) - 4 odpowiedzi
- correct_answers (JSONB array) - indexy poprawnych odpowiedzi
- is_multiple_choice (BOOLEAN)
- time_limit (INT, sekundy)
- created_at (TIMESTAMP)
```

### Exam Multiple Choice Pattern
- Pytania z `is_multiple_choice=true` używają checkboxów
- Odpowiedzi przechowywane jako tablice w `answers[question.id]`
- **Walidacja**: porównanie posortowanych tablic (user vs correct)
- **Wyświetlanie wyników**:
  - Zielone: poprawnie wybrano
  - Niebieskie: poprawne nie wybrano
  - Czerwone: błędnie wybrano

### Exam Passing Thresholds
```javascript
const getPassingThreshold = (examTypeName) => {
  const lowThresholdExams = ['trainee', 'pościgowy', 'swat'];
  const examNameLower = examTypeName.toLowerCase();

  return lowThresholdExams.some(type => examNameLower.includes(type))
    ? 50  // 50% dla trainee/pościgowy/SWAT
    : 75; // 75% dla pozostałych
};
```

### Exam Timeout Handling
```javascript
// Gdy czas pytania (timeLimit) się kończy:
1. Automatyczne przejście do następnego pytania
2. Jeśli brak odpowiedzi → zapisz -1 w answers[question.id]
3. W ExamStatistics wyświetl "Nie wybrano odpowiedzi (czas minął)"
```

### Force Logout System (Distributed)
**Client-side** (każdy klient):
```javascript
// AuthContext.jsx
const loginTimestampRef = useRef(Date.now());

// Interval co 5s sprawdza force_logout_after
useEffect(() => {
  const checkForceLogout = setInterval(async () => {
    const { data: userData } = await getUserById(user.id);

    if (userData?.force_logout_after) {
      const forceLogoutTime = new Date(userData.force_logout_after).getTime();

      if (forceLogoutTime > loginTimestampRef.current) {
        alert('Zostałeś wylogowany przez administratora.');
        await signOut();
        localStorage.clear();
        window.location.reload();
      }
    }
  }, 5000);

  return () => clearInterval(checkForceLogout);
}, [user]);
```

**Server-side** (Admin actions):
```javascript
// setForceLogoutForUser(userId) - pojedynczy user
// setForceLogoutTimestamp(role) - role-based:
//   'all' dla dev → wszyscy oprócz dev
//   'user' dla admin → tylko userzy
```

**Delete User Flow**:
```
1. setForceLogoutForUser(userId)
2. Wait 2s (pozwól klientowi wylogować się)
3. deleteUser(userId) - trwałe usunięcie z bazy
```

### AdminPanel Security Pattern
- **Email maskowane**: widoczny TYLKO dla dev
- **Dropdown akcji**:
  - Dev: Nadaj/Odbierz Admin, Wyrzuć (wszyscy oprócz dev)
  - Admin: Wyrzuć (tylko userzy)
- **Nie można zarządzać**:
  - Własnym kontem
  - Rolą `dev`
- **Sortowanie**: klik nagłówki tabeli (username, nick, badge, role, created_at, last_seen)
- **Wyszukiwanie**:
  - Dev: nick, username, badge, email
  - Admin: nick, username, badge (bez emaila)

### ExamDashboard Role-Based Views
**User**:
- Widzi TYLKO "Zacznij Egzamin" (duży, centered button)
- Ukryte: Statystyki, Zarządzanie Pytaniami, Archiwum

**Admin/Dev**:
- Widzi grid 4 kafelków: Zacznij Egzamin, Statystyki, Zarządzanie, Archiwum

---

## 🚀 Deployment & Troubleshooting

### GitHub → Vercel Auto-Deploy
1. Push zmian na `master` branch:
   ```bash
   git add .
   git commit -m "feat: Your changes description"
   git push origin master
   ```
2. Vercel **automatycznie** wykrywa push i deployuje
3. Deployment trwa 1-2 minuty
4. Sprawdź Vercel Dashboard dla statusu

### Problem: Vercel Force Push Detection

**Symptomy**:
- Portal przestaje działać po deploymencie (loading screen, brak danych)
- Użytkownicy testujący na różnych przeglądarkach raportują ten sam problem
- Vercel dashboard pokazuje **starszy commit** niż GitHub
- `git log origin/master` pokazuje nowszy commit niż deployment na Vercel

**Przyczyna**:
Vercel czasami **NIE WYKRYWA** `git push --force` automatycznie. Stary deployment pozostaje aktywny mimo że GitHub ma nowszy kod.

**Rozwiązanie (Dummy Commit Trigger)**:
```bash
# 1. Sprawdź co jest na GitHub vs Vercel
git ls-remote origin master  # GitHub commit hash
# Porównaj z commit hash w Vercel dashboard

# 2. Jeśli różne - trigger redeploy przez dummy commit
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin master

# 3. Poczekaj 1-2 minuty na Vercel deployment
# 4. Zweryfikuj że nowy commit pojawił się na Vercel dashboard
```

**Alternatywa**:
- Wejdź na Vercel Dashboard → Deployments → Kliknij "Redeploy" na production deployment

**Weryfikacja po fix**:
1. Sprawdź commit hash na Vercel dashboard vs GitHub
2. Wymuś hard refresh (Ctrl+Shift+R) w przeglądarce
3. Przetestuj funkcjonalność która była zepsuta
4. Poproś innych użytkowników o test (różne przeglądarki)

**Historia**: Problem wystąpił 2025-02-02 gdy force push nie trigger'ował Vercel redeploy. Dummy commit rozwiązał problem natychmiast.

---

### Problem: Infinite Loading Screen (Blocking Await in Auth Callback)

**Symptomy**:
- Aplikacja zawiesza się na loading screen
- `setLoading(false)` nigdy się nie wykonuje
- Console pokazuje błędy związane z auth state

**Przyczyna**:
Blocking `await` w callbacku `onAuthStateChange` blokuje wykonanie `setLoading(false)`. Przykład: `await getUserById()` w linii `SIGNED_IN` event handler zatrzymuje cały callback.

**Rozwiązanie**:
Zamień blocking `await` na non-blocking `.then()` dla operacji fire-and-forget:

```javascript
// ❌ ZŁE (blocking)
if (event === 'SIGNED_IN') {
  const { data: existingUser } = await getUserById(session.user.id);
  // setLoading(false) nigdy nie zostanie wywołane jeśli await się zawiesi
}

// ✅ DOBRE (non-blocking)
if (event === 'SIGNED_IN') {
  getUserById(session.user.id).then(({ data: existingUser }) => {
    // logika...
  }).catch(() => {
    // fallback...
  });
  // callback kontynuuje, setLoading(false) zostanie wywołane
}
```

**Zasada**: W React auth callbacks (`onAuthStateChange`, `useEffect`) używaj `await` TYLKO dla operacji krytycznych. Operacje side-effect (Discord notifications, background checks) zawsze non-blocking `.then()`.

**Historia**: Problem wystąpił 2026-02-02 w commit d71d149 przy implementacji Discord registration notifications. Fix w commit 693026b.

---

## 📁 File Locations

### Core Configuration
```
c:\Users\user\sasd-portal-v2\tailwind.config.ts
c:\Users\user\sasd-portal-v2\app\globals.css
c:\Users\user\sasd-portal-v2\PROJECT.md (this file)
```

### Data Layer
```
c:\Users\user\sasd-portal-v2\src\data\examQuestions.js
c:\Users\user\sasd-portal-v2\src\data\materials.js
c:\Users\user\sasd-portal-v2\src\data\translations.js
c:\Users\user\sasd-portal-v2\src\data\iconMap.js
```

### Contexts
```
c:\Users\user\sasd-portal-v2\src\contexts\AuthContext.jsx
c:\Users\user\sasd-portal-v2\src\contexts\TranslationContext.jsx
```

### Auth Components
```
c:\Users\user\sasd-portal-v2\src\components\auth\Login.jsx
c:\Users\user\sasd-portal-v2\src\components\auth\MtaNickModal.jsx
```

### Dashboard Components
```
c:\Users\user\sasd-portal-v2\src\components\dashboard\Dashboard.jsx
c:\Users\user\sasd-portal-v2\src\components\dashboard\Navbar.jsx
```

### Exam Components
```
c:\Users\user\sasd-portal-v2\src\components\exam\Exam.jsx
c:\Users\user\sasd-portal-v2\src\components\exam\ExamDashboard.jsx
c:\Users\user\sasd-portal-v2\src\components\exam\ExamTaker.jsx
c:\Users\user\sasd-portal-v2\src\components\exam\ExamStatistics.jsx
c:\Users\user\sasd-portal-v2\src\components\exam\ExamQuestions.jsx
c:\Users\user\sasd-portal-v2\src\components\exam\ExamArchive.jsx
```

### Materials Components
```
c:\Users\user\sasd-portal-v2\src\components\materials\Materials.jsx
```

### Admin Components
```
c:\Users\user\sasd-portal-v2\src\components\admin\AdminPanel.jsx
```

### Utils
```
c:\Users\user\sasd-portal-v2\src\utils\examUtils.js
c:\Users\user\sasd-portal-v2\src\utils\supabaseHelpers.js
c:\Users\user\sasd-portal-v2\src\utils\discord.js
```

### Supabase
```
c:\Users\user\sasd-portal-v2\src\supabaseClient.js
```

---

## 📝 Quick Reference Checklist

### Starting a New Chat Session
- [ ] Read this PROJECT.md file completely
- [ ] Confirm: "Co dzisiaj robimy?"
- [ ] Wait for user to provide task
- [ ] Create TodoWrite checklist if task is non-trivial

### During Development
- [ ] Use TodoWrite to track progress
- [ ] Mark tasks as completed immediately after finishing
- [ ] PRESERVE all business logic (only change UI)
- [ ] Use existing utilities (examUtils.js, supabaseHelpers.js)
- [ ] Follow police theme design patterns
- [ ] Test locally before committing

### Before Committing
- [ ] Review all changes
- [ ] Ensure no business logic was broken
- [ ] Check that UI follows police theme patterns
- [ ] Run local tests (if applicable)

### Git Commit Pattern
```bash
git add .
git commit -m "feat: Brief description

- Change 1
- Change 2
- Change 3

Components updated:
- File path 1
- File path 2

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin master
```

### After Deployment
- [ ] Wait 1-2 minutes for Vercel deployment
- [ ] Check Vercel Dashboard for deployment status
- [ ] Test on live site
- [ ] If issues: check for force push detection problem

---

**Last Updated**: 2026-02-03
**Version**: 1.0.0
**Status**: ✅ All components redesigned with Police Dark Theme
