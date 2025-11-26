-- Add location and candidate_email columns to candidates table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.candidates 
        ADD COLUMN location TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'candidate_email'
    ) THEN
        ALTER TABLE public.candidates 
        ADD COLUMN candidate_email TEXT;
    END IF;
END $$;


