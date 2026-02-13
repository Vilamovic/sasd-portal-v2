-- ============================================
-- 026: Performance Indexes
-- ============================================
-- Dodaje indeksy na często filtrowanych/sortowanych kolumnach
-- aby przyspieszyć zapytania przy wzroście danych.
-- Wszystkie idempotentne (IF NOT EXISTS).

-- Users
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_division ON users(division);

-- Exams
CREATE INDEX IF NOT EXISTS idx_exam_slots_status ON exam_slots(status);
CREATE INDEX IF NOT EXISTS idx_exam_slots_date ON exam_slots(slot_date);
CREATE INDEX IF NOT EXISTS idx_exam_results_archived ON exam_results(is_archived);
CREATE INDEX IF NOT EXISTS idx_practical_exam_results_type ON practical_exam_results(exam_type);

-- Reports & Submissions
CREATE INDEX IF NOT EXISTS idx_division_reports_division ON division_reports(division);
CREATE INDEX IF NOT EXISTS idx_division_reports_status ON division_reports(status);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Penalties & Notes
CREATE INDEX IF NOT EXISTS idx_user_penalties_user_type ON user_penalties(user_id, type);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);

-- MDT & Gang
CREATE INDEX IF NOT EXISTS idx_mdt_bolo_status ON mdt_bolo_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_gang_members_gang ON gang_members(gang_id);
