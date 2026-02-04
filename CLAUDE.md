# 🛡️ SASD Portal | Quick Start for AI

> **NOTE**: This file serves as a **quick reference/index**. All detailed documentation is in PROJECT.md.

## 📌 IMPORTANT: Read Main Documentation First

**All project documentation has been consolidated into a single file:**

👉 **[PROJECT.md](./PROJECT.md)** 👈

**Why this file exists**: CLAUDE.md is kept as a lightweight "entry point" that AI reads first. It provides critical rules and points to the main documentation.

This file contains:
- ✅ AI Operational Rules
- ✅ Project Architecture
- ✅ UI Design System (Sheriff Dark Green Theme - NIETYKALNY)
- ✅ Completed Features & Tasks
- ✅ Technical Patterns
- ✅ Deployment & Troubleshooting
- ✅ File Locations
- ✅ Quick Reference Checklist

---

## ⚠️ Quick Start for AI

1. **Read [PROJECT.md](./PROJECT.md) completely**
2. **Confirm ready**: "Co dzisiaj robimy?"
3. **Wait for task** from user
4. **Create TodoWrite checklist** if task is non-trivial
5. **Follow patterns** from PROJECT.md

---

## 🔑 Critical Rules (MUST FOLLOW)

### 1. WAIT FOR TASK
❌ **DO NOT generate code** until you receive a specific task from the user.

### 2. PLANNING FIRST
✅ Use **TodoWrite** tool to create and track task checklist.

### 3. PRESERVE BUSINESS LOGIC
❌ **NEVER change** business logic (useEffect, handlers, async operations).
✅ **ONLY change** UI (colors, layout, classes, icons).

### 4. NO NEW FILES
❌ **DO NOT create** new files without explicit permission.

### 5. AUTONOMOUS DETECTIVE
✅ Use Glob, Grep, Read to explore codebase.
❌ **DO NOT ask** for locations of existing logic.

### ⚠️ 6. **SHERIFF THEME - ABSOLUTNIE NIETYKALNY** ⚠️
🚨 **KATEGORYCZNY ZAKAZ ZMIANY UI BEZ WYRAŹNEJ ZGODY** 🚨

**ZABRANIA SIĘ:**
- ❌ Zmiany kolorów Sheriff Dark Green theme (#020a06, #c9a227, #051a0f, #1a4d32, #22693f, #e6b830)
- ❌ Modyfikacji glassmorphism (.glass, .glass-strong)
- ❌ Usuwania background effects (gradient orbs, animations)
- ❌ Zmiany stylów komponentów bez WYRAŹNEJ zgody użytkownika
- ❌ "Ulepszania" UI na własną rękę
- ❌ Zmiany animacji (pulse-glow, gradient-shift, particle-float)

**NOWE KOMPONENTY:**
✅ Gdy tworzysz NOWE podstrony/komponenty:
- **MUSISZ** użyć TEGO SAMEGO Sheriff theme co istniejące komponenty
- **SKOPIUJ** style z [ExamDashboard.jsx](src/components/exam/ExamDashboard.jsx) lub [Dashboard.jsx](src/components/dashboard/Dashboard.jsx)
- **ZACHOWAJ** glassmorphism, gradient orbs, Sheriff colors, animations
- **PYTAJ** jeśli nie jesteś pewien jak stylować nowy komponent

**Migration History (Feb 2026):**
- Kompletna migracja z Police Blue → Sheriff Dark Green z Tailwind v4
- 100% logiki biznesowej zachowane
- Commit: `fd618b3` - feat: Migrate entire UI to Sheriff Dark Green theme

---

## 📚 Full Documentation

For complete information, always refer to:

**[PROJECT.md](./PROJECT.md)**

---

**Last Updated**: 2026-02-04 (Sheriff Theme Migration Complete)
