-- ============================================================
-- SASD PORTAL - Exam Questions Batch Insert (FIXED STRUCTURE)
-- 6 egzaminów: Pościgowy, SWAT, Gang Unit, Detective, Supervisory, Wiedza Ponadpodstawowa
-- ============================================================

-- ============================================
-- 2. EGZAMIN: POŚCIGOWY (HSI)
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest manewr PIT?', '["Taranowanie", "Obrócenie pojazdu uderzeniem w bok", "Blokada", "Strzał w opony"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kto wydaje polecenia podczas pościgu?', '["Primary Unit", "Dowolny oficer", "Dyspozytor", "Każdy świadek"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy można wykonać manewr Box?', '["Przy 200 km/h", "Przy małych prędkościach", "Tylko w tunelach", "Z pasażerem"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaki jest priorytet jednostki Air Support?', '["Taranowanie", "Nawigacja i obserwacja", "Desant", "Ostrzał silnika"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co oznacza termin "Paralleling"?', '["Jazda za uciekającym", "Jazda drogami równoległymi", "Jazda pod prąd", "Wyprzedzanie"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaki manewr jest najbardziej ryzykowny dla motocyklisty?', '["PIT (Zabroniony)", "Box", "Śledzenie", "Blokada pasywna"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Przy jakiej prędkości PIT jest uznawany za "Lethal Force"?', '["Powyżej 50 km/h", "Powyżej 150 km/h (100 mph)", "Zawsze", "Nigdy"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co robi jednostka Secondary Unit?', '["Jedzie do bazy", "Prowadzi komunikację radiową", "Wyprzedza", "Rozstawia kolczatki"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy przerywamy pościg?', '["Wjazd w las", "Zagrożenie dla osób trzecich", "Brak paliwa", "Nigdy"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Gdzie najlepiej rozstawić kolczatki (Spike Strips)?', '["Zakręt", "Prosty odcinek, za przeszkodą", "W tłumie", "Pod prąd"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin Pościgowy';

-- ============================================
-- 3. EGZAMIN: SWAT
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czym jest "Fatal Funnel"?', '["Granat", "Niebezpieczne wąskie przejście", "Formacja", "Snajperka"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kto wydaje rozkaz do wejścia (Breach)?', '["Najmłodszy", "Tactical Lead", "Negocjator", "Pilot"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Do czego służy "Flashbang"?', '["Zabijanie", "Oślepienie i ogłuszenie", "Oświetlenie", "Wyważanie drzwi"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaki jest cel negocjatora?', '["Poddanie bez siły", "Odwrócenie uwagi dla strzału", "Dostawa broni", "Obrażanie"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co oznacza status "Sierra"?', '["Szturm", "Snajper/Obserwator", "Medyk", "Kierowca"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaką formację przyjmuje zespół w korytarzu?', '["Koło", "Kolumna (Stack)", "Rozproszenie", "Bieg tyłem"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy SWAT używa gazu łzawiącego?', '["Każdy stop", "Zmuszenie do opuszczenia budynku", "W lesie", "Nigdy"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czym jest "Dynamic Entry"?', '["Powolne sprawdzanie", "Szybkie wejście z zaskoczenia", "Megafon", "Podkop"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co robimy po zabezpieczeniu (Clear) pomieszczenia?', '["Koniec akcji", "Komunikat \"Clear\" i ubezpieczanie", "Zdjęcie masek", "Przeszukanie szafek"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaki jest priorytet ratowania życia?', '["Podejrzany-Zakładnik", "Cywil-Oficer-Podejrzany", "Oficer-Cywil", "Wszyscy równi"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SWAT';

-- ============================================
-- 4. EGZAMIN: GANG UNIT
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co świadczy o przynależności do gangu? (MIN. 2 POPRAWNE)', '["Specyficzne tatuaże", "Barwy/Bandany", "Nowe auto", "Stacking (gesty)"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Greenlight"?', '["Handel", "Nakaz ataku/zabójstwa", "Wyjście z gangu", "Impreza"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Cele jednostki Gang Unit? (MIN. 2 POPRAWNE)', '["Hierarchia grup", "Mapowanie turfów", "Mandaty", "Rozpracowania operacyjne"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co oznacza termin "OG"?', '["Nowy", "Szanowany lider/weteran", "Emeryt", "Świadek"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jak reagować na prowokacje na terenie gangu?', '["Bójka", "Spokój i dokumentacja", "Strzał w górę", "Wyzwiska"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Turf War"?', '["Mecz", "Wojna o teren", "Wyścig", "Akcja policji"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Na co patrzysz przy przeszukaniu gangstera? (MIN. 2 POPRAWNE)', '["Nielegalna broń/narkotyki", "Notatki finansowe", "Dywan", "Symbole gangu"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jaki jest status "Gang Enforcement"?', '["Agresywne patrole", "Pomoc gangom", "Ignorowanie", "Sprzedaż broni"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Jump-in"?', '["Ucieczka", "Brutalna inicjacja", "Skok", "Atak na radio"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czy Gang Unit może używać nieoznakowanych aut?', '["Nie", "Tak, do obserwacji", "W niedziele", "Przy braku aut"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin GU';

-- ============================================
-- 5. EGZAMIN: DETECTIVE TASK UNIT
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co zawiera zabezpieczony dowód? (MIN. 2 POPRAWNE)', '["Sygnatura oficera", "Data/Godzina", "Podpis podejrzanego", "Opis miejsca"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy detektyw może przesłuchać bez Mirandy?', '["Nigdy przy zarzutach", "Zawsze", "Po alkoholu", "Brak kartki"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Rodzaje śladów kryminalistycznych? (MIN. 2 POPRAWNE)', '["Biologiczne", "Mechaniczne", "Zapachowe", "Humor podejrzanego"]'::jsonb, '[0,1,2]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Alibi"?', '["Broń", "Dowód obecności w innym miejscu", "Narkotyk", "Nick detektywa"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czym jest "Canvas" okolicy?', '["Malowanie", "Rozpytanie świadków/monitoring", "Namiot", "Mycie auta"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Search Warrant"?', '["Nakaz aresztu", "Nakaz przeszukania", "Odznaka", "Przepustka"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Legalne techniki przesłuchań? (MIN. 2 POPRAWNE)', '["Rapport building", "Blef dowodowy", "Tortury", "Strategia Reida"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co oznacza termin "Cold Case"?', '["Kradzież lodu", "Odłożone, nierozwiązane śledztwo", "Zbrodnia w zimie", "Szybka sprawa"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kto ma pierwszy wstęp na Crime Scene?', '["Media", "Koroner/Technicy", "Każdy", "Burmistrz"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Do czego służy luminol?', '["Mycie", "Wykrywanie śladów krwi", "Latarka", "Sen"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin DTU';

-- ============================================
-- 6. EGZAMIN: SUPERVISORY STAFF
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Rola Supervisora przy OIS? (MIN. 2 POPRAWNE)', '["Zabezpieczenie broni oficera", "Wsparcie dla oficera", "Kara", "Izolacja świadków"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jak dyscyplinować podwładnego?', '["Krzyk przy wszystkich", "Na osobności", "Ignorowanie", "Twitter"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy Supervisor musi być na miejscu? (MIN. 2 POPRAWNE)', '["Lethal Force", "Prośba zatrzymanego", "Mandat za prędkość", "Wypadek radiowozu"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Debriefing"?', '["Mycie aut", "Omówienie akcji po fakcie", "Pranie", "Kawa"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jak zarządzać blokadą (Stand-off)?', '["Ogień ciągły", "Kordon, negocjator, rotacja", "Chaos", "Tylko Trainee"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Chain of Command"?', '["Łańcuch", "Hierarchia służbowa", "Lista zakupów", "Nazwa SWAT"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Cechy dobrego lidera? (MIN. 2 POPRAWNE)', '["Odpowiedzialność", "Decyzyjność", "Faworyzowanie", "Komunikacja"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co robi Supervisor przy "Panic Button"?', '["Koordynuje wsparcie", "Pyta czy ważne", "Jedzie powoli", "Sprawdza sprzęt"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Jak rozwiązać konflikt wewnątrz frakcji?', '["Pojedynek", "Mediacja i regulamin", "Zwolnienie", "Ignorowanie"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czy Supervisor może zmienić decyzję Primary w pościgu?', '["Nie", "Tak, dla bezpieczeństwa", "Tylko przy wypadku", "Tylko sędzia"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin SS';

-- ============================================
-- 7. EGZAMIN: WIEDZA PONADPODSTAWOWA
-- ============================================
INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co definiuje "Probable Cause"? (MIN. 2 POPRAWNE)', '["Fakty wskazujące na zbrodnię", "Przeczucie", "Znalezienie kontrabandy", "Krew na ubraniu"]'::jsonb, '[0,2,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czym jest "Terry Frisk"?', '["Przeszukanie kieszeni", "Pobieżne sprawdzenie pod kątem broni", "Domowe", "Sport"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Wejście bez nakazu (Exigent Circumstances)? (MIN. 2 POPRAWNE)', '["Krzyki o pomoc", "Ryzyko zniszczenia dowodów", "Otwarte drzwi", "Hot Pursuit"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co to jest "Fruit of the Poisonous Tree"?', '["Narkotyk", "Dowody zdobyte nielegalnie są nieważne", "Las", "Gang"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Detention vs Arrest?', '["D to wyjaśnienie, A to zarzuty", "Brak różnic", "Tylko kajdanki", "Tylko auta"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Czym jest "Use of Force Continuum"?', '["Lista broni", "Model adekwatności siły", "Bieganie", "Strzelanie"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Dopuszczalne "Reasonable Suspicion"? (MIN. 2 POPRAWNE)', '["Rysopis po napadzie", "Ucieczka na widok policji", "Spojrzenie", "Broń w aucie"]'::jsonb, '[0,1,3]'::jsonb, true, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Co oznacza termin "Qualified Immunity"?', '["Kawa", "Ochrona przed pozwami cywilnymi", "Bezkarność", "Czerwone światło"]'::jsonb, '[1]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Larceny vs Robbery?', '["R to siła/zastraszenie", "L to tylko auta", "Synonimy", "Tylko banki"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

INSERT INTO exam_questions (exam_type_id, question, options, correct_answers, is_multiple_choice, time_limit)
SELECT id, 'Kiedy oficer musi przerwać Mirandę?', '["Żądanie adwokata", "Głód", "Płacz", "Po 5 min"]'::jsonb, '[0]'::jsonb, false, 30 FROM exam_types WHERE name = 'Egzamin z Wiedzy Ponadpodstawowej';

-- ============================================
-- PODSUMOWANIE
-- ============================================
-- Dodano pytania dla 6 egzaminów:
-- - Pościgowy (HSI): 10 pytań
-- - SWAT: 10 pytań
-- - Gang Unit: 10 pytań (3 wielokrotne)
-- - Detective Task Unit: 10 pytań (3 wielokrotne)
-- - Supervisory Staff: 10 pytań (4 wielokrotne)
-- - Wiedza Ponadpodstawowa: 10 pytań (3 wielokrotne)
-- RAZEM: 60 nowych pytań
