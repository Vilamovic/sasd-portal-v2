-- 015: Practical Exams - Slots, Results, SWAT Commander
-- Tables: exam_slots, practical_exam_results
-- Column: users.is_swat_commander

-- 1. SWAT Commander flag (only 1 person)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_swat_commander BOOLEAN DEFAULT FALSE;

-- 1b. Add SWAT as division option (division is ENUM division_type)
ALTER TYPE division_type ADD VALUE IF NOT EXISTS 'SWAT';

-- 2. Exam slots (calendar booking)
CREATE TABLE IF NOT EXISTS exam_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('trainee','poscigowy','swat','seu')),
  slot_date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  booked_by UUID REFERENCES public.users(id),
  booked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'available' CHECK (status IN ('available','booked','completed','cancelled')),
  created_by UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Practical exam results
CREATE TABLE IF NOT EXISTS practical_exam_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id UUID REFERENCES exam_slots(id),
  exam_type TEXT NOT NULL,
  examinee_id UUID REFERENCES public.users(id) NOT NULL,
  examiner_id UUID REFERENCES public.users(id) NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  checklist JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS policies
ALTER TABLE exam_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_exam_results ENABLE ROW LEVEL SECURITY;

-- exam_slots: everyone can read, cs/hcs/dev can insert/delete, everyone can update (for booking)
DROP POLICY IF EXISTS "exam_slots_select" ON exam_slots;
CREATE POLICY "exam_slots_select" ON exam_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "exam_slots_insert" ON exam_slots;
CREATE POLICY "exam_slots_insert" ON exam_slots FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('cs','hcs','dev'))
);

DROP POLICY IF EXISTS "exam_slots_update" ON exam_slots;
CREATE POLICY "exam_slots_update" ON exam_slots FOR UPDATE USING (true);

DROP POLICY IF EXISTS "exam_slots_delete" ON exam_slots;
CREATE POLICY "exam_slots_delete" ON exam_slots FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('cs','hcs','dev'))
);

-- practical_exam_results: everyone can read, cs/hcs/dev can insert
DROP POLICY IF EXISTS "practical_results_select" ON practical_exam_results;
CREATE POLICY "practical_results_select" ON practical_exam_results FOR SELECT USING (true);

DROP POLICY IF EXISTS "practical_results_insert" ON practical_exam_results;
CREATE POLICY "practical_results_insert" ON practical_exam_results FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('cs','hcs','dev'))
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_exam_slots_date ON exam_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_exam_slots_type ON exam_slots(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_slots_status ON exam_slots(status);
CREATE INDEX IF NOT EXISTS idx_practical_results_examinee ON practical_exam_results(examinee_id);
CREATE INDEX IF NOT EXISTS idx_practical_results_type ON practical_exam_results(exam_type);
