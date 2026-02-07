# 🛠️ SASD Portal - Refactoring Plan & Progress Tracker

**Data rozpoczęcia:** 2026-02-07
**Cel:** Totalna refaktoryzacja architektury projektu - podział monolitów na małe, czytelne komponenty

---

## 📊 AUDIT WYNIKÓW (Line Count Analysis)

### 🔴 KRYTYCZNE (>1000 linii) - PRIORYTET 1
- [x] `src/utils/supabaseHelpers.js` - **1046 linii** ✅ **DONE** (2026-02-07)
- [x] `app/personnel/[username]/page.tsx` - **1868 linii** ✅ **DONE** (2026-02-07)
- [x] `app/personnel/page.tsx` - **1124 linie** ✅ **DONE** (2026-02-07)

### 🟡 WYSOKIE (500-1000 linii) - PRIORYTET 2
- [x] `src/components/exam/ExamTaker.jsx` - **831 linii** ✅ **DONE** (2026-02-07)
- [x] `src/utils/discord.js` - **641 linii** ✅ **DONE** (2026-02-07)
- [x] `src/components/materials/Materials.jsx` - **586 linii** ✅ **DONE** (2026-02-07)
- [x] `src/contexts/AuthContext.jsx` - **573 linie** ✅ **DONE** (2026-02-07)
- [ ] `src/components/exam/ExamQuestions.jsx` - **570 linii**
- [ ] `src/components/admin/AdminPanel.jsx` - **539 linii**
- [ ] `app/divisions/[divisionId]/page.tsx` - **462 linie**

### 🟢 ŚREDNIE (300-500 linii) - DO ROZWAŻENIA
- `src/components/exam/ExamStatistics.jsx` - 423 linie
- `src/components/admin/TokenManagement.jsx` - 421 linii
- `src/components/exam/ExamArchive.jsx` - 417 linii
- `src/components/dashboard/Navbar.jsx` - 342 linie
- `src/components/auth/Login.jsx` - 317 linii
- `src/components/exam/ExamDashboard.jsx` - 279 linii

### ✅ OK (<300 linii) - NIE RUSZAĆ
- `src/components/dashboard/Dashboard.jsx` - 230 linii ✅
- `src/utils/examUtils.js` - 183 linie ✅
- `src/components/dashboard/MtaNickModal.jsx` - 128 linii ✅
- `app/divisions/page.tsx` - 159 linii ✅

---

## 🎯 PLAN REFAKTORYZACJI - ETAP 1 (Top 10)

### **1️⃣ supabaseHelpers.js (1046 linii)** - FOUNDATION
**Status:** ✅ DONE (2026-02-07)
**Priorytet:** 🔴 KRYTYCZNY (używany wszędzie)

**Problem:**
- Wszystkie operacje bazowe w jednym pliku
- Kategorie: Users, Materials, Exams, Penalties, Notes, Tokens, Divisions

**Plan podziału:**
```
src/lib/db/
├── users.ts          (getUserById, upsertUser, updateRole, updateMtaNick...)
├── materials.ts      (getMaterials, upsertMaterial, deleteMaterial...)
├── exams.ts          (getAllExamTypes, getQuestionsByExamType, saveExamResult...)
├── penalties.ts      (addPenalty, deletePenalty, getUserPenalties, clearPenalties...)
├── notes.ts          (addUserNote, deleteUserNote, getUserNotes, clearNotes...)
├── tokens.ts         (generateExamToken, verifyAndConsumeToken, getAllTokens...)
└── divisions.ts      (getDivisionMaterials, upsertDivisionMaterial...)
```

**Impact:** WYSOKI - wszystkie komponenty mają czytelniejsze importy

**Zmiany w importach:**
```typescript
// PRZED:
import { getUserById, getMaterials, addPenalty } from '@/src/utils/supabaseHelpers';

// PO:
import { getUserById } from '@/src/lib/db/users';
import { getMaterials } from '@/src/lib/db/materials';
import { addPenalty } from '@/src/lib/db/penalties';
```

---

### **2️⃣ app/personnel/[username]/page.tsx (1868 linii)** - USER PROFILE
**Status:** ❌ TODO
**Priorytet:** 🔴 KRYTYCZNY

**Problem:**
- Gigantyczna strona profilu użytkownika
- 8+ modal form states (plus/minus, penalty, written warning, note)
- Inline editing (badge, division, permissions)
- Penalties + Notes tables z batch delete
- Timer countdown logic dla kar

**Plan podziału:**
```
src/components/personnel/UserProfile/
├── UserProfilePage.tsx           (100-150 linii - orchestrator)
├── ProfileHeader.tsx             (avatar, nick, stats)
├── ProfileStats.tsx              (plus/minus counters, division badge)
├── InlineEditors/
│   ├── BadgeEditor.tsx           (dropdown + save/cancel)
│   ├── DivisionEditor.tsx        (dropdown + save/cancel)
│   └── PermissionsEditor.tsx     (checkboxes + save/cancel)
├── Modals/
│   ├── AddPlusMinusModal.tsx     (form + submit)
│   ├── AddPenaltyModal.tsx       (form + submit)
│   ├── AddWrittenWarningModal.tsx
│   └── AddNoteModal.tsx
├── Tables/
│   ├── PenaltiesTable.tsx        (lista kar + batch delete + timers)
│   └── NotesTable.tsx            (lista notatek + batch delete)
└── hooks/
    ├── useUserProfile.ts         (load user, penalties, notes)
    └── usePenaltyTimers.ts       (countdown logic dla timerów)
```

**Impact:** BARDZO WYSOKI - najbardziej skomplikowana strona w projekcie

---

### **3️⃣ app/personnel/page.tsx (1124 linie)** - KARTOTEKA LIST
**Status:** ❌ TODO
**Priorytet:** 🔴 KRYTYCZNY

**Problem:**
- Kartoteka z search, filters, sorting
- Batch operations modal (badges, permissions, divisions)
- Selection checkboxes (dla batch operations)
- Sortable table

**Plan podziału:**
```
src/components/personnel/PersonnelList/
├── PersonnelPage.tsx              (100-150 linii - orchestrator)
├── SearchBar.tsx                  (input + ikona)
├── FiltersPanel.tsx               (division filter, role filter)
├── PersonnelTable.tsx             (wrapper)
│   ├── TableHeader.tsx            (sortable columns)
│   ├── TableRow.tsx               (single user row + checkbox)
│   └── SelectionCheckbox.tsx      (checkbox UI)
├── BatchOperationsModal.tsx       (modal z 3 tabs: badges/permissions/divisions)
└── hooks/
    ├── usePersonnelList.ts        (load users, filters, search, sort)
    └── useBatchOperations.ts      (selection logic, batch submit)
```

**Impact:** WYSOKI

---

### **4️⃣ src/components/exam/ExamTaker.jsx (831 linii)** - EXAM FLOW
**Status:** ❌ TODO
**Priorytet:** 🟡 WYSOKI

**Problem:**
- Cały flow egzaminu w jednym komponencie
- Wybór typu, token modal, timer, questions, results
- LocalStorage recovery logic
- Auto-advance przy timeout

**Plan podziału:**
```
src/components/exam/ExamTaker/
├── ExamTakerPage.jsx          (100 linii - orchestrator + router)
├── ExamTypeSelection.jsx      (wybór typu egzaminu)
├── TokenModal.jsx             (weryfikacja tokenu dla non-admin)
├── ExamQuestion.jsx           (pytanie + answers + multiple choice)
├── ExamResults.jsx            (ekran wyników z podsumowaniem)
├── TimerDisplay.jsx           (countdown component)
└── hooks/
    ├── useExamState.ts        (exam state + localStorage recovery)
    ├── useExamTimer.ts        (timer logic + auto-advance)
    └── useTokenVerification.ts (token modal logic)
```

**Impact:** WYSOKI - główny flow aplikacji

---

### **5️⃣ src/utils/discord.js (641 linii)** - WEBHOOKS
**Status:** ❌ TODO
**Priorytet:** 🟡 WYSOKI

**Problem:**
- Wszystkie Discord webhooks w jednym pliku
- Kategorie: Auth, Exams, Admin, Personnel

**Plan podziału:**
```
src/lib/webhooks/
├── auth.ts          (notifyUserAuth, notifyLogout...)
├── exams.ts         (notifyExamSubmission, notifyCheat...)
├── admin.ts         (notifyAdminAction, notifyRoleChange...)
└── personnel.ts     (notifyPenalty, notifyBadgeChange, notifyPermissionChange...)
```

**Impact:** ŚREDNI

---

### **6️⃣ src/components/materials/Materials.jsx (586 linii)** - MATERIALS
**Status:** ✅ DONE (commit: bcc5d37)
**Priorytet:** 🟡 WYSOKI

**Problem:**
- Materiały z dodawaniem/edycją w jednym pliku
- Form state + lista

**Plan podziału:**
```
src/components/materials/Materials/
├── MaterialsPage.tsx          (338L - orchestrator)
├── MaterialsList.tsx          (121L - grid + empty state)
├── MaterialModal.tsx          (259L - combined view/edit/fullscreen)
└── hooks/
    └── useMaterials.ts        (120L - CRUD operations)
```

**Result:** 586L → 11L (-575L, -98%) + 849L w 4 nowych plikach
**Impact:** ŚREDNI

---

### **7️⃣ src/contexts/AuthContext.jsx (573 linie)** - AUTH CONTEXT
**Status:** ✅ DONE (commit: a5d934e)
**Priorytet:** 🟡 WYSOKI

**Problem:**
- Context z całą logiką auth + force logout + penalties + realtime
- Za dużo odpowiedzialności

**Plan podziału:**
```
src/contexts/
├── AuthContext.tsx            (214L - orchestrator)
└── hooks/
    ├── useAuthSession.ts      (261L - session + Discord OAuth + MTA)
    ├── useForceLogout.ts      (159L - realtime + fallback polling 30s)
    ├── usePenalties.ts        (92L - fetchActivePenalties + polling)
    └── useRoleCheck.ts        (77L - role hierarchy helpers)
```

**Result:** 573L → 803L (orchestrator + 4 hooki, +230L separation of concerns)
**Impact:** WYSOKI - używany wszędzie

---

### **8️⃣ src/components/exam/ExamQuestions.jsx (570 linii)** - QUESTIONS MGMT
**Status:** ❌ TODO
**Priorytet:** 🟡 WYSOKI

**Problem:**
- Zarządzanie pytaniami (typ selection + lista + edycja inline)

**Plan podziału:**
```
src/components/exam/ExamQuestions/
├── ExamQuestionsPage.jsx      (orchestrator)
├── TypeSelection.tsx          (wybór typu egzaminu)
├── QuestionsList.tsx          (lista pytań)
├── QuestionEditor.tsx         (inline edit + save/cancel)
└── hooks/
    └── useExamQuestions.ts    (load, add, edit, delete)
```

**Impact:** ŚREDNI

---

### **9️⃣ src/components/admin/AdminPanel.jsx (539 linii)** - ADMIN PANEL
**Status:** ❌ TODO
**Priorytet:** 🟡 ŚREDNI

**Problem:**
- Panel admina z dropdown (świeżo refactorowany Portal)
- Search, sorting, role management

**Plan podziału:**
```
src/components/admin/AdminPanel/
├── AdminPanelPage.jsx         (orchestrator)
├── UsersTable.tsx             (tabela wrapper)
├── UserRow.tsx                (wiersz + avatar + dane)
├── RoleDropdown.tsx           (dropdown portal z hierarchy)
└── hooks/
    └── useAdminPanel.ts       (load users, update role, kick)
```

**Impact:** ŚREDNI

---

### **🔟 app/divisions/[divisionId]/page.tsx (462 linie)** - DIVISION MATERIALS
**Status:** ❌ TODO
**Priorytet:** 🟡 ŚREDNI

**Problem:**
- Division materials z dodawaniem/edycją

**Plan podziału:**
```
src/components/divisions/
├── DivisionPage.tsx           (orchestrator)
├── DivisionMaterials.tsx      (lista)
├── MaterialForm.tsx           (dodawanie/edycja)
└── hooks/
    └── useDivisionMaterials.ts (load, add, edit, delete)
```

**Impact:** NISKI

---

## 📁 DOCELOWA STRUKTURA PROJEKTU

```
src/
├── app/                       (Next.js 15 App Router - tylko routing)
│   ├── personnel/
│   │   ├── page.tsx          (używa PersonnelPage component)
│   │   └── [username]/
│   │       └── page.tsx      (używa UserProfilePage component)
│   ├── divisions/
│   ├── exams/
│   └── ...
│
├── components/
│   ├── ui/                    (małe, reusable elementy)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Table/
│   │       ├── Table.tsx
│   │       ├── TableHeader.tsx
│   │       └── TableRow.tsx
│   │
│   ├── personnel/             (komponenty kartoteki)
│   │   ├── PersonnelList/
│   │   └── UserProfile/
│   │
│   ├── exam/                  (komponenty egzaminów)
│   │   ├── ExamTaker/
│   │   └── ExamQuestions/
│   │
│   ├── materials/
│   ├── divisions/
│   ├── admin/
│   └── dashboard/
│
├── hooks/                     (custom hooks - logika biznesowa)
│   ├── usePersonnelList.ts
│   ├── useUserProfile.ts
│   ├── useExamState.ts
│   └── ...
│
├── lib/                       (server-side logic)
│   ├── db/                    (database operations)
│   │   ├── users.ts
│   │   ├── materials.ts
│   │   ├── exams.ts
│   │   ├── penalties.ts
│   │   └── ...
│   │
│   ├── webhooks/              (Discord notifications)
│   │   ├── auth.ts
│   │   ├── exams.ts
│   │   └── personnel.ts
│   │
│   └── actions/               (Server Actions - optional)
│       └── personnel.ts
│
├── contexts/                  (React Contexts - tylko state)
│   ├── AuthContext.tsx
│   └── TranslationContext.tsx
│
└── utils/                     (pure functions, helpers)
    ├── examUtils.ts
    └── ...
```

---

## 🚀 PLAN WYKONANIA

### **ETAP 1.1: Foundation (supabaseHelpers)** ✅ DONE (2026-02-07)
- [x] Stwórz folder `src/lib/db/`
- [x] Podziel `supabaseHelpers.js` na 7 plików
- [x] Zaktualizuj wszystkie importy w całym projekcie (12 plików)
- [x] Test build (`npm run build`)
- [x] Commit: `refactor: Podział supabaseHelpers na src/lib/db/*` (commit: ec3a458)

### **ETAP 1.2: Personnel - User Profile** ✅ DONE (2026-02-07)
#### **ETAP 1.2a: Modals** ✅ DONE (2026-02-07)
- [x] Stwórz folder `src/components/personnel/UserProfile/Modals/`
- [x] Wydziel 4 modals (AddNote, AddPlusMinus, AddPenalty, AddWrittenWarning)
- [x] Test build (`npm run build`)
- [x] Commit: `refactor: ETAP 1.2a - Wydzielenie modals z UserProfile` (commit: 2c520b1)
- **Rezultat**: UserProfile 1876 → 1557 linii (-319 linii, -17%)

#### **ETAP 1.2b-e: Pozostałe komponenty** ✅ DONE (2026-02-07)
- [x] Wydziel Inline Editors (Badge, Division, Permissions) ~240 linii (commit: c6e346d)
- [x] Wydziel Tables (Penalties, Notes) ~300 linii (commit: 0a0dbca)
- [x] Wydziel ProfileHeader + ProfileStats + ActiveSuspensions
- [x] Stwórz hooks (`useUserProfile`, `usePenaltyTimers`)
- [x] Stwórz UserProfilePage orchestrator
- [x] Zaktualizuj `app/personnel/[username]/page.tsx` (tylko routing)
- [x] Test build
- [x] Commit: `refactor: ETAP 1.2 COMPLETE` (commit: 3344e57)
- **Rezultat**: app/personnel/[username]/page.tsx: 1876 → 15 linii (-1861 linii, -99%)

### **ETAP 1.3: Personnel - List** ✅ DONE (2026-02-07)
- [x] Stwórz folder `src/components/personnel/PersonnelList/`
- [x] Podziel `app/personnel/page.tsx` na komponenty (9 plików)
- [x] Stwórz hooks (`usePersonnelList`, `useBatchOperations`)
- [x] Zaktualizuj `app/personnel/page.tsx` (tylko routing)
- [x] Test build
- [x] Commit: `refactor: ETAP 1.3 COMPLETE - PersonnelList refactoring` (commit: aab7d02)
- **Rezultat**: app/personnel/page.tsx: 1124 → 8 linii (-1116 linii, -99.3%)

### **ETAP 2.1: ExamTaker** 🚧 IN PROGRESS (2026-02-07)
- [x] Stwórz folder `src/components/exam/ExamTaker/`
- [x] **Phase A**: TokenModal.tsx (110L), ExamTypeSelection.tsx (95L)
- [x] **Phase B**: TimerDisplay.tsx (32L), ExamResults.tsx (129L), ExamQuestion.tsx (144L)
- [x] **Phase C**: Hooks (3 pliki, 264L total)
  - [x] useExamState.ts (141L) - exam state + localStorage recovery
  - [x] useExamTimer.ts (48L) - timer countdown + auto-advance
  - [x] useTokenVerification.ts (75L) - token modal logic
- [ ] **Phase D**: ExamTakerPage.tsx orchestrator (~300-400L)
  - [ ] finishExam() logic (save results, discord webhook, clear localStorage)
  - [ ] handleNextQuestion() (timeout handling, last question check)
  - [ ] handleAnswerSelect() (single vs multiple choice)
  - [ ] startExam() (admin bypass vs token requirement)
  - [ ] Cheating detection (visibilitychange, window.blur)
  - [ ] Conditional rendering (loading, type selection, question, results)
- [ ] Zaktualizuj `src/components/exam/ExamTaker.jsx` → routing wrapper
- [ ] Test build
- [ ] Commit: `refactor: ETAP 2.1 COMPLETE - ExamTaker refactoring`
- **Progress**: 8/10 plików (774L created), orchestrator remaining
- **Rezultat (target)**: ExamTaker.jsx: 832L → ~10L (routing wrapper)

### **ETAP 2.2: Discord Webhooks**
- [ ] Stwórz folder `src/lib/webhooks/`
- [ ] Podziel `discord.js` na 4 pliki
- [ ] Zaktualizuj importy
- [ ] Test build
- [ ] Commit: `refactor: Podział discord.js na src/lib/webhooks/*`

### **ETAP 2.3: Materials**
- [ ] Stwórz folder `src/components/materials/`
- [ ] Podziel `Materials.jsx`
- [ ] Test build
- [ ] Commit: `refactor: Podział Materials na komponenty`

### **ETAP 2.4: AuthContext**
- [ ] Stwórz folder `src/contexts/hooks/`
- [ ] Wydziel hooks z `AuthContext.jsx`
- [ ] Test build
- [ ] Commit: `refactor: Podział AuthContext na context + hooks`

### **ETAP 2.5: ExamQuestions**
- [ ] Stwórz folder `src/components/exam/ExamQuestions/`
- [ ] Podziel na komponenty
- [ ] Test build
- [ ] Commit: `refactor: Podział ExamQuestions na komponenty`

### **ETAP 2.6: AdminPanel**
- [ ] Stwórz folder `src/components/admin/AdminPanel/`
- [ ] Podziel na komponenty
- [ ] Test build
- [ ] Commit: `refactor: Podział AdminPanel na komponenty`

### **ETAP 2.7: Divisions**
- [ ] Stwórz folder `src/components/divisions/`
- [ ] Podziel `app/divisions/[divisionId]/page.tsx`
- [ ] Test build
- [ ] Commit: `refactor: Podział Division Page na komponenty`

---

## 📝 ZASADY REFAKTORYZACJI

1. ✅ **Zawsze build po zmianach** (`npm run build`)
2. ✅ **Commit po każdym etapie** (nie batchuj)
3. ✅ **Nie zmienia logiki** - tylko struktura
4. ✅ **Sheriff Theme NIETYKALNY** - kolory pozostają
5. ✅ **TypeScript tam gdzie możliwe** (.tsx dla komponentów, .ts dla utils/hooks)
6. ✅ **Import aliases** - używaj `@/src/...`
7. ✅ **JSDoc comments** dla funkcji publicznych
8. ✅ **Nie twórz abstrakcji** na siłę - tylko tam gdzie sensowne

---

## 🎯 METRYKI SUKCESU

**PRZED:**
- Największy plik: 1868 linii
- Średnia top 10: 936 linii
- Łączna ilość linii top 10: 9360 linii

**CEL PO REFACTORZE:**
- Największy plik: <200 linii (orchestrator)
- Średnia komponentu: <150 linii
- Łączna ilość plików: ~100-120 (zamiast 10 monolitów)

---

## 📊 PROGRESS TRACKER

**Data rozpoczęcia:** 2026-02-07
**Data zakończenia:** _TBD_

**Ukończone etapy:** 3/10 (+ 0.8 częściowo)
**Progress:** ███▓░░░░░░ 35%

### Changelog:
- **2026-02-07 (morning):** ✅ ETAP 1.1 - supabaseHelpers.js → src/lib/db/* (7 plików, commit: ec3a458)
- **2026-02-07 (afternoon):** ✅ ETAP 1.2 - UserProfile complete (14 komponentów, 1876L → 15L, commits: 2c520b1, c6e346d, 0a0dbca, 3344e57)
- **2026-02-07 (evening):** ✅ ETAP 1.3 - PersonnelList complete (9 komponentów, 1124L → 8L, commit: aab7d02)
- **2026-02-07 (late evening):** 🚧 ETAP 2.1 - ExamTaker in progress (8/10 plików, 774L created)
  - Phase A-C: Components + Hooks DONE
  - Phase D: Orchestrator PENDING (~300-400L remaining)

---

**Ostatnia aktualizacja:** 2026-02-07 (ETAP 2.1 częściowo - orchestrator pozostały)
