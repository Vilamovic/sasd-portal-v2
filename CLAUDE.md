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
* **Button Positioning**: WSZYSTKIE przyciski "Powrót" ZAWSZE w pozycji `absolute top-8 left-8` - jednolity standard dla obecnych i przyszłych stron (wzorzec z `/exams`, `/materials`, `/personnel`, `/divisions`).

---

## 📝 Git Commit Pattern
```text
feat: [Krótki opis]
- [Zmiana 1]
- [Zmiana 2]
Zmienione pliki: [ścieżki]

---

## 📋 Current Task Status

### 🎯 ACTIVE: System Kartoteki (Zarządzanie Personelem)
**Start Date:** 2026-02-05
**Detailed Instructions:** See `/task/INSTRUCTIONS.md` for complete requirements

**Key Features:**
- Dywizje (FTO #c9a227, SS #ff8c00, DTU #60a5fa, GU #10b981) - wyświetlane w Navbar
- Uprawnienia (SWAT, SEU, AIR, Press Desk, Dispatch, Pościgowe)
- System stopni (19 rang hierarchii: Trainee → Sheriff)
- System kar i nagród (PLUS/MINUS) z timerami
- Kartoteka użytkowników (tylko CS+)
- Captain III auto-Commander (automatyczne nadanie is_commander przy awansie)

**Database:**
- ✅ **Active Migrations**: `007`, `008`, `009`, `010` (all executed in Supabase)
  - Migration 010 features:
    - Added "Pościgowe" to permission_type ENUM
    - Added is_commander column to users table
    - Updated RLS policies for new role hierarchy (cs/hcs instead of admin)
    - CS can DELETE only plus/minus penalties
    - CS can UPDATE only trainee/deputy users
    - HCS/Dev can DELETE all penalties and UPDATE all users
- Project ref: `jecootmlzlwxubvumxrk`
- Tables: `user_penalties`, `user_notes`
- RPC: `get_active_penalties(p_user_id)` - zwraca aktywne kary z `remaining_seconds`

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

**Recent Changes (2026-02-07):**
- System refactor v3: Privacy (email cleanup), UI (navigation top-left, user identity format)
- Navbar: DTU color fix (#60a5fa), timer moved left
- Personnel: Sortable columns with arrows, division tags instead of dropdown
- Role hierarchy: Trainee → Deputy → CS → HCS → Dev with permission gating
- CS restrictions: can manage only Trainee/Deputy, can zero only +/-
- Captain III + Division → auto-Commander flag
- **Database**: Migration 010 executed (Pościgowe permission, is_commander column, RLS policies update)
- **UI Fixes Post-Refactor v3**:
  - Naming: HCS = "High Command Staff", CS = "Command Staff" (changed from "Coordinator")
  - User display order: Nick MTA → @username (kartoteka, admin panel)
  - Button standardization: ALL "Powrót" buttons at `absolute top-8 left-8` position
  - Removed duplicate "Sortuj" section from personnel page
  - CS button text: "Wyzeruj +/-" instead of "Wyzeruj wszystko"
  - Badge label changed to "Stopień" in admin panel
---

Last Updated: 2026-02-07 - System Refactor v3 Complete