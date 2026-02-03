# 🛡️ SASD Portal v2

System szkoleniowy SASD - Portal egzaminacyjny i materiałów szkoleniowych.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase

---

## 🚀 Quick Start

### 1. Instalacja zależności

```bash
npm install
```

### 2. Konfiguracja zmiennych środowiskowych

Skopiuj `.env.local.example` do `.env.local` i wypełnij wartości:

```bash
cp .env.local.example .env.local
```

Wymagane zmienne:
- `NEXT_PUBLIC_SUPABASE_URL` - URL instancji Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Klucz publiczny Supabase
- `NEXT_PUBLIC_DISCORD_WEBHOOK_EXAMS` - Webhook Discord dla egzaminów
- `NEXT_PUBLIC_DISCORD_WEBHOOK_ADMIN` - Webhook Discord dla akcji admina

### 3. Uruchomienie dev servera

```bash
npm run dev
```

Aplikacja dostępna pod: [http://localhost:3000](http://localhost:3000)

---

## 📦 Struktura Projektu

```
sasd-portal-v2/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Główny layout
│   ├── page.tsx           # Strona główna
│   └── globals.css        # Style globalne
├── src/
│   ├── supabaseClient.js  # Klient Supabase
│   ├── contexts/          # React Contexts (AuthContext, TranslationContext)
│   ├── components/        # Komponenty UI
│   ├── utils/             # Utility functions
│   └── data/              # Stałe dane (pytania, tłumaczenia)
├── public/                # Pliki statyczne
└── next.config.mjs        # Konfiguracja Next.js
```

---

## 🔧 Status Migracji

### ✅ FAZA 1: INICJALIZACJA (UKOŃCZONA)
- [x] Inicjalizacja Next.js 15
- [x] Instalacja zależności
- [x] Konfiguracja Supabase
- [x] Setup podstawowych plików

### 🚧 FAZA 2: CORE & AUTH (W TOKU)
- [ ] TranslationContext
- [ ] AuthContext
- [ ] Login Screen
- [ ] Providers Wrapper

### ⏳ FAZA 3: DASHBOARD & NAWIGACJA
- [ ] Dashboard (kafelki)
- [ ] Sidebar/Navbar

### ⏳ FAZA 4: EGZAMINY
- [ ] examUtils.js
- [ ] ExamTaker
- [ ] Zapisywanie wyników

### ⏳ FAZA 5: ADMIN & MATERIAŁY
- [ ] Panel Admina
- [ ] Edytor Materiałów
- [ ] Discord Webhooks

---

## 📚 Tech Stack

- **Framework:** Next.js 15.5 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.0
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Discord OAuth)
- **Editor:** React-Quill
- **Icons:** Lucide React
- **Markdown:** Marked + React-Markdown

---

## 🔐 Role System

- **dev** (Super-user) - Pełny dostęp, przypisany do UUID `c254fb57-72d4-450c-87b7-cd7ffad5b715`
- **admin** - Zarządzanie użytkownikami, pytaniami, materiałami
- **user** - Dostęp do egzaminów i materiałów

---

## 📝 Scripts

```bash
npm run dev      # Development server (localhost:3000)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint check
```

---

## 🤝 Contributing

Projekt wewnętrzny SASD. Wszelkie zmiany commituj z opisowymi wiadomościami.

### Commit Convention
```
feat: Dodanie nowej funkcjonalności
fix: Naprawa buga
refactor: Refaktoryzacja kodu
docs: Aktualizacja dokumentacji
style: Zmiany stylistyczne
```

---

**Developed with ❤️ by SASD Portal Team**
