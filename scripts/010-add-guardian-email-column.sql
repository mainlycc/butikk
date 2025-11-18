-- Add guardian_email column to candidates table if it doesn't exist
DO $$
BEGIN
    -- Add guardian_email column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'guardian_email'
    ) THEN
        ALTER TABLE public.candidates 
        ADD COLUMN guardian_email TEXT;
    END IF;
END $$;

