-- Create password_resets table for password reset tokens
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token UUID UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a password reset request (unauthenticated users need this)
CREATE POLICY "Anyone can create password reset request"
  ON password_resets FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can view password reset by token (for validation)
CREATE POLICY "Anyone can view password reset by token"
  ON password_resets FOR SELECT
  USING (true);

-- Policy: System can update password reset when used
CREATE POLICY "System can update password resets"
  ON password_resets FOR UPDATE
  USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_password_resets_expires_at ON password_resets(expires_at);

-- Function to automatically expire old password reset tokens
CREATE OR REPLACE FUNCTION expire_old_password_resets()
RETURNS void AS $$
BEGIN
  UPDATE password_resets
  SET used_at = NOW()
  WHERE used_at IS NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

