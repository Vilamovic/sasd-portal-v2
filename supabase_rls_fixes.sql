-- ================================================
-- FIX: exam_access_tokens RLS policies
-- Problem: Admin/Dev nie mogą tworzyć tokenów dla innych użytkowników
-- Rozwiązanie: Allow INSERT if created_by = auth.uid() AND user is admin/dev
-- ================================================

-- 1. Drop existing INSERT policy if exists
DROP POLICY IF EXISTS "exam_access_tokens_insert_policy" ON exam_access_tokens;

-- 2. Create new INSERT policy
-- Admin/Dev mogą tworzyć tokeny dla każdego użytkownika
-- Sprawdzamy role w tabeli users
CREATE POLICY "exam_access_tokens_insert_policy"
ON exam_access_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  -- Token może być stworzony przez admina/deva
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dev')
  )
);

-- 3. Update SELECT policy to show tokens created by current user OR tokens for current user
DROP POLICY IF EXISTS "exam_access_tokens_select_policy" ON exam_access_tokens;

CREATE POLICY "exam_access_tokens_select_policy"
ON exam_access_tokens
FOR SELECT
TO authenticated
USING (
  -- Admin/Dev widzą wszystkie tokeny
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dev')
  )
  OR
  -- User widzi tylko swoje tokeny
  user_id = auth.uid()
);

-- 4. Update DELETE policy - only admin/dev can delete tokens
DROP POLICY IF EXISTS "exam_access_tokens_delete_policy" ON exam_access_tokens;

CREATE POLICY "exam_access_tokens_delete_policy"
ON exam_access_tokens
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'dev')
  )
);

-- ================================================
-- VERIFICATION
-- ================================================
-- Run this to verify policies are correctly applied:
-- SELECT * FROM pg_policies WHERE tablename = 'exam_access_tokens';
