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
* **Identity**: `dev` (UUID: `c254fb57-72d4-450c-87b7-cd7ffad5b715`) > `admin` > `user`.
* **Core Systems**: Auth (Discord), Force Logout (polling 5s), Exams (JSONB), Discord Webhooks.

---

## 🚀 Troubleshooting History
* **Z-Index**: Navbar `z-[60]`, Dropdown `z-[9999]`.
* **Tailwind v4**: Zakaz `@apply` dla custom hexów w CSS.
* **Vercel**: Dummy commit triggeruje deploy (`git commit --allow-empty`).

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
- Dywizje (FTO, SS, DTU, GU) - wyświetlane w Navbar
- Uprawnienia (SWAT, SEU, AIR, Press Desk, Dispatch)
- System stopni (17 rang hierarchii)
- System kar i nagród (PLUS/MINUS) z timerami
- Kartoteka użytkowników (tylko admin/dev)

**Database:**
- Migration: `migrations/003_kartoteka_system.sql` (NOT executed yet)
- Project ref: `jecootmlzlwxubvumxrk`
- New tables: `user_penalties`, `user_notes`
- New columns in `users`: `division`, `permissions`, `plus_count`, `minus_count`

**Status:**
- ✅ Migration SQL file created
- ✅ MCP config updated to correct database
- ✅ Complete instructions documented in `/task/INSTRUCTIONS.md`
- ⏳ Awaiting migration execution
- ⏳ Navbar modifications pending
- ⏳ Kartoteka pages pending

---

Last Updated: 2026-02-05 23:30 - System Kartoteki planning phase completed