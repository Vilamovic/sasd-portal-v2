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

### 4. Logic & Sheriff Theme (🚨 NIETYKALNY 🚨)
* **PRESERVE LOGIC**: Nigdy nie zmieniaj logiki biznesowej (`useEffect`, handlery, async). Zmieniaj tylko UI.
* **SHERIFF THEME**: Absolutny zakaz zmian kolorów: `#020a06` (BG), `#c9a227` (Gold), `#051a0f` (Card), `#1a4d32` (Border).
* **PATTERNS**: Kopiuj style z `ExamDashboard.jsx` dla nowych komponentów.

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
* **Z-Index**: Navbar `z-[60]`, Dropdown `z-[9999]`.
* **Tailwind v4**: Zakaz `@apply` dla custom hexów w CSS.
* **Vercel**: Dummy commit triggeruje deploy (`git commit --allow-empty`).
* **Navbar Sync**: Po operacjach CRUD wywołaj `refreshUserData()` z AuthContext dla natychmiastowej aktualizacji (zamiast czekać 30s na polling).
* **Timer Countdown**: RPC function `get_active_penalties()` oblicza `remaining_seconds` server-side. Navbar korzysta z tego do countdown timerów.
* **Button Positioning**: WSZYSTKIE przyciski "Powrót" ZAWSZE WEWNĄTRZ kontenera `max-w-7xl mx-auto px-6 py-8` jako pierwszy element z `mb-6` - jednolity standard dla obecnych i przyszłych stron (wzorzec z `/exams`, `/materials`, `/personnel`, `/divisions`, `/tokens`).
* **Shared Components**: ZAWSZE używaj komponentów z `/src/components/shared/` dla BackButton, LoadingState, AccessDenied zamiast tworzyć nowe kopie. Importuj: `@/src/components/shared/ComponentName`.
* **PostgreSQL ENUM Cast**: RPC functions comparing ENUM with TEXT require explicit `::text` cast. Example: `WHERE division::text = p_division` (fixes "operator does not exist: division_type = text").
* **Next.js Routing vs State**: State-based routing with conditional components causes React Invariants violations. Use dedicated Next.js routes instead (`router.push('/path')` + separate page.jsx files).

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

Last Updated: 2026-02-08 - 🔥 PRODUCTION BUGFIXES COMPLETE! (6/6 critical bugs resolved) 🚀

**Previous Session (2026-02-07):**
- Refactoring: 13/13 etapów ✅
- Code Cleanup: -1,132L martwy kod + shared components ✅
- Bundle: -4% size reduction ✅
- Commit: efd1cb0 ✅

**Current Session (2026-02-08):**
- Production Bugfixes: 6/6 critical bugs ✅
- Constraint violation fixed (commit: f0bcb5a) ✅
- HCS/CS permissions equalized to Dev ✅
- Division materials + RPC function with ENUM cast ✅
- MaterialForm simplified (5 → 2 fields) ✅
- Exam stats/archive Next.js routing ✅
- RLS policies updated for cs/hcs/dev hierarchy ✅
- Build: ✅ SUCCESS
- Git push: ✅ Pushed to origin/master