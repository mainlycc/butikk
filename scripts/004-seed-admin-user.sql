-- Seed admin user (UPDATE with real user ID after first Supabase Auth signup)
-- This is a placeholder - you need to replace the UUID with actual Supabase Auth user ID

-- First, you need to sign up via Supabase Auth, then get the user ID
-- and update this script or manually insert into users table

-- Example insert (replace UUID with real auth.users ID):
INSERT INTO users (id, email, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'admin', now())
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- NOTE: After running this, go to Supabase Auth dashboard, 
-- create a user, copy their UUID, and update this script
