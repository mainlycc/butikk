-- Add phone column to candidate_registrations (required by public registration form)
ALTER TABLE public.candidate_registrations
ADD COLUMN IF NOT EXISTS phone TEXT;
