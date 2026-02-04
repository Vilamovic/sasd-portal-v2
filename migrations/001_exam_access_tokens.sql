-- Migration: One-Time Access Tokens for Exams
-- Tworzy tabelę exam_access_tokens dla systemu jednorazowych tokenów dostępu

-- Tabela exam_access_tokens
CREATE TABLE IF NOT EXISTS exam_access_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exam_type_id INT NOT NULL REFERENCES exam_types(id) ON DELETE CASCADE,
  token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id), -- Admin/Dev który nadał token
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'), -- Token wygasa po 7 dniach

  -- Constraints
  CONSTRAINT token_not_expired CHECK (expires_at > NOW() OR used = TRUE)
);

-- Index dla szybkiego wyszukiwania
CREATE INDEX idx_exam_access_tokens_user_id ON exam_access_tokens(user_id);
CREATE INDEX idx_exam_access_tokens_token ON exam_access_tokens(token);
CREATE INDEX idx_exam_access_tokens_used ON exam_access_tokens(used);

-- RLS (Row Level Security)
ALTER TABLE exam_access_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Użytkownicy mogą widzieć tylko swoje tokeny
CREATE POLICY "Users can view their own tokens"
  ON exam_access_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Tylko admin/dev mogą tworzyć tokeny
CREATE POLICY "Admins can create tokens"
  ON exam_access_tokens
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- Policy: Tylko admin/dev mogą usuwać tokeny
CREATE POLICY "Admins can delete tokens"
  ON exam_access_tokens
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- Policy: System może aktualizować tokeny (oznaczanie jako użyte)
CREATE POLICY "System can update tokens"
  ON exam_access_tokens
  FOR UPDATE
  USING (auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'dev')
    )
  );

-- RPC Function: Verify and consume token
CREATE OR REPLACE FUNCTION verify_and_consume_exam_token(
  p_token UUID,
  p_user_id UUID,
  p_exam_type_id INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token_record exam_access_tokens;
  v_result JSONB;
BEGIN
  -- Znajdź token
  SELECT * INTO v_token_record
  FROM exam_access_tokens
  WHERE token = p_token
    AND user_id = p_user_id
    AND exam_type_id = p_exam_type_id
  FOR UPDATE; -- Lock row

  -- Sprawdź czy token istnieje
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Token not found or invalid'
    );
  END IF;

  -- Sprawdź czy token już został użyty
  IF v_token_record.used THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Token already used',
      'used_at', v_token_record.used_at
    );
  END IF;

  -- Sprawdź czy token wygasł
  IF v_token_record.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Token expired',
      'expired_at', v_token_record.expires_at
    );
  END IF;

  -- Oznacz token jako użyty
  UPDATE exam_access_tokens
  SET used = TRUE,
      used_at = NOW()
  WHERE id = v_token_record.id;

  -- Zwróć sukces
  RETURN jsonb_build_object(
    'success', true,
    'token_id', v_token_record.id
  );
END;
$$;

-- Komentarze do dokumentacji
COMMENT ON TABLE exam_access_tokens IS 'One-time access tokens for exam system';
COMMENT ON COLUMN exam_access_tokens.token IS 'Unique UUID token - valid only once';
COMMENT ON COLUMN exam_access_tokens.used IS 'Whether token has been consumed';
COMMENT ON COLUMN exam_access_tokens.expires_at IS 'Token expiration timestamp (default 7 days)';
COMMENT ON FUNCTION verify_and_consume_exam_token IS 'Verifies and consumes a one-time exam access token';
