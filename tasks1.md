📋 SASD Portal - Task List & Backlog
🛠 Zadanie 1: Refaktor Sekcji Materiałów (Materials.jsx) ✅
[X] Nowy UX Zarządzania: Przenieś przyciski "Dodaj materiał" do rozwijanego menu (dropdown) przy przycisku Edytuj.

[X] Widok Tworzenia: Po kliknięciu "Dodaj nowy materiał", ukryj listę istniejących materiałów (widok pełnoekranowy edytora), aby uniknąć bałaganu pod spodem.

[X] Nowy Edytor: Zastąp obecny prosty edytor tekstowy gotową biblioteką (np. Editor.js lub React-Quill).

[X] Obsługa Obrazów: Skonfiguruj renderer Markdown/Edytor tak, aby po wklejeniu linku do obrazu (np. z i.imgur.com) automatycznie wyświetlał grafikę na stronie zamiast samego tekstu linku.

[X] Skróty klawiszowe: Zapewnij obsługę Ctrl+Z, Ctrl+C, Ctrl+V, Ctrl+X wewnątrz edytora.

[X] Placeholder: Zastąp statyczny tekst w polach edycji czytelnymi placeholderami (szczególnie w polach tytułów i treści).

🛡 Zadanie 2: Logowanie i Profile (AuthContext.jsx, Login.jsx) ✅
[X] Rejestracja Nicku: Po pierwszym logowaniu przez Discord (jeśli użytkownik nie ma jeszcze ustawionego nicku), wyświetl modal/komunikat z polem tekstowym: "Ustaw nick z SocialProject (MTA)".

[X] Ograniczenie Logów: W discord.js wyłącz wysyłanie powiadomień o każdym logowaniu/wylogowaniu. Zostaw tylko powiadomienia o pierwszej rejestracji nowego użytkownika w bazie.

📊 Zadanie 3: System Egzaminacyjny (Exam.jsx, AdminPanel.jsx) ✅
[X] Nowy Layout Egzaminu: Po wejściu w zakładkę Egzamin, wyświetl kafelki wyboru:

Zacznij Egzamin - po wybraniu tej opcji przenosi cię do tego co mamy obecnie czyli do egzaminu

Moje Statystyki - tutaj będą zgłoszenia egazminacyjne które znajdują się w panelu administratora, user nie będzie mieć do tego dostępu (komunikat nie masz uprawnień), admin i dev tak samo jak było czyli widzą wszystko, dodaj też możliwość przeniesienia do archiwum egzaminu. zmień napis w zgłoszenie egzaminacyjne "zastępca" na "zdający", dodaj również po nim kolumnę "ID" gdzie będzie ID egzaminu (obecnie po wykonanym egzaminie wyskakuje "ID zgłoszenia", zmień ten napis na "ID Egzaminu" i jego właśnie dodaj do tej kolumny). Dodaj również pole do wyszukiwania gdzie możemy wpisać nick lub ID żeby sobie wyszukać egzamin.

(Admin/Dev) Zarządzanie pytaniami - to będzie przestrzeń do dodania nowego pytania do puli pytań egzaminacyjnych. w tym musi być wybór 1. do jakiego egzaminu chcesz dodać pytanie (wybór będzie Egzamin Trainee, Egzamin Pościgowy, Egzamin SWAT, Egzamin GU, Egzamin DTU, Egzamin SS, Egzamin z Wiedzy Ponadpodstawowej), będzie to w identycznej formie jak materiały Tzn każdy z tych Egzaminów będzie kafelkiem do wyboru. Następnie po wybraniu kafleka pojawi się: pole na wpisanie pytania oraz pod nim 4 pola tekstowe na wpisanie odpowiedzi, po zaznaczeniu kwardaciku czy tam kółka wskażemy która odpowiedź jest poprawna, po zapisaniu doda te pytanie do puli pytań. w tej sekcji musi być również możliwośc wybrou czy jest to pytanie wieloktronego wyboru czy z jedną poprawną odpowiedzią. Pamiętaj o tym żeby zawsze user miał wybór w checkboxach a nie kółeczkach żeby nie wiedział czy jest tylko 1 poprawna czy więcej. Nie może być mniej niż 1 poprawna. Pamietaj że każdy egzamin ma swoją oddzielną pulę pytań. 

(Admin/Dev) Archiwum - tutaj będą zarchiwizowane egzaminy które znajdowały się w moje statystyki i zostały tutaj przeniesione, dodaj przycisk "usuń" żeby kompletnie wyrzucić je z pamięci. Dodaj również pole do wyszukiwania gdzie możemy wpisać nick lub ID żeby sobie wyszukać egzamin

WAŻNE: pamiętaj że każda akcja typu archiwizuj, usuń czyli czynności wykonwywane przez Admina / deva musi być komunikowana w logach na istniejącym już #portal-admin, tak samo jak jest teraz z edycją czy dodaniem nowego materiału. 

🔐 Zadanie 4: Prywatność i Bezpieczeństwo ✅
[X] Maskowanie Danych: Email widoczny tylko dla dev (ukryty dla admin). Dropdown akcji z kontrolą: dev (Nadaj/Odbierz Admina, Wyrzuć), admin (Wyrzuć tylko dla user)

[X] Kolumna "Nick" przed "Użytkownik" z mta_nick

[X] Sortowanie tabeli: klik na nagłówki (Nick, Użytkownik, Data rejestracji, Ostatnia aktywność) ze strzałkami ↑↓

[X] ExamDashboard dla user: ukryto Statystyki/Zarządzanie/Archiwum, duży wyśrodkowany przycisk "Zacznij Egzamin"