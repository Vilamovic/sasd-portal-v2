-- ============================================
-- MDT TABLES: Records, Criminal History, Notes, Warrants, BOLO
-- ============================================

-- 1. MDT Records (Kartoteki osób)
CREATE TABLE IF NOT EXISTS mdt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT,
  ssn TEXT,
  gender TEXT DEFAULT 'Mężczyzna',
  race TEXT DEFAULT 'Nieznana',
  height TEXT,
  weight TEXT,
  hair TEXT,
  eyes TEXT,
  address TEXT,
  phone TEXT,
  license_no TEXT,
  license_status TEXT DEFAULT 'AKTYWNY',
  wanted_status TEXT DEFAULT 'BRAK',
  gang_affiliation TEXT DEFAULT 'NIEZNANE',
  priors INTEGER DEFAULT 0,
  mugshot_url TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MDT Criminal Records (Wpisy karne)
CREATE TABLE IF NOT EXISTS mdt_criminal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES mdt_records(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  offense TEXT NOT NULL,
  code TEXT,
  status TEXT DEFAULT 'W TOKU' CHECK (status IN ('W TOKU', 'SKAZANY', 'ODDALONO', 'OCZEKUJE')),
  officer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MDT Notes (Notatki funkcjonariuszy)
CREATE TABLE IF NOT EXISTS mdt_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES mdt_records(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  officer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MDT Warrants (Nakazy)
CREATE TABLE IF NOT EXISTS mdt_warrants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES mdt_records(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('PRZESZUKANIA', 'ARESZTOWANIA', 'NO-KNOCK')),
  reason TEXT NOT NULL,
  officer TEXT,
  issued_date TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MDT BOLO Vehicles (Pojazdy BOLO)
CREATE TABLE IF NOT EXISTS mdt_bolo_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate TEXT NOT NULL,
  make TEXT,
  model TEXT,
  color TEXT,
  reason TEXT,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED')),
  reported_by TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_mdt_records_name ON mdt_records(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_mdt_criminal_records_record_id ON mdt_criminal_records(record_id);
CREATE INDEX IF NOT EXISTS idx_mdt_notes_record_id ON mdt_notes(record_id);
CREATE INDEX IF NOT EXISTS idx_mdt_warrants_record_id ON mdt_warrants(record_id);
CREATE INDEX IF NOT EXISTS idx_mdt_warrants_active ON mdt_warrants(record_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_mdt_bolo_status ON mdt_bolo_vehicles(status);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE mdt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_criminal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_warrants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mdt_bolo_vehicles ENABLE ROW LEVEL SECURITY;

-- Helper: cs/hcs/dev OR DTU member
-- mdt_records
DROP POLICY IF EXISTS "mdt_records_select" ON mdt_records;
CREATE POLICY "mdt_records_select" ON mdt_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_records_insert" ON mdt_records;
CREATE POLICY "mdt_records_insert" ON mdt_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_records_update" ON mdt_records;
CREATE POLICY "mdt_records_update" ON mdt_records FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_records_delete" ON mdt_records;
CREATE POLICY "mdt_records_delete" ON mdt_records FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

-- mdt_criminal_records
DROP POLICY IF EXISTS "mdt_criminal_records_select" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_select" ON mdt_criminal_records FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_insert" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_insert" ON mdt_criminal_records FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_update" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_update" ON mdt_criminal_records FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_criminal_records_delete" ON mdt_criminal_records;
CREATE POLICY "mdt_criminal_records_delete" ON mdt_criminal_records FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

-- mdt_notes
DROP POLICY IF EXISTS "mdt_notes_select" ON mdt_notes;
CREATE POLICY "mdt_notes_select" ON mdt_notes FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_notes_insert" ON mdt_notes;
CREATE POLICY "mdt_notes_insert" ON mdt_notes FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_notes_delete" ON mdt_notes;
CREATE POLICY "mdt_notes_delete" ON mdt_notes FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

-- mdt_warrants
DROP POLICY IF EXISTS "mdt_warrants_select" ON mdt_warrants;
CREATE POLICY "mdt_warrants_select" ON mdt_warrants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_warrants_insert" ON mdt_warrants;
CREATE POLICY "mdt_warrants_insert" ON mdt_warrants FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_warrants_update" ON mdt_warrants;
CREATE POLICY "mdt_warrants_update" ON mdt_warrants FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_warrants_delete" ON mdt_warrants;
CREATE POLICY "mdt_warrants_delete" ON mdt_warrants FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

-- mdt_bolo_vehicles
DROP POLICY IF EXISTS "mdt_bolo_select" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_select" ON mdt_bolo_vehicles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_bolo_insert" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_insert" ON mdt_bolo_vehicles FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_bolo_update" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_update" ON mdt_bolo_vehicles FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

DROP POLICY IF EXISTS "mdt_bolo_delete" ON mdt_bolo_vehicles;
CREATE POLICY "mdt_bolo_delete" ON mdt_bolo_vehicles FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND (u.role IN ('cs','hcs','dev') OR u.division::text = 'DTU')
  )
);

-- ============================================
-- SEED DATA: 3 example records
-- ============================================

-- Record 1: Carlos Vasquez
INSERT INTO mdt_records (first_name, last_name, dob, ssn, gender, race, height, weight, hair, eyes, address, phone, license_no, license_status, wanted_status, gang_affiliation, priors)
VALUES ('Carlos', 'Vasquez', '03/15/1972', 'XXX-XX-4821', 'Mężczyzna', 'Latynos', '5''11"', '187 lbs', 'Czarne', 'Brązowe', '1247 Grove St, Los Santos, SA 90012', '(555) 341-8827', 'SA-DL-4482917', 'ZAWIESZONY', 'BRAK', 'NIEZNANE', 4)
ON CONFLICT DO NOTHING;

-- Get the Carlos ID for related records
DO $$
DECLARE
  v_carlos_id UUID;
  v_maria_id UUID;
  v_james_id UUID;
BEGIN
  SELECT id INTO v_carlos_id FROM mdt_records WHERE last_name = 'Vasquez' AND first_name = 'Carlos' LIMIT 1;

  IF v_carlos_id IS NOT NULL THEN
    INSERT INTO mdt_criminal_records (record_id, date, offense, code, status, officer) VALUES
      (v_carlos_id, '11/23/1998', 'Kradzież pojazdu', 'PC 487(d)(1)', 'SKAZANY', 'Dep. Morrison'),
      (v_carlos_id, '06/14/1996', 'Napad z bronią', 'PC 245(a)(1)', 'SKAZANY', 'Dep. Tenpenny'),
      (v_carlos_id, '02/08/1995', 'Ucieczka przed policją', 'VC 2800.2', 'SKAZANY', 'Dep. Hernandez'),
      (v_carlos_id, '09/30/1993', 'Posiadanie narkotyków', 'HS 11350(a)', 'ODDALONO', 'Dep. Pulaski')
    ON CONFLICT DO NOTHING;

    INSERT INTO mdt_notes (record_id, content, officer) VALUES
      (v_carlos_id, 'Osobnik często widziany w rejonach Idlewood i East LS.', 'Dep. Morrison'),
      (v_carlos_id, 'Znany współpracownik udokumentowanych członków gangu.', 'Dep. Tenpenny'),
      (v_carlos_id, 'Posiada historię ucieczek przed organami ścigania.', 'Dep. Hernandez'),
      (v_carlos_id, 'Zachować ostrożność - historia przemocy.', 'Dep. Pulaski')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Record 2: Maria Santos
  INSERT INTO mdt_records (first_name, last_name, dob, ssn, gender, race, height, weight, hair, eyes, address, phone, license_no, license_status, wanted_status, gang_affiliation, priors)
  VALUES ('Maria', 'Santos', '07/22/1985', 'XXX-XX-7743', 'Kobieta', 'Latynoska', '5''6"', '132 lbs', 'Brązowe', 'Zielone', '842 Pershing Sq, Los Santos, SA 90015', '(555) 209-4411', 'SA-DL-6617203', 'AKTYWNY', 'BRAK', 'Vagos (podejrzenie)', 2)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_maria_id FROM mdt_records WHERE last_name = 'Santos' AND first_name = 'Maria' LIMIT 1;

  IF v_maria_id IS NOT NULL THEN
    INSERT INTO mdt_criminal_records (record_id, date, offense, code, status, officer) VALUES
      (v_maria_id, '03/12/2001', 'Handel narkotykami', 'HS 11352(a)', 'SKAZANY', 'Dep. Johnson'),
      (v_maria_id, '11/05/1999', 'Prowadzenie pod wpływem', 'VC 23152(a)', 'SKAZANY', 'Dep. Williams')
    ON CONFLICT DO NOTHING;

    INSERT INTO mdt_notes (record_id, content, officer) VALUES
      (v_maria_id, 'Podejrzana o powiązania z gangiem Vagos.', 'Dep. Johnson'),
      (v_maria_id, 'Widziana przy transakcjach w rejonie Pershing Square.', 'Dep. Williams')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Record 3: James "Big Jim" Kowalski
  INSERT INTO mdt_records (first_name, last_name, dob, ssn, gender, race, height, weight, hair, eyes, address, phone, license_no, license_status, wanted_status, gang_affiliation, priors)
  VALUES ('James', 'Kowalski', '12/03/1968', 'XXX-XX-1190', 'Mężczyzna', 'Kaukaski', '6''2"', '220 lbs', 'Siwe', 'Niebieskie', '55 Mulholland Dr, Los Santos, SA 90046', '(555) 882-0033', 'SA-DL-3301558', 'AKTYWNY', 'BRAK', 'NIEZNANE', 6)
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_james_id FROM mdt_records WHERE last_name = 'Kowalski' AND first_name = 'James' LIMIT 1;

  IF v_james_id IS NOT NULL THEN
    INSERT INTO mdt_criminal_records (record_id, date, offense, code, status, officer) VALUES
      (v_james_id, '08/19/2003', 'Rozbój', 'PC 211', 'SKAZANY', 'Dep. Garcia'),
      (v_james_id, '01/30/2001', 'Napaść', 'PC 240', 'SKAZANY', 'Dep. Davis'),
      (v_james_id, '05/15/1999', 'Posiadanie broni', 'PC 25850(a)', 'SKAZANY', 'Dep. Martinez'),
      (v_james_id, '11/22/1997', 'Kradzież z włamaniem', 'PC 459', 'SKAZANY', 'Dep. Thompson'),
      (v_james_id, '06/08/1995', 'Groźby karalne', 'PC 422', 'ODDALONO', 'Dep. White'),
      (v_james_id, '03/14/1993', 'Zakłócanie porządku', 'PC 415', 'SKAZANY', 'Dep. Brown')
    ON CONFLICT DO NOTHING;

    INSERT INTO mdt_notes (record_id, content, officer) VALUES
      (v_james_id, 'Znany jako "Big Jim". Główny podejrzany w serii napadów na sklepy.', 'Dep. Garcia'),
      (v_james_id, 'Posiada licencję na broń (cofniętą). Zachować szczególną ostrożność.', 'Dep. Martinez'),
      (v_james_id, 'Częsty bywalec baru Yellow Jack Inn w Sandy Shores.', 'Dep. Brown')
    ON CONFLICT DO NOTHING;
  END IF;

  -- BOLO Vehicles seed data
  INSERT INTO mdt_bolo_vehicles (plate, make, model, color, reason, status, reported_by) VALUES
    ('LSC 4X21', 'Vapid', 'Crown Victoria', 'Czarny', 'Pojazd użyty w napadzie na sklep przy Grove St. Świadkowie potwierdzają.', 'ACTIVE', 'Dep. Morrison'),
    ('SA 77K90', 'Declasse', 'Sabre GT', 'Czerwony', 'Podejrzany pojazd w pościgu 14/02. Kierowca uciekł.', 'ACTIVE', 'Dep. Hernandez'),
    ('5ABM 221', 'Karin', 'Sultan RS', 'Biały', 'Skradziony pojazd zgłoszony przez właściciela. VIN podrobiony.', 'ACTIVE', 'Dep. Johnson')
  ON CONFLICT DO NOTHING;
END $$;
