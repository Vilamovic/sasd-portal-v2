🛡️ SASD Portal | Project Blueprint & AI Guidelines
⚠️ AI Operational Rules (Strict)
WAIT FOR TASK: Twoim pierwszym zadaniem po przeczytaniu briefu jest potwierdzenie gotowości i zapytanie: "Co dzisiaj robimy?". Nie generuj kodu, dopóki nie otrzymasz konkretnego zadania.

PLANNING FIRST (To-Do List): Gdy otrzymasz zadanie, wypisz listę kroków w formacie: [ ] krok 1, [ ] krok 2. W każdej kolejnej odpowiedzi odhaczaj ukończone zadania [X] i pokazuj, co zostało do zrobienia.

AUTONOMOUS DETECTIVE: Samodzielnie analizuj strukturę plików. Nie pytaj o lokalizację istniejącej logiki.

NO NEW FILES: Nie twórz nowych plików bez wyraźnej zgody. Jeśli nowa funkcja wymaga nowego pliku – musisz zapytać o pozwolenie.

SELF-UPDATING BRIEF: Jeżeli zadanie było duże lub wprowadziło nowe pliki/funkcjonalności, Twoim ostatnim krokiem jest aktualizacja tego briefu (brief_claude.md). Dopisz nowe elementy do sekcji "Project Map" lub "Key Patterns".

DRY & UTILS: Używaj istniejących narzędzi (np. generateExam z examUtils.js, supabaseHelpers.js).

STALE CLOSURES: W AuthContext i listenerach używaj useRef (np. userRef, hasNotifiedLogin).

DEPLOYMENT AWARENESS: Po zakończeniu prac przypomnij o git commit i push na GitHub, aby Vercel mógł odpalić deploy.

👤 Identity & Security
Main Developer: sancte_padre (UUID: c254fb57-72d4-450c-87b7-cd7ffad5b715).

Hierarchy: dev (Super-user) > admin > user.

Rule: Rola dev jest przypisana na sztywno do UUID w AuthContext.jsx. Jest nietykalna.

🗺️ Project Map (Module Responsibilities)
📂 src/data/ (Stałe Dane)
examQuestions.js: Baza 30 pytań do egzaminu.

materials.js: Domyślne treści szkoleniowe (Markdown).

translations.js & iconMap.js: Tłumaczenia UI i ikony Lucide.

📂 src/contexts/ (Stan Globalny)
AuthContext.jsx: Sesja, polling roli z bazy (co 5s), reload przy zmianie uprawnień. Sprawdzanie mta_nick po logowaniu (checkMtaNick), obsługa modala MTA nick (showMtaNickModal, handleMtaNickComplete). Discord notifications tylko dla rejestracji (nie login/logout). Force logout system: loginTimestampRef śledzi czas logowania, interval (co 5s) sprawdza force_logout_after w bazie i wymusza wylogowanie jeśli timestamp > loginTime. forceLogoutAll (role-based: dev może wylogować wszystkich oprócz dev, admin tylko userów).

TranslationContext.jsx: Obsługa wielojęzyczności (t()).

📂 src/components/ (UI)
exam/Exam.jsx: Router systemu egzaminacyjnego. Zarządza nawigacją między ExamDashboard, ExamTaker, ExamStatistics, ExamQuestions, ExamArchive.

exam/ExamDashboard.jsx: Główny ekran wyboru z 4 kafelkami (Zacznij Egzamin, Moje Statystyki, Zarządzanie Pytaniami, Archiwum).

exam/ExamTaker.jsx: Frontend egzaminu (wykorzystuje examUtils.js). Generuje exam_id, zapisuje do exam_results z exam_type_id. Obsługa pytań wielokrotnego wyboru (checkboxy). Timer dla każdego pytania, auto-advance przy timeout (zapisuje -1 jako "nie wybrano"). Brak przycisku "Poprzednie". Progi zdawalności: trainee/pościgowy/SWAT 50%, pozostałe 75%. Walidacja odpowiedzi: single choice (porównanie wartości) vs multiple choice (porównanie tablic).

exam/ExamStatistics.jsx: Wyświetla wyniki egzaminów (nie-zarchiwizowane). Wyszukiwanie po nicku/ID, filtrowanie po typie egzaminu, archiwizacja, szczegóły pytanie-po-pytaniu. Header szczegółów: Nick (główny tytuł), Badge (podtytuł). Kolumna "Nick" (nie "Zdający"). Obsługa pytań wielokrotnego wyboru w wynikach (zielone=poprawnie wybrano, niebieskie=poprawne nie wybrano, czerwone=błędnie wybrano). Wyświetla "Nie wybrano odpowiedzi" dla timeout (-1). Kontrola dostępu (user: brak, admin/dev: pełny).

exam/ExamQuestions.jsx: Zarządzanie pytaniami dla 7 typów egzaminów. Wybór typu → lista pytań → formularz dodawania/edycji (pytanie, 4 odpowiedzi, wielokrotny wybór checkbox). Edycja in-place (formularz pojawia się na miejscu klikniętego pytania, scroll preserved po zapisie). Discord webhooks przy add/edit/delete.

exam/ExamArchive.jsx: Zarchiwizowane egzaminy z wyszukiwaniem i przyciskiem "Usuń" (trwałe usunięcie). Discord webhooks przy delete.

admin/AdminPanel.jsx: Panel zarządzania (RPC update_user_role, Force Logout, Delete User). Wyszukiwanie użytkowników po nicku/username/badge (bez emailu). Dropdown "Akcja" nad przyciskiem. Sortowanie po username, nick, badge, role, created_at, last_seen. Przycisk "Wyrzuć" wymusza force logout (setForceLogoutForUser), czeka 2s, następnie usuwa użytkownika z bazy (deleteUser). Discord webhook przy usunięciu.

materials/Materials.jsx: WYSIWYG editor (React-Quill) dla adminów. Materiały w Supabase (tabela materials), localStorage jako cache. Dropdown "Zarządzaj" (dodawanie/usuwanie), pełnoekranowy widok edycji, auto-render obrazów.

auth/MtaNickModal.jsx: Modal do ustawienia nicku MTA. Wyświetla się jednorazowo po pierwszym logowaniu (dla użytkowników bez mta_nick). Walidacja 3-24 znaki, anti-spam (useRef).

📂 src/utils/ (Logika Biznesowa)
examUtils.js: Logika generateExam (losowanie pytań, Fisher-Yates shuffle odpowiedzi).

supabaseHelpers.js: Wszystkie CRUDy tabel users (upsertUser, getUserById, updateMtaNick, updateUserRole, deleteUser), exam_results (getAllExamResults, getAllExamResultsNonArchived, getAllExamResultsArchived, archiveExamResult, deleteExamResult, saveExamResult), exam_types (getAllExamTypes), exam_questions (getQuestionsByExamType, addExamQuestion, deleteExamQuestion), materials (getAllMaterials, upsertMaterial, deleteMaterialFromDb, seedMaterials). Force logout: setForceLogoutForUser (single user), setForceLogoutTimestamp (role-based: 'all' dla dev, 'user' dla admin).

discord.js: API Webhooków (EXAMS, ADMIN). notifyUserAuth (tylko rejestracja), notifyExamSubmission (z examType i progiem zdania), notifyAdminAction (z opcjonalnym targetUser dla akcji na użytkowniku), notifyExamQuestionAction (add/edit/delete pytań).

⚙️ Key Technical Patterns
Routing: Stan activeTab w App.jsx steruje widokami (renderowanie warunkowe). Persist via sessionStorage (activeTab, selectedMaterial).

Exam Flow: Exam.jsx ➔ examUtils.js ➔ supabaseHelpers.js ➔ discord.js.

Anti-Spam: submittingRef (useRef) w formularzach do blokady multiclick.

Data Persistence: Supabase jako Single Source of Truth. Materials używają sessionStorage dla UI state, localStorage jako cache. Tabela users zawiera kolumny: mta_nick (TEXT, nullable), force_logout_after (TIMESTAMP, nullable). localStorage przechowuje również login_timestamp_${userId} dla force logout detection.

Content Rendering: marked() konwertuje Markdown→HTML (kompatybilność wsteczna), Quill zapisuje HTML, dangerouslySetInnerHTML renderuje (auto-wyświetla obrazy).

MTA Nick Flow: Po logowaniu → checkMtaNick sprawdza getUserById → jeśli brak mta_nick → wyświetla MtaNickModal → updateMtaNick zapisuje → handleMtaNickComplete aktualizuje stan. Modal wyświetla się jednorazowo (dla nowych i istniejących użytkowników bez nicku).

Discord Notifications: Tylko powiadomienia o rejestracji nowych użytkowników (timeDiff < 60s). Login/logout wyłączone. Admin akcje (archiwizacja, usuwanie, dodawanie/edycja/usuwanie pytań) → webhooks do #portal-admin. Egzaminy: notifyExamSubmission zawiera typ egzaminu i próg zdania.

Exam System Flow: ExamDashboard (wybór) → ExamTaker (egzamin z exam_id, checkboxy dla multioption, timer per pytanie, brak "Poprzednie") → saveExamResult (exam_id, exam_type_id, is_archived=false) → notifyExamSubmission (z examType). Admin: ExamStatistics (search, archive, filter by type) → ExamArchive (search, delete). ExamQuestions: wybór typu → lista pytań → add/edit in-place/delete → notifyExamQuestionAction.

Exam Multiple Choice: Pytania z is_multiple_choice=true używają checkboxów. Odpowiedzi przechowywane jako tablice w answers[question.id]. Walidacja porównuje posortowane tablice (user vs correct). Wyświetlanie wyników: zielone (poprawnie wybrano), niebieskie (poprawne nie wybrano), czerwone (błędnie wybrano).

Exam Passing Thresholds: trainee/pościgowy/swat: 50%, pozostałe (gu/dtu/ss/advanced): 75%. Sprawdzanie po nazwie egzaminu (toLowerCase, includes). Próg wyświetlany w modalu przed egzaminem i w webhookach Discord.

Exam Timeout Handling: Gdy czas pytania (timeLimit) się kończy, automatyczne przejście do następnego pytania. Jeśli brak odpowiedzi, zapisuje -1 w answers[question.id]. W ExamStatistics wyświetla "Nie wybrano odpowiedzi (czas minął)".

Exam Database: exam_results (exam_id UUID, is_archived BOOLEAN, exam_type_id INT), exam_types (7 typów: trainee, poscigowy, swat, gu, dtu, ss, advanced), exam_questions (exam_type_id, question, options JSONB, correct_answers JSONB array, is_multiple_choice BOOLEAN, time_limit INT).

AdminPanel Security: Email maskowane (dev only), dropdown akcji (dev: Nadaj/Odbierz/Wyrzuć, admin: Wyrzuć user only), kolumna Nick (mta_nick), sortowanie (klik nagłówki), wyszukiwanie (nick/username/badge/email). ExamDashboard: user widzi tylko "Zacznij Egzamin" (duży, centered), admin/dev widzi 4 kafelki grid.

Force Logout System (Distributed): Każdy klient sprawdza co 5s kolumnę force_logout_after w users (roleCheckInterval w AuthContext). Login timestamp przechowywany w loginTimestampRef i localStorage. Jeśli force_logout_after > loginTimestampRef → alert + signOut + localStorage.clear() + reload. setForceLogoutTimestamp ustawia timestamp dla wielu użytkowników (role-based filtering), setForceLogoutForUser dla pojedynczego. Delete user flow: setForceLogoutForUser → czekaj 2s → deleteUser (trwałe usunięcie z bazy). Database: tabela users zawiera kolumnę force_logout_after (TIMESTAMP NULL).

🔧 Deployment & Troubleshooting
Problem: Vercel Force Push Detection

Symptomy:
- Portal przestaje działać po deploymencie (loading screen, brak danych)
- Użytkownicy testujący na różnych przeglądarkach raportują ten sam problem
- Vercel dashboard pokazuje starszy commit niż GitHub
- git log origin/master pokazuje nowszy commit niż deployment na Vercel

Przyczyna:
Vercel czasami NIE wykrywa force push (git push --force) automatycznie. Stary deployment pozostaje aktywny mimo że GitHub ma nowszy kod.

Rozwiązanie (Dummy Commit Trigger):
```bash
# 1. Sprawdź co jest na GitHub vs Vercel
git ls-remote origin master  # GitHub commit hash
# Porównaj z commit hash w Vercel dashboard

# 2. Jeśli różne - trigger redeploy przez dummy commit
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin master

# 3. Poczekaj 1-2 minuty na Vercel deployment
# 4. Zweryfikuj że nowy commit pojawił się na Vercel dashboard
```

Alternatywa:
- Wejdź na Vercel Dashboard → Deployments → Kliknij "Redeploy" na production deployment

Weryfikacja po fix:
1. Sprawdź commit hash na Vercel dashboard vs GitHub
2. Wymuś hard refresh (Ctrl+Shift+R) w przeglądarce
3. Przetestuj funkcjonalność która była zepsuta
4. Poproś innych użytkowników o test (różne przeglądarki)

Historia: Problem wystąpił 2025-02-02 gdy force push nie trigger'ował Vercel redeploy. Dummy commit rozwiązał problem natychmiast.

---

Problem: Infinite Loading Screen (Blocking Await in Auth Callback)

Symptomy:
- Aplikacja zawiesza się na loading screen
- setLoading(false) nigdy się nie wykonuje
- Console pokazuje błędy związane z auth state

Przyczyna:
Blocking `await` w callbacku onAuthStateChange blokuje wykonanie setLoading(false). Przykład: `await getUserById()` w linii SIGNED_IN event handler zatrzymuje cały callback.

Rozwiązanie:
Zamień blocking await na non-blocking .then() dla operacji fire-and-forget:

```javascript
// ❌ ZŁE (blocking)
if (event === 'SIGNED_IN') {
  const { data: existingUser } = await getUserById(session.user.id);
  // setLoading(false) nigdy nie zostanie wywołane jeśli await się zawiesi
}

// ✅ DOBRE (non-blocking)
if (event === 'SIGNED_IN') {
  getUserById(session.user.id).then(({ data: existingUser }) => {
    // logika...
  }).catch(() => {
    // fallback...
  });
  // callback kontynuuje, setLoading(false) zostanie wywołane
}
```

Zasada: W React auth callbacks (onAuthStateChange, useEffect) używaj await TYLKO dla operacji krytycznych. Operacje side-effect (Discord notifications, background checks) zawsze non-blocking .then().

Historia: Problem wystąpił 2026-02-02 w commit d71d149 przy implementacji Discord registration notifications. Fix w commit 693026b.