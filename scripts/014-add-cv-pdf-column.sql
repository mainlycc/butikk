-- Add cv_pdf_url column to candidates table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'candidates' 
        AND column_name = 'cv_pdf_url'
    ) THEN
        ALTER TABLE public.candidates 
        ADD COLUMN cv_pdf_url TEXT;
    END IF;
END $$;

