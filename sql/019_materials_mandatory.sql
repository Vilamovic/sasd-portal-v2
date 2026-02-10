-- 019: Materials - Mandatory Flag
-- Dodaje pole is_mandatory do materials i division_materials
-- Date: 2026-02-09
-- Author: Claude (Plan Mode)

-- ============================================
-- 1. MATERIALS TABLE
-- ============================================

ALTER TABLE materials
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN materials.is_mandatory IS
'Czy materiał jest obowiązkowy (zakres egzaminacyjny). TRUE = obowiązkowy, FALSE = dodatkowy/opcjonalny';

-- ============================================
-- 2. DIVISION_MATERIALS TABLE
-- ============================================

ALTER TABLE division_materials
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN division_materials.is_mandatory IS
'Czy materiał jest obowiązkowy (zakres egzaminacyjny). TRUE = obowiązkowy, FALSE = dodatkowy/opcjonalny';

-- ============================================
-- 3. EXISTING RECORDS - default to FALSE
-- ============================================

-- Wszystkie istniejące materiały domyślnie nieobowiązkowe
UPDATE materials SET is_mandatory = FALSE WHERE is_mandatory IS NULL;
UPDATE division_materials SET is_mandatory = FALSE WHERE is_mandatory IS NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check column added
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name IN ('materials', 'division_materials')
--   AND column_name = 'is_mandatory';

-- Count mandatory vs optional
-- SELECT is_mandatory, COUNT(*) as count
-- FROM materials
-- GROUP BY is_mandatory;
