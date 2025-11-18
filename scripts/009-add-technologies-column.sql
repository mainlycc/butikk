-- Add technologies column to candidates table if it doesn't exist
-- And migrate data from skills column if it exists
DO $$
BEGIN
    -- Add technologies column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'technologies'
    ) THEN
        ALTER TABLE public.candidates 
        ADD COLUMN technologies TEXT;
    END IF;
    
    -- Migrate data from skills to technologies if skills column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'skills'
    ) THEN
        UPDATE public.candidates 
        SET technologies = skills 
        WHERE technologies IS NULL OR technologies = '' 
        AND skills IS NOT NULL AND skills != '';
    END IF;
END $$;

