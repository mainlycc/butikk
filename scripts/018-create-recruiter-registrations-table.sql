-- Create recruiter_registrations table
-- Stores recruiter registration requests before admin approval
CREATE TABLE IF NOT EXISTS recruiter_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  company_url TEXT,
  linkedin_url TEXT,
  source TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE recruiter_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (public registration form)
CREATE POLICY "Anyone can create recruiter registrations"
  ON recruiter_registrations FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can view all registrations
CREATE POLICY "Admins can view recruiter registrations"
  ON recruiter_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Only admins can update registrations
CREATE POLICY "Admins can update recruiter registrations"
  ON recruiter_registrations FOR UPDATE
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
CREATE INDEX IF NOT EXISTS idx_recruiter_registrations_email ON recruiter_registrations(email);
CREATE INDEX IF NOT EXISTS idx_recruiter_registrations_status ON recruiter_registrations(status);
CREATE INDEX IF NOT EXISTS idx_recruiter_registrations_created_at ON recruiter_registrations(created_at);

