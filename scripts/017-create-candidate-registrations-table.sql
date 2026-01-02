-- Create candidate_registrations table
-- Stores candidate registration requests before admin approval
CREATE TABLE IF NOT EXISTS candidate_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT,
  experience INTEGER,
  linkedin_url TEXT,
  source TEXT,
  message TEXT,
  cv_file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidate_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public registration form)
CREATE POLICY "Anyone can create candidate registrations"
  ON candidate_registrations FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can view all registrations
CREATE POLICY "Admins can view candidate registrations"
  ON candidate_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Only admins can update registrations
CREATE POLICY "Admins can update candidate registrations"
  ON candidate_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_candidate_registrations_email ON candidate_registrations(email);
CREATE INDEX IF NOT EXISTS idx_candidate_registrations_status ON candidate_registrations(status);
CREATE INDEX IF NOT EXISTS idx_candidate_registrations_created_at ON candidate_registrations(created_at);

