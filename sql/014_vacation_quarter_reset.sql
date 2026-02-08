-- 014: Add vacation_quarter_reset column for lazy quarterly reset
-- VacationForm uses this to detect quarter change and reset vacation_days_used

ALTER TABLE users ADD COLUMN IF NOT EXISTS vacation_quarter_reset TEXT;
