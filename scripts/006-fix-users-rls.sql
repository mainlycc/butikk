-- Fix infinite recursion in users table RLS policies
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;
DROP POLICY IF EXISTS "Service role can create users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Simple policy: all authenticated users can read users table
-- This is safe because we only store non-sensitive info (email, role)
CREATE POLICY "Authenticated users can read users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert (used during invitation acceptance)
CREATE POLICY "Authenticated users can insert own record"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can only update their own last_login timestamp
CREATE POLICY "Users can update own last_login"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND 
    -- Only allow updating last_login, not role or email
    role = (SELECT role FROM users WHERE id = auth.uid()) AND
    email = (SELECT email FROM users WHERE id = auth.uid())
  );

-- Service role (for admin operations) can do anything
CREATE POLICY "Service role full access"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
