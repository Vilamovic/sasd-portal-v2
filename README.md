# 🛡️ SASD Portal v2

> **San Andreas Sheriff Department** - Kompleksowy system zarządzania dla organizacji RP

Portal służący do zarządzania personelem, egzaminami, materiałami szkoleniowymi oraz systemem kartoteki dla San Andreas Sheriff Department.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.11-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 📋 Spis Treści

- [Funkcjonalności](#-funkcjonalności)
- [Tech Stack](#-tech-stack)
- [Struktura Projektu](#-struktura-projektu)
- [Instalacja](#-instalacja)
- [Uruchomienie](#-uruchomienie)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Architektura](#-architektura)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Funkcjonalności

### 🎓 System Egzaminów
- Egzaminy wielokrotnego wyboru (JSONB storage)
- System tokenów dostępu (jednorazowe linki)
- Archiwum egzaminów z podglądem wyników
- Zarządzanie pytaniami (CS+)
- Statystyki zdawalności

### 👥 Kartoteka Personelu
- Profile użytkowników z pełną historią
- System kar i nagród (PLUS/MINUS) z timerami
- Notatki służbowe
- Zarządzanie stopniami (19 rang: Trainee → Sheriff)
- Uprawnienia (SWAT, SEU, AIR, Press Desk, Dispatch, Pościgowe)
- Dywizje (FTO, SS, DTU, GU) z kolorystyką
- Batch operations (DEV only)

### 📚 Materiały Szkoleniowe
- Rich text editor (React Quill)
- Podział na kategorie
- Materiały dywizyjne (wymagane uprawnienia)
- Upload obrazów (Supabase Storage)

### 🔐 System Autentykacji
- Discord OAuth 2.0
- Role hierarchy (Dev > HCS > CS > Deputy > Trainee)
- Force logout (realtime + polling)
- Auto-refresh sesji

### 🎨 UI/UX
- **Sheriff Theme** - Dark theme z #c9a227 (gold) accent
- Responsive design (mobile-first)
- Glow effects & smooth animations
- Loading states & error handling
- Toast notifications

### 📊 Admin Panel
- Zarządzanie użytkownikami (CS+)
- Nadawanie ról/stopni/uprawnień
- Kick users (force logout)
- Discord webhooks dla wszystkich akcji

---

## 🚀 Tech Stack

| Kategoria | Technologia | Wersja |
|-----------|-------------|--------|
| **Framework** | Next.js (App Router) | 15.5.11 |
| **UI Library** | React | 19.x |
| **Language** | TypeScript + JavaScript | 5.x |
| **Styling** | Tailwind CSS | 4.0 |
| **Database** | Supabase (PostgreSQL) | - |
| **Auth** | Supabase Auth (Discord OAuth) | - |
| **Storage** | Supabase Storage | - |
| **Realtime** | Supabase Realtime | - |
| **Rich Text** | React Quill | 3.3.2 |
| **Icons** | Lucide React | Latest |
| **Monitoring** | Sentry | Latest |
| **Testing** | Vitest | Latest |
| **Deployment** | Vercel | - |

---

## 📁 Struktura Projektu

```
sasd-portal-v2/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Login page
│   ├── dashboard/               # Dashboard routes
│   ├── exams/                   # Exam system routes
│   ├── materials/               # Materials routes
│   ├── personnel/               # Personnel routes
│   ├── divisions/               # Divisions routes
│   └── admin/                   # Admin panel routes
│
├── src/
│   ├── components/              # React components
│   │   ├── shared/             # Shared components (BackButton, LoadingState, etc.)
│   │   ├── auth/               # Authentication components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── exam/               # Exam components (Orchestrator Pattern)
│   │   ├── materials/          # Materials components
│   │   ├── personnel/          # Personnel components
│   │   ├── divisions/          # Divisions components
│   │   └── admin/              # Admin components
│   │
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx    # Authentication context (orchestrator)
│   │   ├── Providers.jsx      # Combined providers
│   │   └── hooks/             # Context-related hooks
│   │
│   ├── lib/                    # Library code
│   │   ├── db/                # Database helpers (split by table)
│   │   └── webhooks/          # Discord webhook functions
│   │
│   ├── data/                   # Static data & translations
│   ├── utils/                  # Utility functions
│   └── supabaseClient.js      # Supabase client config
│
├── scripts/                     # Development scripts
├── task/                        # Task documentation
├── migrations/                  # Database migrations (Supabase)
├── .env.local                   # Environment variables (not in git)
├── CLAUDE.md                    # AI development guide
└── README.md                    # This file
```

### Orchestrator Pattern

Projekt używa **Orchestrator Pattern** dla głównych features:

```
Feature/
├── FeaturePage.tsx              # Orchestrator (~150-400L)
├── ComponentA.tsx               # Pure UI component
├── ComponentB.tsx               # Pure UI component
├── Modals/
│   └── ModalX.tsx
└── hooks/
    ├── useFeatureState.ts       # State management
    └── useFeatureLogic.ts       # Business logic
```

**Responsibilities:**
- **Orchestrator**: State, hooks, handlers, composition
- **Components**: Pure presentation (props → JSX)
- **Hooks**: Data fetching, side effects, complex logic

---

## 🛠️ Instalacja

### Wymagania

- **Node.js** >= 18.17.0
- **npm** >= 9.x
- **Git**
- **Supabase Account** (darmowy plan wystarczy)

### Kroki

1. **Clone repository**
   ```bash
   git clone https://github.com/Vilamovic/sasd-portal-v2.git
   cd sasd-portal-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edytuj .env.local i dodaj klucze
   ```

4. **Setup Supabase**
   - Utwórz projekt w [Supabase](https://supabase.com/)
   - Skopiuj `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Wykonaj migracje z folderu `migrations/`
   - Skonfiguruj Discord OAuth w Authentication > Providers

5. **Run development server**
   ```bash
   npm run dev
   ```

   Otwórz [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Utwórz plik `.env.local` w root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Discord Webhooks (opcjonalne)
NEXT_PUBLIC_DISCORD_WEBHOOK_AUTH=https://discord.com/api/webhooks/...
NEXT_PUBLIC_DISCORD_WEBHOOK_EXAMS=https://discord.com/api/webhooks/...
NEXT_PUBLIC_DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/...
NEXT_PUBLIC_DISCORD_WEBHOOK_PERSONNEL=https://discord.com/api/webhooks/...

# Sentry (opcjonalne - error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

**⚠️ WAŻNE:** Nigdy nie commituj `.env.local` do git!

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests (Vitest)
npm run test:ui      # Run tests with UI
npm run test:coverage # Generate coverage report

# Performance
npm run lighthouse   # Run Lighthouse audit
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make changes**
   - Follow Sheriff Theme colors (#020a06, #c9a227, #051a0f, #1a4d32)
   - Use shared components from `src/components/shared/`
   - Write tests dla nowych funkcji

3. **Test locally**
   ```bash
   npm run build        # Check for errors
   npm run test         # Run tests
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: opis zmian"
   ```

5. **Push & Create PR**
   ```bash
   git push origin feature/my-feature
   ```

### Code Style

- **TypeScript** dla nowych plików
- **Prettier** formatting (auto on save)
- **ESLint** rules
- **Conventional Commits** (feat:, fix:, docs:, refactor:)

---

## 🧪 Testing

Projekt używa **Vitest** do testowania.

### Run Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:ui           # Interactive UI
npm run test:coverage     # Coverage report
```

### Writing Tests

Przykład testu dla utility function:

```typescript
// src/utils/__tests__/examUtils.test.ts
import { describe, it, expect } from 'vitest';
import { calculateScore } from '../examUtils';

describe('calculateScore', () => {
  it('calculates correct percentage', () => {
    expect(calculateScore(8, 10)).toBe(80);
    expect(calculateScore(10, 10)).toBe(100);
    expect(calculateScore(0, 10)).toBe(0);
  });

  it('handles edge cases', () => {
    expect(calculateScore(0, 0)).toBe(0);
    expect(calculateScore(-5, 10)).toBe(0);
  });
});
```

### Test Coverage Goal

- **Utility functions**: 90%+
- **Business logic hooks**: 80%+
- **UI components**: 60%+ (critical paths)

---

## 📊 Monitoring & Error Tracking

### Sentry

Projekt używa **Sentry** do error tracking w produkcji.

- Automatyczne łapanie błędów (runtime, promises, network)
- Source maps dla stacktrace
- User context (ID, role, email)
- Performance monitoring (opcjonalne)

**Dashboard:** [sentry.io](https://sentry.io)

### Lighthouse

Regularne audyty performance:

```bash
# W Chrome DevTools:
1. F12 → Lighthouse tab
2. "Analyze page load"
3. Sprawdź score (cel: 90+)
```

**Metryki:**
- **Performance**: >90
- **Accessibility**: >95
- **Best Practices**: >95
- **SEO**: >90

---

## 🚀 Deployment

Projekt jest deployowany na **Vercel**.

### Automatic Deployment

Każdy push do `master` automatycznie triggeruje deploy.

```bash
git push origin master
# Vercel auto-detects changes → builds → deploys
```

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables (Vercel)

Dodaj wszystkie zmienne z `.env.local` w:
- Vercel Dashboard → Project Settings → Environment Variables

---

## 🏗️ Architektura

### Database Schema

**Main Tables:**
- `users` - Użytkownicy (auth + profile)
- `exam_types` - Typy egzaminów
- `exam_results` - Wyniki egzaminów (JSONB)
- `exam_access_tokens` - Tokeny dostępu
- `materials` - Materiały ogólne
- `division_materials` - Materiały dywizyjne
- `user_penalties` - Kary (+ / -)
- `user_notes` - Notatki służbowe

**RPC Functions:**
- `get_active_penalties(user_id)` - Zwraca aktywne kary z `remaining_seconds`

**Row Level Security (RLS):**
- Wszystkie tabele mają RLS policies
- Role hierarchy: `dev > hcs > cs > deputy > trainee`

### Authentication Flow

```
1. User clicks "Zaloguj przez Discord"
2. Redirect to Discord OAuth
3. Discord callback → Supabase Auth
4. Create/update user in DB
5. Redirect to /dashboard
6. AuthContext loads user data
7. Force logout polling starts (5s interval)
```

### Realtime Features

- **Force Logout**: Supabase Realtime channel `user_updates`
- **Penalties Timer**: Polling every 30s + RPC function

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Supabase Connection Error**
```
Error: Invalid Supabase URL
```
**Fix:** Sprawdź `.env.local` - URL musi zaczynać się od `https://`

---

#### 2. **Discord OAuth Not Working**
```
Error: redirect_uri_mismatch
```
**Fix:**
- Supabase Dashboard → Authentication → Providers → Discord
- Dodaj `https://your-project.supabase.co/auth/v1/callback` jako Redirect URL w Discord App

---

#### 3. **Build Fails - Module Not Found**
```
Module not found: Can't resolve '@/src/...'
```
**Fix:** Clear `.next` folder i node_modules:
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

#### 4. **Hydration Error**
```
Error: Hydration failed because the initial UI...
```
**Fix:** Sprawdź czy nie używasz `window` / `localStorage` przed mount:
```typescript
// ❌ ZŁE
const theme = localStorage.getItem('theme');

// ✅ DOBRE
const [theme, setTheme] = useState(null);
useEffect(() => {
  setTheme(localStorage.getItem('theme'));
}, []);
```

---

#### 5. **Sheriff Theme Colors Not Working**
**Colors:**
- BG: `#020a06`
- Gold: `#c9a227`
- Card: `#051a0f`
- Border: `#1a4d32`

**ZAKAZ** używania `@apply` dla custom hexów w Tailwind v4!

---

### Debug Mode

Włącz verbose logging:

```typescript
// src/supabaseClient.js
export const supabase = createClient(url, key, {
  auth: {
    debug: true, // Enable auth debug logs
  },
});
```

---

## 🤝 Contributing

### Git Workflow

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Commit Convention

```
feat: Dodaj nową funkcjonalność
fix: Napraw bug
docs: Aktualizuj dokumentację
refactor: Refaktoryzacja kodu
test: Dodaj testy
chore: Maintenance (dependencies, config)
```

### Pull Request Guidelines

- **Title**: Krótki opis (max 70 znaków)
- **Description**: Co, dlaczego, jak testować
- **Screenshots**: Jeśli zmienia UI
- **Tests**: Dodaj testy dla nowych funkcji
- **Build**: `npm run build` musi przechodzić

---

## 📄 License

This project is private and proprietary.

---

## 👥 Authors

- **Vilamovic** - Initial work & maintenance
- **Claude Sonnet 4.5** - AI pair programming assistant

---

## 🔗 Links

- **Live**: [https://sasd-portal-v2.vercel.app](https://sasd-portal-v2.vercel.app)
- **Supabase**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
- **Sentry**: [https://sentry.io](https://sentry.io)
- **Documentation**: See `/task/` folder for detailed docs

---

## 📈 Project Stats

- **Lines of Code**: ~50,000+ (after refactoring: ~39,000)
- **Components**: 93+
- **Routes**: 11
- **Average File Size**: ~100 lines
- **Bundle Size**: Optimized (-4% from cleanup)
- **Refactoring**: 14/14 etapów completed (100%)

---

## 🎯 Roadmap

- [ ] System raportów służbowych
- [ ] System odznaczeń/osiągnięć
- [ ] Dashboard statystyk (analytics)
- [ ] Mobile app (React Native?)
- [ ] API endpoints (REST/GraphQL)

---

**Made with ❤️ by SASD Team**
