-- Drop all existing problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can create users" ON users;
DROP POLICY IF EXISTS "Users can update own last_login" ON users;

-- Create simple, non-recursive policies using auth.uid()
-- Allow all authenticated users to read the users table
-- This is safe because users table only contains email and role, no sensitive data
CREATE POLICY "Authenticated users can view all users"
  ON users
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to insert their own record (when accepting invitation)
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update only their last_login timestamp
CREATE POLICY "Users can update own last_login"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM users WHERE id = auth.uid())
    AND email = (SELECT email FROM users WHERE id = auth.uid())
  );
