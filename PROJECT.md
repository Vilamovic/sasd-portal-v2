# 🛡️ SASD Portal - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [AI Operational Rules](#ai-operational-rules)
3. [Project Architecture](#project-architecture)
4. [UI Design System (Sheriff Dark Green Theme) 🚨 NIETYKALNY](#ui-design-system-sheriff-dark-green-theme--nietykalny-)
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
   - Gdy otrzymasz zadanie **ZAWSZE** użyj TodoWrite tool do utworzenia checklisty
   - Format: `{"content": "Task", "status": "pending/in_progress/completed", "activeForm": "Doing task..."}`
   - W trakcie pracy:
     - Mark `in_progress` gdy zaczynasz task
     - **VERIFY** że task działa poprawnie
     - Mark `completed` **NATYCHMIAST** po zakończeniu i weryfikacji
     - **NIE BATCHUJ** completions - odhaczaj każdy task zaraz po skończeniu
   - Tylko **JEDEN** task powinien być `in_progress` jednocześnie

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

6. **🚨 SHERIFF THEME - ABSOLUTNIE NIETYKALNY 🚨**
   - **KATEGORYCZNY ZAKAZ ZMIANY UI BEZ WYRAŹNEJ ZGODY**
   - ❌ NIE ZMIENIAJ kolorów Sheriff (#020a06, #c9a227, #051a0f, #1a4d32, #22693f, #e6b830)
   - ❌ NIE MODYFIKUJ glassmorphism (.glass, .glass-strong)
   - ❌ NIE USUWAJ background effects (gradient orbs, animations)
   - ❌ NIE "ULEPSZAJ" UI na własną rękę
   - ✅ DLA NOWYCH KOMPONENTÓW: Kopiuj style z ExamDashboard.jsx lub Dashboard.jsx
   - ✅ ZACHOWAJ wszystkie elementy Sheriff theme
   - Migration: Commit `fd618b3` (Feb 2026) - Police Blue → Sheriff Dark Green z Tailwind v4

7. **DRY & UTILS**
   - Używaj istniejących narzędzi (np. `generateExam` z examUtils.js, supabaseHelpers.js)

8. **STALE CLOSURES**
   - W AuthContext i listenerach używaj `useRef` (np. `userRef`, `hasNotifiedLogin`)

9. **DEPLOYMENT AWARENESS**
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

## 🎨 UI Design System (Sheriff Dark Green Theme) 🚨 NIETYKALNY 🚨

### ⚠️ KATEGORYCZNY ZAKAZ ZMIAN BEZ ZGODY ⚠️

**ZABRANIA SIĘ ABSOLUTNIE:**
- ❌ Zmiana kolorów Sheriff Dark Green theme
- ❌ Modyfikacja glassmorphism effects
- ❌ Usuwanie background effects (gradient orbs)
- ❌ Zmiana animacji (pulse-glow, gradient-shift, particle-float)
- ❌ "Ulepszanie" UI na własną rękę
- ❌ Modyfikacja stylów bez WYRAŹNEJ zgody użytkownika

**DLA NOWYCH KOMPONENTÓW:**
✅ **MUSISZ** użyć TEGO SAMEGO Sheriff theme
✅ **SKOPIUJ** style z [ExamDashboard.jsx](src/components/exam/ExamDashboard.jsx) lub [Dashboard.jsx](src/components/dashboard/Dashboard.jsx)
✅ **ZACHOWAJ** wszystkie elementy: glassmorphism, gradient orbs, Sheriff colors, animations
✅ **PYTAJ** użytkownika jeśli nie jesteś pewien

**Migration History (Feb 2026):**
- Commit `fd618b3` - Kompletna migracja Police Blue → Sheriff Dark Green z Tailwind v4
- 100% business logic preserved
- 13 komponentów zmigrowanych + globals.css + Tailwind v4 setup

### Color Palette (Sheriff Dark Green)

#### Główne Kolory Sheriff
```css
/* Tła (Dark Green Sheriff Theme) */
#020a06  /* Najciemniejsze - main background */
#051a0f  /* Ciemne - cards/inputs opacity 80% */
#0a2818  /* Średnie - hover states */
#1a4d32  /* Borders - border colors */
#22693f  /* Lighter green - accents */

/* Złote Akcenty Sheriff (Primary Gold) */
#c9a227  /* Gold primary - main accent */
#e6b830  /* Gold light - gradients to */

/* Teksty */
#8fb5a0  /* Sage green - secondary text */
white    /* Primary text */

/* Statusy */
#22c55e  /* Success - emerald green (passed exams, correct) */
#14b8a6  /* Info - teal (details, view buttons) */
#ef4444  /* Danger - red (failed, delete) */
purple-500  /* Admin role badge */
red-500     /* Dev role badge */

/* Glassmorphism */
.glass        /* backdrop-blur-sm bg-[#051a0f]/30 */
.glass-strong /* backdrop-blur-md bg-[#051a0f]/60 border border-[#1a4d32]/50 */

/* Custom Gradients */
.text-gold-gradient /* bg-gradient-to-r from-[#c9a227] via-[#e6b830] to-[#c9a227] bg-clip-text */
```

### Standard Component Patterns (Sheriff Theme)

#### 1. Page Background with Gradient Orbs
```jsx
<div className="min-h-screen bg-[#020a06] relative overflow-hidden">
  {/* Background effects - WYMAGANE dla Sheriff theme */}
  <div className="fixed inset-0 pointer-events-none">
    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/10 rounded-full blur-[120px] animate-pulse-glow" />
    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#22693f]/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
  </div>

  <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
    {/* Content */}
  </div>
</div>
```

#### 2. Page Header (Sheriff Style)
```jsx
<div className="mb-8">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a227]/10 border border-[#c9a227]/20 text-[#c9a227] text-sm font-medium mb-6">
    <Sparkles className="w-4 h-4" />
    <span>Kategoria</span>
  </div>

  {/* Title */}
  <div className="flex items-center gap-3 mb-4">
    <Icon className="w-8 h-8 text-[#c9a227]" />
    <h2 className="text-4xl font-bold text-white">
      Tytuł <span className="text-gold-gradient">Sekcji</span>
    </h2>
  </div>

  {/* Underline */}
  <div className="w-24 h-1 bg-gradient-to-r from-[#c9a227] to-[#e6b830] rounded-full mb-4" />

  {/* Description */}
  <p className="text-[#8fb5a0]">Opis sekcji</p>
</div>
```

#### 3. Card with Glassmorphism (Sheriff Style)
```jsx
<div className="group relative">
  {/* Glow effect */}
  <div className="absolute -inset-2 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" style={{ background: 'rgba(201, 162, 39, 0.3)' }} />

  {/* Main card - GLASSMORPHISM */}
  <button className="relative w-full glass-strong rounded-2xl p-6 border border-[#1a4d32]/50 hover:border-[#c9a227]/50 transition-all duration-300 hover:scale-[1.02] shadow-xl">
    {/* Corner accents */}
    <div className="absolute top-0 left-6 w-16 h-[2px] bg-gradient-to-r from-[#c9a227]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

    {/* Icon */}
    <div className="w-14 h-14 bg-gradient-to-br from-[#c9a227] to-[#e6b830] rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all duration-300">
      <Icon className="w-7 h-7 text-[#020a06]" strokeWidth={2} />
    </div>

    {/* Content + Stats + Button */}
  </button>
</div>
```

#### 4. Buttons (Sheriff Style)

**Gold Primary Button** (CTA, główne akcje):
```jsx
<button className="px-6 py-3 bg-gradient-to-r from-[#c9a227] to-[#e6b830] hover:opacity-90 text-[#020a06] font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg">
  Tekst Przycisku
</button>
```

**Green Success Button** (zapisz, dodaj, next):
```jsx
<button className="px-6 py-3 bg-[#22c55e] text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg">
  Zapisz
</button>
```

**Teal Info Button** (szczegóły, view):
```jsx
<button className="p-2.5 bg-[#14b8a6]/20 text-[#14b8a6] rounded-lg hover:bg-[#14b8a6]/30 transition-colors border border-[#14b8a6]/30">
  <Eye className="w-4 h-4" />
</button>
```

**Red Danger Button** (usuń):
```jsx
<button className="p-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30">
  <Trash2 className="w-4 h-4" />
</button>
```

**Back Button Pattern** (Sheriff style):
```jsx
<button className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#051a0f]/80 hover:bg-[#0a2818] border border-[#1a4d32]/50 hover:border-[#c9a227]/30 text-[#8fb5a0] hover:text-white transition-all duration-200">
  <ChevronLeft className="w-5 h-5" />
  <span className="text-sm font-medium">Powrót</span>
</button>
```

#### 5. Inputs (Sheriff Style)

**Text Input / Search**:
```jsx
<input
  type="text"
  className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
  placeholder="Placeholder..."
/>
```

**Search with Icon**:
```jsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8fb5a0]" />
  <input
    type="text"
    className="w-full pl-12 pr-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white placeholder-[#8fb5a0] focus:outline-none focus:border-[#c9a227] transition-colors"
    placeholder="Szukaj..."
  />
</div>
```

**Select Dropdown**:
```jsx
<select className="w-full px-4 py-3 bg-[#051a0f]/80 border border-[#1a4d32] rounded-xl text-white focus:outline-none focus:border-[#c9a227] transition-colors">
  <option value="all">Wszystkie typy</option>
</select>
```

#### 6. Tables (Sheriff Style)

**Table Container with Glassmorphism**:
```jsx
<div className="glass-strong rounded-2xl border border-[#1a4d32]/50 overflow-hidden shadow-xl">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-[#051a0f]/50 border-b border-[#1a4d32]/50">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-[#c9a227]">Header</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-[#1a4d32]/50 hover:bg-[#051a0f]/30 transition-colors">
          <td className="px-6 py-4 text-white">Data</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

#### 7. Loading Spinner (Sheriff Style)
```jsx
<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c9a227] mx-auto mb-4" />
<p className="text-[#8fb5a0]">Ładowanie...</p>
```

#### 8. Modal (Sheriff Style with Glassmorphism)
```jsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  <div className="glass-strong rounded-2xl border border-[#1a4d32] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
    {/* Header */}
    <div className="p-6 border-b border-[#1a4d32] bg-gradient-to-r from-[#0a2818]/50 to-transparent">
      <div className="flex items-start justify-between">
        <h3 className="text-2xl font-bold text-white">Tytuł</h3>
        <button onClick={onClose} className="text-[#8fb5a0] hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>

    {/* Body */}
    <div className="p-6 overflow-y-auto flex-grow">
      {/* Content */}
    </div>

    {/* Footer */}
    <div className="p-6 border-t border-[#1a4d32]">
      <button className="w-full px-6 py-3 bg-[#0a2818] text-white rounded-xl hover:bg-[#133524] transition-colors border border-[#1a4d32]">
        Zamknij
      </button>
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

### Known Issues Log

**Purpose**: This section tracks **CRITICAL issues** that took significant time to debug and their solutions. Add new issues here when encountered.

**Format for new issues**:
```
### Problem: [Brief Title]

**Symptomy**:
- Symptom 1
- Symptom 2

**Przyczyna**:
[Root cause explanation]

**Rozwiązanie**:
[Step-by-step solution]

**Historia**: [When it occurred, who fixed it]
```

---

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

### Problem: Tailwind v4 @apply Build Failure

**Symptomy**:
- `npm run build` fails with webpack errors
- Error: "Cannot apply unknown utility class `border-border`" (lub `bg-police-dark-900`, `bg-white/10`)
- PostCSS syntax errors in globals.css
- Build worked locally in dev mode, but fails in production build
- Vercel deployment fails with same errors

**Przyczyna**:
Projekt używa **Tailwind CSS v4** (`tailwindcss": "^4.0.0"`), ale `globals.css` był napisany z Tailwind v3 syntaxem. W Tailwind v4:
- `@apply` z custom theme colors (np. `bg-police-dark-900`) nie działa w `@layer base` i `@layer components`
- Tailwind v4 ma zmieniony sposób przetwarzania @apply directives
- Custom colors muszą być używane jako plain CSS values, nie przez @apply

**Rozwiązanie**:
Zamień wszystkie `@apply` statements z custom colors na plain CSS:

```css
// ❌ ZŁE (Tailwind v4 nie zadziała w build)
@layer base {
  body {
    @apply bg-police-dark-900 text-white font-sans;
  }
  ::selection {
    @apply bg-badge-gold-600 text-police-dark-900;
  }
}

// ✅ DOBRE (Plain CSS values)
@layer base {
  body {
    background: linear-gradient(135deg, #0a0f1a 0%, #151c28 50%, #1a2332 100%);
    color: white;
    font-family: Inter, Roboto, system-ui, sans-serif;
  }
  ::selection {
    background-color: #d4af37;
    color: #0a0f1a;
  }
}
```

**Kroki fix'u**:
1. Znajdź wszystkie `@apply` statements w `globals.css`: `grep "@apply" app/globals.css`
2. Zamień każdy @apply na odpowiedni CSS:
   - `bg-police-dark-900` → `background-color: #0a0f1a;`
   - `text-white` → `color: white;`
   - `bg-white/10` → `background-color: rgba(255, 255, 255, 0.1);`
   - `rounded-xl` → `border-radius: 0.75rem;`
3. Usuń nieużywane `@layer components` i `@layer utilities` jeśli zawierają @apply (wszystkie komponenty używają inline Tailwind classes)
4. Test local build: `npm run build`
5. Commit i push do Vercel

**Alternatywa (nie polecana)**:
Downgrade do Tailwind v3, ale wymaga reinstall dependencies i może zepsuć inne rzeczy.

**Historia**: Problem wystąpił 2026-02-03 po redesign'ie komponentów. Visual redesign działał lokalnie (`npm run dev`), ale Vercel build failował. Root cause: `@apply` z custom colors niekompatybilny z Tailwind v4 build process. Fix w commit e4d0ed8.

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
- [ ] **IMPORTANT**: Create TodoWrite checklist if task is non-trivial (3+ steps)

### During Development (CRITICAL: Use TodoWrite)
- [ ] **Create todo list** using TodoWrite tool at start of task
  - Format: `{"content": "Task description", "status": "pending", "activeForm": "Doing task..."}`
  - Example: `[{"content": "Fix bug in login", "status": "in_progress", "activeForm": "Fixing login bug"}]`
- [ ] **Update todo list** as you work:
  - Mark `in_progress` when starting a task
  - Mark `completed` **IMMEDIATELY** after finishing (don't batch!)
  - Only ONE task should be `in_progress` at a time
- [ ] PRESERVE all business logic (only change UI)
- [ ] Use existing utilities (examUtils.js, supabaseHelpers.js)
- [ ] Follow police theme design patterns
- [ ] **Verify task works** before marking as completed
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

## 📌 Template: Adding New Known Issue

**When you encounter a CRITICAL bug that takes significant time to debug, add it to the "Known Issues Log" section using this template:**

```markdown
### Problem: [Brief Descriptive Title]

**Symptomy**:
- Symptom 1 (what the user sees)
- Symptom 2 (error messages, console logs)
- Symptom 3 (when it occurs)

**Przyczyna**:
[Detailed explanation of root cause - why it happened]

**Rozwiązanie**:
```bash
# Step-by-step commands or code changes
step 1
step 2
step 3
```

**Weryfikacja po fix**:
1. How to verify the fix worked
2. What to test
3. What to check

**Historia**: [Date] - [Brief description of circumstances when it occurred]
```

**Criteria for adding to Known Issues Log**:
- ✅ Bug took >30 minutes to debug
- ✅ Non-obvious root cause
- ✅ High impact (broke critical functionality)
- ✅ Could happen again
- ❌ Simple typos, obvious bugs (don't add these)

---

**Last Updated**: 2026-02-03
**Version**: 1.0.1
**Status**: ✅ All components redesigned with Police Dark Theme
