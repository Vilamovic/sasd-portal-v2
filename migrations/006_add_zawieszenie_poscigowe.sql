-- Migration 006: Add 'zawieszenie_poscigowe' to penalty_type ENUM
-- Adds new suspension type for pursuit/chase suspensions

-- PostgreSQL doesn't support ALTER TYPE ... ADD VALUE in a transaction
-- This must be run directly (not in a transaction block)

ALTER TYPE penalty_type ADD VALUE 'zawieszenie_poscigowe';

-- Verification query (run manually to verify):
-- SELECT enumlabel FROM pg_enum
-- WHERE enumtypid = 'penalty_type'::regtype
-- ORDER BY enumsortorder;

-- Expected values after migration:
-- 1. plus
-- 2. minus
-- 3. zawieszenie_sluzba
-- 4. zawieszenie_dywizja
-- 5. zawieszenie_uprawnienia
-- 6. upomnienie_pisemne
-- 7. zawieszenie_poscigowe
