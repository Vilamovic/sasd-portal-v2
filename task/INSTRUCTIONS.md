# 🛡️ SASD Portal - System Kartoteki | Instrukcje dla AI

> **CONTEXT**: Ten dokument zawiera pełne wymagania i odpowiedzi na pytania dotyczące implementacji systemu Kartoteki (zarządzanie użytkownikami, dywizje, uprawnienia, kary) w SASD Portal v2.

---

## 📋 PRZEGLĄD PROJEKTU

**Cel:** Stworzenie kompleksowego systemu zarządzania personelem frakcji SASD (San Andreas Sheriff's Department) z:
- Systemem stopni (17 rang hierarchii)
- Dywizjami (4 jednostki specjalne)
- Uprawnieniami (5 specjalizacji)
- Systemem kar i nagród (PLUS/MINUS)
- Kartoteką użytkowników
- Timerem aktywnych kar

---

## 🎯 STRUKTURA DANYCH

### STOPNIE (17 rang) - ENUM `rank_type`
1. Trainee
2. Deputy Sheriff I
3. Deputy Sheriff II
4. Deputy Sheriff III
5. Senior Deputy Sheriff
6. Sergeant I
7. Sergeant II
8. Detective I
9. Detective II
10. Detective III
11. Lieutenant
12. Captain I
13. Captain II
14. Captain III *(max dla Commandera nie w Zarządzie)*
15. Area Commander (CS)
16. Division Chief (CS)
17. Assistant Sheriff (CS)
18. Undersheriff (ES - Vlider)
19. Sheriff (ES - Lider)

**UWAGA:** W oryginalnym pliku były literówki "Sherrif" - zostały poprawione na "Sheriff"

### DYWIZJE (4) - ENUM `division_type`
- **Gang Unit (GU)** - Jasny zielony (#10b981 lub podobny)
- **Detective Task Unit (DTU)** - Granatowy (#1e3a8a lub podobny)
- **Supervisory Staff (SS)** - Pomarańczowy (#ff8c00 lub podobny)
- **Training Staff (FTO)** - Żółty (#c9a227 lub podobny, pasujący do Sheriff theme)

**ZASADY:**
- Użytkownik może mieć **TYLKO JEDNĄ** dywizję
- Dywizje wyświetlają się w Navbar (zamiast emaila)
- Nie ma osobnej strony dla dywizji - tylko wyświetlanie

### UPRAWNIENIA (5) - ENUM `permission_type`
- SWAT
- Speed Enforcement Unit (SEU)
- AIR
- Press Desk
- Dispatch

**ZASADY:**
- Użytkownik może mieć **WIELE** uprawnień jednocześnie
- Uprawnienia wyświetlają się w Navbar (jeden kolor dla wszystkich - białe lub kontrastujące)
- Format wyświetlania: "DTU | SWAT, SEU, AIR"

---

## 💾 STRUKTURA BAZY DANYCH

### Migracja: `migrations/003_kartoteka_system.sql`

**Status:** ✅ Plik stworzony, **NIE uruchomiony** w bazie

**Zmiany w tabeli `users`:**
```sql
- division (division_type) - pojedyncza dywizja
- permissions (permission_type[]) - array uprawnień
- plus_count (INTEGER DEFAULT 0) - licznik plusów
- minus_count (INTEGER DEFAULT 0) - licznik minusów
- badge (rank_type) - stopień (kolumna już istnieje, trzeba zmienić typ)
```

**Nowa tabela `user_penalties`:**
```sql
- id (UUID PRIMARY KEY)
- user_id (UUID REFERENCES users)
- type (penalty_type) - plus/minus/zawieszenie_sluzba/zawieszenie_dywizja/zawieszenie_uprawnienia/upomnienie_pisemne
- description (TEXT) - opis powodu
- evidence_link (TEXT) - link do dowodu
- duration_hours (INTEGER) - czas trwania w godzinach
- expires_at (TIMESTAMPTZ) - kiedy kara wygasa
- is_active (BOOLEAN) - czy kara jest aktywna
- visible_to_user (BOOLEAN) - czy user widzi (FALSE dla upomnienia_pisemne)
- created_by (UUID) - kto nadał
- created_at (TIMESTAMPTZ)
```

**Nowa tabela `user_notes`:**
```sql
- id (UUID PRIMARY KEY)
- user_id (UUID REFERENCES users)
- note (TEXT) - treść notatki
- created_by (UUID) - kto dodał
- created_at (TIMESTAMPTZ)
```

**Funkcje:**
- `expire_penalties()` - auto-wygasanie kar
- `get_active_penalties(user_id)` - pobieranie aktywnych kar z remaining_seconds
- Trigger auto-update `plus_count` i `minus_count` przy INSERT/DELETE w user_penalties

---

## 🎨 KOLORYSTYKA I STYLIZACJA

**Sheriff Theme (NIETYKALNY):**
- Background: `#020a06`
- Gold: `#c9a227`
- Card BG: `#051a0f`
- Border: `#1a4d32`

**Kolory dywizji:**
- FTO: Żółty (pasujący do gold theme)
- SS: Pomarańczowy
- DTU: Granatowy
- GU: Jasny zielony

**Kolory systemowe:**
- PLUS (+): Zielony (#22c55e lub podobny z theme)
- MINUS (-): Czerwony (#ef4444 lub podobny)
- Uprawnienia: Białe lub jeden kontrastujący kolor dla wszystkich

**Wzorce stylów:**
- Kopiować z `ExamDashboard.jsx` dla nowych komponentów
- Search bar i dropdown "Akcja" - wzorować na `AdminPanel.jsx`
- Multi-select i przycisk "Zarządzaj" - wzorować na `Materials.jsx`

---

## 📱 NAVBAR - WYMAGANE ZMIANY

### 1. Wyrzucić email (linie 183-190 w Navbar.jsx)
**USUŃ tę sekcję:**
```jsx
{/* Email */}
<div className="px-3 py-3 flex items-center gap-3...">
  <Mail className="w-5 h-5 text-[#14b8a6]" />
  ...
</div>
```

### 2. Zamienić miejscami nick z discord_name (linie 108-109)
**PRZED:**
```jsx
<span className="text-white font-semibold text-sm">{discordUsername}</span>
<span className="text-[#c9a227] text-xs font-medium">{mtaNick ? `@${mtaNick}` : t(`admin.roles.${role}`)}</span>
```

**PO:**
```jsx
<span className="text-white font-semibold text-sm">{mtaNick || discordUsername}</span>
<span className="text-[#c9a227] text-xs font-medium">@{discordUsername}</span>
```

### 3. Dodać wyświetlanie dywizji i uprawnień (zamiast roli)
**Format:** "DTU | SWAT, SEU, AIR"

**Gdzie:** W dropdownie zamiast sekcji "Rola" (linie 151-170)

**Logika:**
- Jeśli user ma dywizję: pokaż badge z kolorem dywizji
- Jeśli user ma uprawnienia: pokaż listę badges (jeden kolor)
- Format: `{division} | {permissions.join(', ')}`

### 4. Dodać licznik PLUS/MINUS
**Wymagania:**
- Wyświetlać sumę: +X (zielony) i -Y (czerwony)
- Umieścić w dropdownie (ładnie dopasować do Sheriff theme)
- Pobierać z `user.plus_count` i `user.minus_count` (z AuthContext)

### 5. Dodać timer aktywnych kar
**Format:** "Zawieszenie: Uprawnienia Pościgowe : pozostało 23h 45m 36s"

**Wymagania:**
- Timer dla 3 typów kar: zawieszenie_sluzba, zawieszenie_dywizja, zawieszenie_uprawnienia
- **NIE pokazywać** upomnienia_pisemne (visible_to_user = false)
- Może być **kilka zawieszeń naraz** (bardzo rzadko)
- Countdown w czasie rzeczywistym (useEffect + setInterval)
- Umieścić w dropdownie lub obok nicku (ładnie wkomponować)
- Pobierać przez funkcję `get_active_penalties(user_id)` z bazy

---

## 🗂️ KARTOTEKA - STRUKTURA PODSTRON

### Routing:
```
app/kartoteka/
├── page.tsx                    # Lista użytkowników
└── [userId]/
    └── page.tsx                # Profil użytkownika
```

### 1. `/kartoteka` - Lista użytkowników

**Kontrola dostępu:** TYLKO admin/dev

**Funkcjonalność:**
- Search bar (jak w AdminPanel.jsx) z filtrami:
  - Nick (mta_nick)
  - Discord name (username)
  - Stopień (badge)
  - Dywizja (division)
  - Uprawnienia (permissions)
- Sortowanie po:
  - badge (stopień)
  - division
  - permissions (liczba uprawnień?)
  - username
  - mta_nick
  - created_at
  - last_seen
- **Multi-select** użytkowników (checkbox)
- Przycisk "Zarządzaj" (jak w Materials) - pojawia się gdy zaznaczono ≥1 użytkowników

**Tabela/Grid:**
- Avatar (Discord)
- Nick (mta_nick)
- Discord name (username)
- Stopień (badge)
- Dywizja (division z kolorem)
- Uprawnienia (permissions jako badges)
- Dropdown "Akcja" (3 kropki jak w AdminPanel)

**Dropdown "Akcja" (dla pojedynczego usera):**
- Awans badge (+1 stopień)
- Degradacja badge (-1 stopień)
- Nadaj uprawnienie (wybór z listy 5 uprawnień)
- Odbierz uprawnienie (wybór z aktualnych uprawnień usera)
- Nadaj dywizję (wybór z listy 4 dywizji)
- Odbierz dywizję
- Przejdź do profilu

**Przycisk "Zarządzaj" (dla multi-select):**
- Awans badge (każdy +1 swojego stopnia)
- Degradacja badge (każdy -1 swojego stopnia)
- Nadaj uprawnienie (to samo uprawnienie wszystkim)
- Odbierz uprawnienie (to samo uprawnienie wszystkim)
- Nadaj dywizję (ta sama dywizja wszystkim)
- Odbierz dywizję (wszystkim)

**WAŻNE:** Awans/degradacja musi być **relatywna**:
```
Przykład: Zaznaczeni użytkownicy:
- Detective I
- Sergeant II
- Deputy Sheriff II

Po "Awans":
- Detective II (+1)
- Detective I (+1 względem Sergeant II)
- Deputy Sheriff III (+1)

Każdy dostaje +1 względem SWOJEGO stopnia!
```

### 2. `/kartoteka/[userId]` - Profil użytkownika

**Kontrola dostępu:** TYLKO admin/dev

**Sekcje:**

#### A. Header profilu
- Avatar (Discord, duży)
- Nick (mta_nick)
- Discord name (@username)
- Stopień (badge) z możliwością edycji inline (dropdown)
- Dywizja z możliwością edycji (dropdown lub null)
- Uprawnienia z możliwością edycji (multi-select)

#### B. Statystyki
- Plus count: +X (zielony)
- Minus count: -Y (czerwony)
- Aktywne kary: liczba
- Data dołączenia (created_at)
- Ostatnia aktywność (last_seen)

#### C. Aktywne zawieszenia
- Lista aktywnych kar z timerem
- Typ zawieszenia
- Opis
- Link do dowodu
- Pozostały czas (countdown)
- Kto nadał + data

#### D. Historia PLUS/MINUS
**Tabela:**
- Typ (+/-)
- Opis
- Link do dowodu
- Kto nadał
- Data

**Przycisk:** "Dodaj PLUS" / "Dodaj MINUS"

**Modal formularza:**
- Typ: PLUS / MINUS (radio buttons)
- Opis (textarea, required)
- Link do dowodu (input URL, optional)
- Przycisk "Wyślij"
- Discord webhook po zapisaniu

#### E. Historia kar
**Tabela:**
- Typ kary (zawieszenie_sluzba/dywizja/uprawnienia/upomnienie_pisemne)
- Opis
- Link do dowodu
- Czas trwania (w godzinach/dniach)
- Status (Aktywna/Wygasła)
- Pozostały czas (jeśli aktywna)
- Kto nadał
- Data nadania

**Przycisk:** "Nadaj karę"

**Modal formularza:**
- Typ kary (select):
  - Zawieszenie w czynnościach służbowych
  - Zawieszenie w czynnościach dywizyjnych
  - Zawieszenie w uprawnieniach
  - Upomnienie pisemne
- Opis (textarea, required)
- Link do dowodu (input URL, optional)
- Czas trwania (input number + select jednostki):
  - Godziny (input: 24h, 48h, 72h)
  - Dni (input: 1 dzień, 3 dni, 7 dni, 14 dni)
  - **NIE kalendarz!** Tylko liczba godzin/dni
- Przycisk "Nadaj karę"
- Discord webhook po zapisaniu

**WAŻNE:**
- Upomnienia pisemne **NIE mają** pola czas trwania (są permanentne)
- Upomnienia pisemne **NIE są widoczne** dla usera (visible_to_user = false)

#### F. Notatki prywatne (admin/dev only)
**Tabela:**
- Treść notatki
- Kto dodał
- Data

**Przycisk:** "Dodaj notatkę"

**Modal formularza:**
- Notatka (textarea)
- Przycisk "Zapisz"

---

## 🔗 DISCORD WEBHOOKS

**URL:** `https://discord.com/api/webhooks/1469077729562329198/q6y-YC61ry9qhWkVvk_ohwiNgn6Anfco-1cwTsLbsiisMbNx0gcx_2ZwAnRj9ZoyDj1P`

**Kanał:** `portal-announcement`

**Kiedy wysyłać:**
1. Nadanie PLUS/MINUS
2. Nadanie kary (zawieszenie/upomnienie)
3. Awans/degradacja badge
4. Nadanie/odebranie uprawnienia
5. Nadanie/odebranie dywizji

**Format wiadomości (przykład):**
```json
{
  "embeds": [{
    "title": "⚖️ Nadano PLUS",
    "description": "**User:** JanKowalski (@jan_discord)\n**Powód:** Za aktywność w strukturze\n**Dowód:** [Link](https://example.com)\n**Przez:** AdminNick",
    "color": 3066993,
    "timestamp": "2025-01-01T12:00:00Z"
  }]
}
```

**Kolory embeds:**
- PLUS: Zielony (3066993)
- MINUS: Czerwony (15158332)
- Kara: Pomarańczowy (16744192)
- Awans: Złoty (12745742)

---

## 🧩 AUTHCONTEXT - ROZSZERZENIE

**Plik:** `src/contexts/AuthContext.jsx`

**Dodać do state:**
```javascript
const [division, setDivision] = useState(null);
const [permissions, setPermissions] = useState([]);
const [plusCount, setPlusCount] = useState(0);
const [minusCount, setMinusCount] = useState(0);
const [activePenalties, setActivePenalties] = useState([]);
```

**Rozszerzyć `getUserById` query:**
```javascript
const { data: userData } = await supabase
  .from('users')
  .select('*, division, permissions, plus_count, minus_count')
  .eq('id', userId)
  .single();
```

**Dodać funkcję pobierania aktywnych kar:**
```javascript
const fetchActivePenalties = async (userId) => {
  const { data, error } = await supabase
    .rpc('get_active_penalties', { p_user_id: userId });

  if (!error && data) {
    setActivePenalties(data);
  }
};
```

**Polling aktywnych kar (co 30s):**
```javascript
useEffect(() => {
  if (!user?.id) return;

  fetchActivePenalties(user.id);
  const interval = setInterval(() => {
    fetchActivePenalties(user.id);
  }, 30000);

  return () => clearInterval(interval);
}, [user?.id]);
```

**Export w context:**
```javascript
return (
  <AuthContext.Provider value={{
    // ... existing
    division,
    permissions,
    plusCount,
    minusCount,
    activePenalties,
  }}>
```

---

## 📊 DASHBOARD - DODAĆ KAFELEK KARTOTEKA

**Plik:** `src/components/dashboard/Dashboard.jsx`

**Dodać do array `tiles`:**
```javascript
{
  id: 'kartoteka',
  title: 'Kartoteka',
  description: 'Zarządzaj personelem, nadawaj kary i uprawnienia. Pełny dostęp do danych wszystkich użytkowników.',
  icon: Users, // lub inny odpowiedni icon
  iconColor: 'from-[#c9a227] to-[#e6b830]', // złoty jak badge
  glowColor: 'rgba(201, 162, 39, 0.3)',
  borderHover: 'hover:border-[#c9a227]/50',
  stats: [
    { icon: Users, label: 'Zarządzanie użytkownikami' },
    { icon: Shield, label: 'Kary i uprawnienia' }
  ],
  roles: ['admin', 'dev'], // TYLKO admin i dev!
}
```

---

## 🗄️ SUPABASE HELPERS - NOWE FUNKCJE

**Plik:** `src/utils/supabaseHelpers.js`

**Dodać:**

```javascript
// Pobierz wszystkich użytkowników z division, permissions, counts
export async function getAllUsersWithDetails() {
  return await supabase
    .from('users')
    .select('*, division, permissions, plus_count, minus_count, badge')
    .order('created_at', { ascending: false });
}

// Pobierz użytkownika z pełnymi danymi
export async function getUserWithDetails(userId) {
  return await supabase
    .from('users')
    .select('*, division, permissions, plus_count, minus_count, badge')
    .eq('id', userId)
    .single();
}

// Aktualizuj badge (stopień)
export async function updateUserBadge(userId, newBadge) {
  return await supabase
    .from('users')
    .update({ badge: newBadge })
    .eq('id', userId);
}

// Aktualizuj dywizję
export async function updateUserDivision(userId, division) {
  return await supabase
    .from('users')
    .update({ division })
    .eq('id', userId);
}

// Aktualizuj uprawnienia
export async function updateUserPermissions(userId, permissions) {
  return await supabase
    .from('users')
    .update({ permissions })
    .eq('id', userId);
}

// Dodaj karę/plus/minus
export async function addPenalty(penaltyData) {
  return await supabase
    .from('user_penalties')
    .insert([penaltyData]);
}

// Pobierz historię kar użytkownika
export async function getUserPenalties(userId) {
  return await supabase
    .from('user_penalties')
    .select(`
      *,
      created_by_user:users!user_penalties_created_by_fkey(username, mta_nick)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

// Pobierz aktywne kary
export async function getActivePenalties(userId) {
  const { data, error } = await supabase
    .rpc('get_active_penalties', { p_user_id: userId });
  return { data, error };
}

// Dodaj notatkę
export async function addUserNote(noteData) {
  return await supabase
    .from('user_notes')
    .insert([noteData]);
}

// Pobierz notatki użytkownika
export async function getUserNotes(userId) {
  return await supabase
    .from('user_notes')
    .select(`
      *,
      created_by_user:users!user_notes_created_by_fkey(username, mta_nick)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}
```

---

## 🎯 ZASADY AWANSU/DEGRADACJI

**Stopnie (indeksowane 0-18):**
```javascript
const RANKS = [
  'Trainee',                    // 0
  'Deputy Sheriff I',           // 1
  'Deputy Sheriff II',          // 2
  'Deputy Sheriff III',         // 3
  'Senior Deputy Sheriff',      // 4
  'Sergeant I',                 // 5
  'Sergeant II',                // 6
  'Detective I',                // 7
  'Detective II',               // 8
  'Detective III',              // 9
  'Lieutenant',                 // 10
  'Captain I',                  // 11
  'Captain II',                 // 12
  'Captain III',                // 13
  'Area Commander',             // 14
  'Division Chief',             // 15
  'Assistant Sheriff',          // 16
  'Undersheriff',               // 17
  'Sheriff',                    // 18 (max)
];
```

**Funkcja awansu:**
```javascript
function promoteUser(currentBadge) {
  const currentIndex = RANKS.indexOf(currentBadge);
  if (currentIndex === -1) return currentBadge; // not found
  if (currentIndex === RANKS.length - 1) return currentBadge; // already max
  return RANKS[currentIndex + 1];
}
```

**Funkcja degradacji:**
```javascript
function demoteUser(currentBadge) {
  const currentIndex = RANKS.indexOf(currentBadge);
  if (currentIndex === -1) return currentBadge; // not found
  if (currentIndex === 0) return currentBadge; // already min
  return RANKS[currentIndex - 1];
}
```

**Multi-select:**
- Dla każdego zaznaczonego usera wywołaj `promoteUser(user.badge)` lub `demoteUser(user.badge)`
- Każdy user dostaje +1/-1 **względem swojego stopnia**

---

## ✅ TODO LIST

### GOTOWE:
- [x] Plik migracji SQL `003_kartoteka_system.sql`
- [x] Aktualizacja MCP config na właściwą bazę

### DO ZROBIENIA:

#### 1. BAZA DANYCH
- [ ] Uruchomić migrację `003_kartoteka_system.sql` w Supabase
- [ ] Sprawdzić czy tabele i kolumny zostały utworzone poprawnie
- [ ] (Opcjonalnie) Zmienić typ kolumny `badge` na `rank_type` po oczyszczeniu danych

#### 2. NAVBAR (`src/components/dashboard/Navbar.jsx`)
- [ ] Wyrzucić sekcję Email (linie 183-190)
- [ ] Zamienić miejscami nick z discord_name (linie 108-109)
- [ ] Dodać wyświetlanie dywizji z kolorem (zamiast roli)
- [ ] Dodać wyświetlanie uprawnień (lista badges)
- [ ] Dodać licznik +X (zielony) / -Y (czerwony)
- [ ] Dodać timer aktywnych kar (countdown w czasie rzeczywistym)
- [ ] Stylizacja - ładnie wkomponować wszystko w dropdown

#### 3. AUTHCONTEXT (`src/contexts/AuthContext.jsx`)
- [ ] Dodać state: division, permissions, plusCount, minusCount, activePenalties
- [ ] Rozszerzyć query o nowe kolumny
- [ ] Dodać funkcję `fetchActivePenalties(userId)`
- [ ] Polling aktywnych kar co 30s
- [ ] Export nowych wartości w context

#### 4. SUPABASE HELPERS (`src/utils/supabaseHelpers.js`)
- [ ] `getAllUsersWithDetails()` - lista z division, permissions, counts
- [ ] `getUserWithDetails(userId)` - jeden user z pełnymi danymi
- [ ] `updateUserBadge(userId, badge)`
- [ ] `updateUserDivision(userId, division)`
- [ ] `updateUserPermissions(userId, permissions)`
- [ ] `addPenalty(penaltyData)`
- [ ] `getUserPenalties(userId)` - historia
- [ ] `getActivePenalties(userId)` - RPC function
- [ ] `addUserNote(noteData)`
- [ ] `getUserNotes(userId)`

#### 5. KARTOTEKA - LISTA (`app/kartoteka/page.tsx`)
- [ ] Stworzenie strony z kontrolą dostępu (admin/dev only)
- [ ] Komponent `Kartoteka.jsx`
- [ ] Search bar z filtrami (nick, discord, badge, division, permissions)
- [ ] Sortowanie (badge, division, permissions, username, etc.)
- [ ] Tabela/Grid użytkowników
- [ ] Multi-select (checkbox)
- [ ] Dropdown "Akcja" (3 kropki) dla pojedynczego usera
- [ ] Przycisk "Zarządzaj" dla multi-select
- [ ] Modal awansu/degradacji badge (relatywny)
- [ ] Modal nadawania/odbierania uprawnień
- [ ] Modal nadawania/odbierania dywizji

#### 6. KARTOTEKA - PROFIL (`app/kartoteka/[userId]/page.tsx`)
- [ ] Stworzenie strony profilu
- [ ] Header (avatar, nick, badge, division, permissions) z inline editing
- [ ] Sekcja statystyk (+/- count, aktywne kary, daty)
- [ ] Sekcja aktywnych zawieszeń (z timerami)
- [ ] Sekcja historii PLUS/MINUS
- [ ] Modal "Dodaj PLUS/MINUS"
- [ ] Sekcja historii kar
- [ ] Modal "Nadaj karę" (z czasem w h/dniach)
- [ ] Sekcja notatek prywatnych
- [ ] Modal "Dodaj notatkę"

#### 7. DISCORD WEBHOOKS (`src/utils/discord.js`)
- [ ] Funkcja `notifyPenalty()` - PLUS/MINUS/kara
- [ ] Funkcja `notifyBadgeChange()` - awans/degradacja
- [ ] Funkcja `notifyPermissionChange()` - nadanie/odebranie
- [ ] Funkcja `notifyDivisionChange()` - nadanie/odebranie
- [ ] Embeds z odpowiednimi kolorami

#### 8. DASHBOARD
- [ ] Dodać kafelek "Kartoteka" (tylko admin/dev)
- [ ] Link do `/kartoteka`

#### 9. FINALIZACJA
- [ ] `npm run build` - sprawdzenie błędów
- [ ] Visual check na localhost
- [ ] Testowanie wszystkich funkcji
- [ ] Commit z opisem zmian

---

## 🚨 WAŻNE ZASADY (z CLAUDE.md)

1. **WAIT FOR TASK** - Nie generuj kodu bez zadania
2. **PLANNING** - Zacznij od `TodoWrite`
3. **LOCAL BUILD** - Po zmianach odpal `npm run build`
4. **VISUAL CHECK** - Zapytaj o wygląd na localhost przed commitem
5. **PRESERVE LOGIC** - Nie zmieniaj logiki biznesowej
6. **SHERIFF THEME** - Zakaz zmian kolorów: #020a06, #c9a227, #051a0f, #1a4d32
7. **PATTERNS** - Kopiuj style z ExamDashboard.jsx
8. **MCP ACCESS** - Sprawdzaj strukturę przez MCP Supabase
9. **PODSTRONY** - Twórz osobne strony, nie rób one-page

---

## 📞 PYTANIA ZADANE I ODPOWIEDZI

### Q1: Struktura bazy - stopnie, dywizje, uprawnienia?
**A:**
- Badge (stopień): ENUM z 17 rang, wybór z dropdown
- Division: tylko JEDNA na usera, ENUM (FTO/SS/DTU/GU)
- Permissions: WIELE na usera, array ENUM

### Q2: PLUS/MINUS - struktura?
**A:**
- Osobne wpisy w tabeli user_penalties (każdy z opisem, dowodem, datą)
- Kolumny plus_count, minus_count w users (auto-update)
- Wyświetlać sumę: +X (zielony) i -Y (czerwony)

### Q3: Kary - timer dla wszystkich?
**A:**
- Timer dla 3 typów: zawieszenie_sluzba, zawieszenie_dywizja, zawieszenie_uprawnienia
- Upomnienia pisemne: BEZ timera, NIEWIDOCZNE dla usera
- Format: "Zawieszenie: Uprawnienia Pościgowe : pozostało 23h 45m 36s"
- Może być kilka zawieszeń naraz

### Q4: Kartoteka - edycja badge/division/permissions?
**A:**
- Tak, admin/dev może zmieniać
- Search bar jak AdminPanel + sortowanie
- Dropdown "akcja" (3 kropki) + multi-select "Zarządzaj"
- Awans/degradacja RELATYWNY (+1/-1 swojego stopnia)

### Q5: Dywizje w Navbar - gdzie i jak?
**A:**
- Zamiast roli w dropdownie
- Format: "DTU | SWAT, SEU, AIR"
- Kolory: FTO żółty, SS pomarańczowy, DTU granatowy, GU zielony
- Uprawnienia: jeden kolor dla wszystkich

---

## 🔧 KONFIGURACJA PROJEKTU

**Baza danych:**
- Project ref: `jecootmlzlwxubvumxrk`
- URL: `https://jecootmlzlwxubvumxrk.supabase.co`

**Discord webhook (kartoteka):**
- URL: `https://discord.com/api/webhooks/1469077729562329198/q6y-YC61ry9qhWkVvk_ohwiNgn6Anfco-1cwTsLbsiisMbNx0gcx_2ZwAnRj9ZoyDj1P`
- Kanał: `portal-announcement`

**Pliki kluczowe:**
- Navbar: `src/components/dashboard/Navbar.jsx`
- AuthContext: `src/contexts/AuthContext.jsx`
- AdminPanel (wzór): `src/components/admin/AdminPanel.jsx`
- Materials (wzór): `src/components/materials/Materials.jsx`
- Dashboard: `src/components/dashboard/Dashboard.jsx`

---

## 🎬 NASTĘPNE KROKI

1. **NAJPIERW:** Uruchom migrację SQL w Supabase
2. **POTEM:** Modyfikuj Navbar + AuthContext
3. **NASTĘPNIE:** Stwórz kartotekę (lista + profil)
4. **NA KONIEC:** Build, test, commit

**Powodzenia! 🚀**
