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

---

## 📝 Git Commit Pattern
```text
feat: [Krótki opis]
- [Zmiana 1]
- [Zmiana 2]
Zmienione pliki: [ścieżki]

---

## 📋 Current Task Status

### 🎯 ACTIVE: Refaktoryzacja Projektu (Code Quality)
**Start Date:** 2026-02-07
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
- Project ref: `jecootmlzlwxubvumxrk`
- Tables: `user_penalties`, `user_notes`, `materials`, `division_materials`, `exam_access_tokens`
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

**Refactoring Progress (2026-02-07):**

**✅ COMPLETED:**
- **ETAP 1.1**: supabaseHelpers.js → src/lib/db/* (7 plików, commit: ec3a458)
- **ETAP 1.2**: UserProfile complete (14 komponentów, 1876L → 15L, commits: 2c520b1, c6e346d, 0a0dbca, 3344e57)
- **ETAP 1.3**: PersonnelList complete (9 komponentów, 1124L → 8L, commit: aab7d02)
- **ETAP 2.1**: ExamTaker complete (10 plików, 832L → 11L, commits: d7c24d2, 3dc1157)
- **ETAP 2.2**: Discord Webhooks complete (4 pliki webhook, 12 files updated, commit: 22b7700)
- **ETAP 2.3**: Materials complete (5 plików, 586L → 11L, commit: bcc5d37)
- **ETAP 2.4**: AuthContext complete (5 plików, 573L → 803L orchestrator + 4 hooki, commit: a5d934e)
- **ETAP 2.5**: ExamQuestions complete (6 plików, 570L → 11L, commit: 6d27e2e)

**📊 Overall Progress:** 80% (8/10 etapów)

**Next Steps:**
1. ETAP 2.6: AdminPanel refactoring (~539L)
2. ETAP 2.7: Divisions refactoring (~462L)
3. ETAP 3: Średnie pliki (300-500L) - optional refinement

---

Last Updated: 2026-02-07 - ETAP 2.5 complete, 8/10 etapów (80%)