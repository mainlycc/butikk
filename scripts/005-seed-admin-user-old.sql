-- Seed first admin user
-- IMPORTANT: This creates a user entry, but you still need to sign up through Supabase Auth
-- After running this, invite yourself using the admin panel or manually insert invitation

-- Insert admin user with a placeholder UUID
-- You'll need to update this after creating the auth user
INSERT INTO users (id, email, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@example.com', 'admin', now())
ON CONFLICT (email) DO NOTHING;

-- Note: After creating your first admin through Supabase Auth,
-- update the users table with the correct auth.uid()
