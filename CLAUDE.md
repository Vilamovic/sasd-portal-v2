# 🛡️ SASD Portal | VS Code AI Guide

> **AUTHORITATIVE SOURCE**: To jedyne źródło prawdy dla AI. Łączy zasady operacyjne z dokumentacją techniczną.

## ⚙️ AI Operational Rules (VS Code Edition)

### 1. Workflow & Verification
* **WAIT FOR TASK**: Nigdy nie generuj kodu bez zadania. Zacznij od: "Co dzisiaj robimy?".
* **PLANNING**: Każde zadanie zacznij od `TodoWrite`.
* **LOCAL BUILD**: Po zmianach Claude **musi** odpalić `npm run build` w terminalu, aby wyłapać błędy.
* **VISUAL CHECK**: Po pomyślnym buildzie zapytaj: *"Kod sprawdzony. Czy na localhost wszystko wygląda poprawnie? Czy mogę przygotować commit?"*.
* **GIT**: Commity zgodnie z szablonem na końcu pliku. Zakaz auto-push bez zgody.

### 2. Database Awareness (Supabase MCP)
* **MCP ACCESS**: Twoim głównym źródłem wiedzy o bazie jest serwer MCP Supabase.
* **VERIFY BEFORE CODE**: Zamiast zgadywać, użyj narzędzi MCP, aby sprawdzić strukturę tabel lub obecność danych testowych przed implementacją logiki.
* **NO DB CHANGES**: Nie zmieniaj struktury bazy (SQL) bez wyraźnego polecenia użytkownika.

### 3. Session Hygiene & Updates
* **CLAUDE.MD UPDATE**: Po zakończeniu dużego etapu (np. nowej podstrony) lub fixie błędu, zaktualizuj sekcję Status/Troubleshooting w tym pliku.
* **NEW CHAT TRIGGER**: Zasugeruj nowy czat, gdy:
    1. Lista w `TodoWrite` przekracza 10 pozycji.
    2. Zaczynasz "zapominać" o zasadach Sheriff Theme.
    3. Zakończono Milestone i zaktualizowano dokumentację.

### 4. Logic & MDT Terminal Theme (🚨 ACTIVE THEME 🚨)
* **PRESERVE LOGIC**: Nigdy nie zmieniaj logiki biznesowej (`useEffect`, handlery, async). Zmieniaj tylko UI.
* **MDT THEME**: Retro 90s Win95/MDT Terminal aesthetic. CSS variables in `globals.css`. Key classes: `btn-win95`, `panel-inset`, `panel-raised`, `pulse-dot`, `cursor-blink`.
* **FONTS**: VT323 (headers/labels) + Space_Mono (body/mono). Both with `latin-ext` for Polish diacritics.
* **DARK MODE**: `[data-theme="dark"]` CSS selector. All colors via CSS variables - NEVER hardcode hex colors.
* **BACKUP**: Old Sheriff Theme preserved at commit `c2c6500` on master. Revert with `git checkout c2c6500 -- .` if needed.
* **PATTERNS**: Kopiuj style z `Dashboard.tsx` lub `AdminPanelPage.tsx` dla nowych komponentów.

---

## 🏗️ Project Architecture & Identity
* **Identity**: `dev` (UUID: `2ab9b7ad-a32f-4219-b1fd-3c0e79628d75`) > `hcs` > `cs` > `deputy` > `trainee`.
* **Role Hierarchy**:
  - **Trainee/Deputy**: Dashboard (Materiały, Egzaminy, Dywizje), materiały read-only, egzaminy z tokenem
  - **CS**: Deputy + dodawanie materiałów, egzaminy bez tokena, pełny dashboard, zerowanie +/-, nadawanie stopni/uprawnień (tylko Trainee/Deputy)
  - **HCS**: Pełen dostęp oprócz limitacji DEV
  - **Dev**: Pełen dostęp
* **Core Systems**: Auth (Discord), Force Logout (polling 5s), Exams (JSONB), Discord Webhooks.

---

## 🚀 Troubleshooting History
* **Z-Index**: Navbar `z-[60]`, Dropdown `z-[9999]`, Fullscreen modal `z-[70]`.
* **Tailwind v4**: Zakaz `@apply` dla custom hexów w CSS.
* **Vercel**: Dummy commit triggeruje deploy (`git commit --allow-empty`).
* **Navbar Sync**: Po operacjach CRUD wywołaj `refreshUserData()` z AuthContext dla natychmiastowej aktualizacji (zamiast czekać 30s na polling).
* **Timer Countdown**: RPC function `get_active_penalties()` oblicza `remaining_seconds` server-side. Navbar korzysta z tego do countdown timerów.
* **Button Positioning**: WSZYSTKIE przyciski "Powrót" (btn-win95) WEWNĄTRZ kontenera `max-w-7xl mx-auto px-6 py-8` jako pierwszy element z `mb-6`. Wyjątek: MDT Terminal page (`/divisions/dtu/mdt`) - brak przycisku Powrót, nawigacja przez X w MdtHeader.
* **Shared Components**: ZAWSZE używaj komponentów z `/src/components/shared/` dla BackButton, LoadingState, AccessDenied, QuillEditor zamiast tworzyć nowe kopie. Importuj: `@/src/components/shared/ComponentName`.
* **QuillEditor**: Shared rich text editor (`src/components/shared/QuillEditor.tsx`). Używany w MaterialForm (dywizje) i MaterialModal (materiały). Features: full toolbar, custom blots (hr), emoji picker, undo, tooltips PL. Dynamic import z `ssr: false`.
* **PostgreSQL ENUM Cast**: RPC functions comparing ENUM with TEXT require explicit `::text` cast. Example: `WHERE division::text = p_division` (fixes "operator does not exist: division_type = text").
* **Next.js Routing vs State**: State-based routing with conditional components causes React Invariants violations. Use dedicated Next.js routes instead (`router.push('/path')` + separate page.jsx files).
* **MDT CSS Variables**: All MDT colors use CSS vars (--mdt-header, --mdt-sidebar, --mdt-content, --mdt-btn-face, --mdt-blue-bar, --mdt-input-bg, --mdt-content-text, --mdt-muted-text, --mdt-panel-content, --mdt-surface-light). NEVER hardcode hex in components.
* **MDT Dark Mode**: `[data-theme="dark"]` in globals.css remaps all --mdt-* vars. Toggle stored in localStorage. Navbar has theme toggle button.
* **Polish Diacritics**: Fonts must have `subsets: ['latin', 'latin-ext']`. All UI text uses proper Polish characters (ą, ć, ę, ł, ń, ó, ś, ź, ż).

---

## 📝 Git Commit Pattern
```text
feat: [Krótki opis]
- [Zmiana 1]
- [Zmiana 2]
Zmienione pliki: [ścieżki]

---

## 📋 Current Task Status

### ✅ COMPLETED: Refaktoryzacja Projektu + Code Cleanup
**Start Date:** 2026-02-07
**Completion Date:** 2026-02-07
**Detailed Instructions:** See `/task/REFACTORING_PLAN.md` for complete plan
**Previous Task:** System Kartoteki (COMPLETED 2026-02-05)

**Key Features:**
- Dywizje (FTO #c9a227, SS #ff8c00, DTU #60a5fa, GU #10b981) - wyświetlane w Navbar
- Uprawnienia (SWAT, SEU, AIR, Press Desk, Dispatch, Pościgowe)
- System stopni (19 rang hierarchii: Trainee → Sheriff)
- System kar i nagród (PLUS/MINUS) z timerami
- Kartoteka użytkowników (tylko CS+)
- Captain III auto-Commander (automatyczne nadanie is_commander przy awansie)

**Database:**
- ✅ **Active Migrations**: `007`, `008`, `009`, `010`, `011`, `012` (all executed in Supabase)
  - Migration 010: Pościgowe permission, is_commander column, RLS policies (cs/hcs/dev hierarchy)
  - Migration 011: Fix materials + division_materials RLS policies for cs/hcs/dev access
  - Migration 012: Fix exam_access_tokens RLS policies for token generation by cs/hcs/dev
- ✅ **RPC Functions**: `get_active_penalties(p_user_id)`, `get_division_materials(p_division)` with ENUM::TEXT casting
- ✅ **RLS Policies**: All policies updated for cs/hcs/dev hierarchy (division_materials, exam_results, exam_access_tokens)
- Project ref: `jecootmlzlwxubvumxrk`
- Tables: `user_penalties`, `user_notes`, `materials`, `division_materials`, `exam_access_tokens`

**Status:**
- ✅ System Kartoteki w pełni zaimplementowany
- ✅ Navbar z dywizjami, uprawnieniami, balance, timer (lewa strona)
- ✅ User profile z historiami kar/nagród/notatek
- ✅ Checkboxy do selekcji pojedynczych itemów (DEV)
- ✅ RLS policies dla nowej hierarchii (CS/HCS/Dev) - migration 010 active
- ✅ Wszystkie migracje (007-010) wykonane i aktywne w Supabase
- ✅ Nowa hierarchia ról (Trainee/Deputy/CS/HCS/Dev) z logiką uprawnień
- ✅ Captain III auto-Commander
- ✅ Archiwum egzaminów z podglądem
- ✅ Sortowanie w Kartotece (strzałki UI w kolumnach)
- ✅ Dywizje jako tagi (single-select)
- ✅ Email privacy + User Identity (@username)
- ✅ Badge → "Stopień" (UI text)
- ✅ UI standardization complete: button positioning, naming conventions, user display order

**Refactoring Progress (2026-02-07):**

**✅ COMPLETED:**
- **ETAP 1.1**: supabaseHelpers.js → src/lib/db/* (7 plików, commit: ec3a458)
- **ETAP 1.2**: UserProfile complete (14 komponentów, 1876L → 15L)
- **ETAP 1.3**: PersonnelList complete (9 komponentów, 1124L → 8L, commit: aab7d02)
- **ETAP 2.1**: ExamTaker complete (10 plików, 832L → 11L)
- **ETAP 2.2**: Discord Webhooks complete (4 pliki webhook, commit: 22b7700)
- **ETAP 2.3**: Materials complete (5 plików, 586L → 11L, commit: bcc5d37)
- **ETAP 2.4**: AuthContext complete (5 plików, 573L → 803L, commit: a5d934e)
- **ETAP 2.5**: ExamQuestions complete (6 plików, 570L → 11L, commit: 6d27e2e)
- **ETAP 2.6**: AdminPanel complete (11 plików, 539L → 30L, commit: 342497c)
- **ETAP 2.7**: Divisions complete (9 plików, 462L → 50L, commit: a138f74)
- **ETAP 3.1**: Dead Code Removal (1069L deleted, commit: 4a8e582)
- **ETAP 3.2**: ExamResults DRY Fix (840L → 617L, commit: 789539b)
- **ETAP 3.3**: TokenManagement refactor (422L → 10 plików, commit: 789539b)
- **ETAP 3.4**: Code Cleanup + Shared Components (1132L deleted, commit: efd1cb0)

**📊 Overall Progress:** 100% (14/14 etapów - 10 TOP + 4 Cleanup) 🎉

**Metryki sukcesu:**
- ~11,000+ linii zrefaktoryzowane/usunięte
- 93+ nowych plików (komponenty + hooki + shared)
- 2,201L martwego kodu usunięte (1069L + 1132L)
- 375L duplikacji wyeliminowane (223L + 152L)
- Średnia wielkość pliku: ~100L (było: 936L) - **redukcja 89%**
- Sheriff Theme zachowany w 100%
- Build: ✅ SUCCESSFUL (npm run build)
- Git push: ✅ 26 commitów na origin/master
- Bundle size: **-4% reduction** (Code Cleanup)

### 🔥 Production Bugfixes (2026-02-08)

**Status:** ✅ COMPLETED - All 6 critical bugs resolved

**6 Critical Bugs Fixed:**
1. ✅ **Constraint Violation** (users_role_check) - Blocked all logins
   - Fix: useAuthSession.ts preserves existing user roles (commit: f0bcb5a)
2. ✅ **HCS/CS Permission Limitations** - CS/HCS couldn't edit badges/divisions/permissions
   - Fix: Changed isDev → isCS in 7+ files (BadgeEditor, DivisionEditor, PermissionsEditor, etc.)
3. ✅ **Division Materials Not Loading** - RPC function missing/broken
   - Fix: Created get_division_materials() RPC with ENUM::TEXT casting
4. ✅ **Division Materials Empty State** - Database had 15 records but UI showed "Brak materiałów"
   - Fix: Added 15 test materials + fixed RPC access control
5. ✅ **MaterialForm Complexity** - 5 fields too complex
   - Fix: Simplified to 2 fields (Title + Description), made file_url/file_type nullable
6. ✅ **Exam Stats/Archive Crashes** - React Invariants violations
   - Fix: Replaced state-based routing with Next.js routes (/exams/stats, /exams/archive)

**Key Learnings:**
- PostgreSQL ENUM comparisons require explicit `::text` cast
- State-based routing with conditional components = Invariants violations
- Next.js routing with dedicated pages = stable hook order
- RLS policies must include full cs/hcs/dev hierarchy

**Files Modified:** 15+ files
**SQL Scripts:** 4 (fix_rls_policies.sql, make_file_url_optional.sql, exam_results_policies.sql, check_rpc_function.sql)
**Commits:** 2 (f0bcb5a + final commit)
**Build:** ✅ SUCCESS
**Production Impact:** Critical - blocked logins, missing data, permission errors all resolved

---

### 🎨 MDT Terminal Theme Migration (2026-02-08)

**Status:** ✅ COMPLETED - Full visual migration from Sheriff Dark Green to MDT Terminal/Win95

**Backup:** Commit `c2c6500` = last Sheriff Theme commit. Revert: `git checkout c2c6500 -- .`

**Scope:**
- 77+ files modified/created
- 11 new MDT Terminal page components
- ~2700 lines added, ~3300 lines removed (net -600L theme cleanup)
- Polish diacritics fixed across all components

**Commits:**
1. `ebcae6d` - MDT Theme Foundation (globals.css, layout.tsx, shared components, routing wrappers)
2. `cffa824` - MDT Theme All Components + Polish diacritics (62 files)
3. `6d374c5` - New MDT Terminal page /divisions/dtu/mdt (11 files)

**Key Changes:**
- globals.css: All Sheriff colors → MDT CSS variables, Win95 utility classes
- layout.tsx: VT323 + Space_Mono fonts (latin-ext), dark mode support
- All components: Removed glassmorphism, rounded corners → flat Win95 bevels
- New page: `/divisions/dtu/mdt` - MDT Terminal with criminal records
- Dark mode: `[data-theme="dark"]` with localStorage persistence
- Polish diacritics: Fixed across entire codebase

**New Routes:**
- `/divisions/dtu/mdt` → MdtPage (fullscreen terminal)
- `/divisions/[divisionId]/materials` → Division materials sub-route

---

### 📋 System Zgłoszeń - Faza 3: Egzaminy Praktyczne (2026-02-09)

**Status:** ✅ COMPLETED - Commits: 4fcb559, 4dbbb96, 31cceb5

**Key Features:**
- WeeklyCalendar z clustering algorithm (Stash approach dla overlapping slotów)
- SlotClusterPopup: Win95 modal z listą slotów w klastrze
- 4 typy egzaminów: Trainee (1h), Pościgowy (1h), SWAT (15min), SEU (1h)
- Fixed durations: auto-obliczanie time_end z typu (usunięto manual time_end)
- ExamBookingPage: filtr typu, nawigacja tygodni, toggle ZAKOŃCZONE (domyślnie OFF)
- ExamManagementPage (CS+): tworzenie slotów, lista zarezerwowanych + wolnych, zapis wyniku
- ExamHistoryPage (CS+ only): historia wyników z filtrami i AccessDenied guard
- Archive system: ArchivedSubmissionsPage + ArchivedExamResultsPage (30/page, sortowanie, filtry)
- Exam eligibility:
  - CS/HCS/DEV bypass ALL restrictions
  - Self-booking blocked (nie można zapisać się na własny slot)
  - Trainee exam: tylko rola trainee
  - Permission exams (SWAT/SEU/Pościgowy): blokada jeśli user ma daną permisję
- Discord webhook: rezerwacja + anulowanie + usunięcie slotu
- Slot deletion: CS+ może usuwać wolne i zarezerwowane sloty (twórca lub dev)

**Database:**
- Tables: `exam_slots`, `practical_exam_results`
- SQL 017: CHECK constraint fix for submissions 'archived' status
- SQL 018: Archive columns for practical_exam_results (is_archived, archived_at, archived_by)
- RLS: UPDATE policy for practical_exam_results (cs/hcs/dev)
- ⚠️ SQL 017, 018, RLS fix need execution in Supabase if not done yet

**New Routes:**
- `/zgloszenia/egzamin` → ExamBookingPage (kalendarz)
- `/zgloszenia/egzamin/management` → ExamManagementPage (CS+)
- `/zgloszenia/egzamin/history` → ExamHistoryPage (CS+)
- `/zgloszenia/egzamin/management/archived` → ArchivedExamResultsPage (CS+)
- `/zgloszenia/management/archived` → ArchivedSubmissionsPage (CS+)

**New Components:**
- `src/components/zgloszenia/exam/components/SlotClusterPopup.tsx`
- `src/components/zgloszenia/exam/ArchivedExamResultsPage.tsx`
- `src/components/zgloszenia/admin/ArchivedSubmissionsPage.tsx`

---

### 📚 System Materiałów - Enhanced Formatting (2026-02-09)

**Status:** ✅ COMPLETED - Migration 019 + 13 plików zmodyfikowanych

**Cel:** Uporządkować wygląd materiałów poprzez lepsze formatowanie + zabezpieczenia copy protection

**Key Features:**
- **Enhanced QuillEditor**: Nagłówki (H1, H2, H3), kolory tekstu/tła, wklejanie obrazków
- **Template Presets**: 5 gotowych szablonów HTML (Procedura, Regulamin, Materiał Dywizji, Lista kroków, Pusty)
- **is_mandatory field**: Checkbox + badge (czerwony OBOWIĄZKOWY / szary DODATKOWY) + filtr
- **Copy Protection**: Watermark z username, user-select: none, DevTools detection + blur
- **MDT Theme fix**: QuillEditor emoji picker z CSS variables (usunięto hardcoded Sheriff colors)

**Database:**
- SQL 019: `is_mandatory BOOLEAN DEFAULT FALSE` dla `materials` + `division_materials`
- Wszystkie istniejące materiały defaulted to FALSE (nieobowiązkowe)
- No RLS changes (existing policies cs/hcs/dev already grant access)

**New Shared Components** (4):
- `src/components/shared/MandatoryBadge.tsx` - Badge obowiązkowy/dodatkowy
- `src/components/shared/MaterialFilter.tsx` - Filtr (wszystkie/obowiązkowe/dodatkowe)
- `src/components/shared/ProtectedContent.tsx` - Copy protection wrapper (watermark, DevTools blur)
- `src/components/shared/TemplatePresets.tsx` - Dropdown z 5 szablonami HTML

**Modified Components** (5):
- `src/components/shared/QuillEditor.tsx` - +Headers, +Colors, +Image, MDT CSS variables fix
- `src/components/divisions/DivisionPage/MaterialCard.tsx` - +MandatoryBadge
- `src/components/materials/Materials/MaterialModal.tsx` - +ProtectedContent wrapper
- `src/components/divisions/DivisionPage/MaterialForm.tsx` - +Checkbox is_mandatory, +TemplatePresets
- `src/components/divisions/DivisionPage/DivisionPage.tsx` - Propagacja is_mandatory props

**Modified Hooks** (1):
- `src/components/divisions/DivisionPage/hooks/useDivisionMaterials.ts` - +isMandatory state + CRUD

**QuillEditor Toolbar (Enhanced):**
```
[Header 1/2/3] [Font] [Bold/Italic/Underline/Strike]
[Super/Sub] [Text Color/Background Color]
[Blockquote/Code] [Lists] [Align]
[Link/Image] [Divider/Emoji/Undo] [Clean]
```

**Copy Protection Details:**
- `user-select: none` - blokuje zaznaczanie tekstu (CSS)
- Watermark - semi-transparent username overlay (opacity 0.05, 45° rotation, VT323 font)
- DevTools detection - sprawdza outerWidth/innerHeight diff co 1s, blur(10px) + warning overlay

**Template Presets:**
1. **Procedura (FTS/Pościg)**: I. INICJACJA, II. MELDUNEK, III. PROCEDURA KROK PO KROKU
2. **Regulamin/Zasady**: I. DEFINICJA, II. SZYKI I STRUKTURA, III. PROCEDURA
3. **Materiał Dywizji**: Charakterystyka (Definicja, Zakres, Obowiązki, Przywileje, Profil kandydata)
4. **Lista kroków**: Numerowana lista z bold headers
5. **Pusty**: Czyści editor

---

Last Updated: 2026-02-09 - Enhanced Materials + Copy Protection

**Session History (2026-02-08):**
- Production Bugfixes: 6/6 critical bugs ✅ (commits: f0bcb5a → c2c6500)
- MDT Terminal Theme Migration: 3 commits ✅ (ebcae6d → 6d374c5)
- Polish diacritics: Fixed across all components ✅
- New MDT Terminal page: /divisions/dtu/mdt ✅
- Dark mode: CSS variables + localStorage toggle ✅
- Build: ✅ SUCCESS

**Session History (2026-02-09 AM):**
- Exam System Enhancements: 3 commits ✅ (4fcb559 → 31cceb5)
- Fixed durations: Trainee=1h, Pościgowy=1h, SWAT=15min, SEU=1h ✅
- Calendar: Stash clustering + toggle ZAKOŃCZONE ✅
- Archive: Submissions + Exam Results (pagination, sorting) ✅
- Eligibility: CS+ bypass, self-booking block, rank/permission checks ✅
- Slot management: Available + booked slots visible, delete option ✅
- ExamHistoryPage: CS+ only with AccessDenied guard ✅
- Build: ✅ SUCCESS

**Session History (2026-02-09 PM):**
- Enhanced Materials System: 13 plików zmodyfikowanych ✅
- QuillEditor: +Headers (H1/H2/H3), +Colors, +Image, MDT CSS fix ✅
- Template Presets: 5 szablonów HTML (Procedura, Regulamin, Dywizja, Lista, Pusty) ✅
- is_mandatory field: SQL 019 migration + checkbox + badge + filtr ✅
- Copy Protection: watermark + user-select:none + DevTools blur ✅
- 4 new shared components (MandatoryBadge, MaterialFilter, ProtectedContent, TemplatePresets) ✅
- Build: ✅ SUCCESS