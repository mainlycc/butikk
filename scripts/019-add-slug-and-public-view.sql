-- ETAP 2: Dodanie kolumn slug, experience_years, summary
-- oraz utworzenie VIEW public_candidates dla stron SEO

-- 1. Nowe kolumny w tabeli candidates
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS summary TEXT;

-- 2. Indeksy dla nowych kolumn
CREATE UNIQUE INDEX IF NOT EXISTS idx_candidates_slug ON candidates(slug);
CREATE INDEX IF NOT EXISTS idx_candidates_experience_years ON candidates(experience_years);
CREATE INDEX IF NOT EXISTS idx_candidates_location ON candidates(location);
CREATE INDEX IF NOT EXISTS idx_candidates_technologies ON candidates(technologies);

-- 3. VIEW public_candidates -- tylko pola bezpieczne do wyświetlenia publicznie
CREATE OR REPLACE VIEW public_candidates AS
SELECT
  id,
  slug,
  role,
  seniority,
  technologies,
  location,
  experience_years,
  summary,
  availability,
  languages,
  skills
FROM candidates
WHERE slug IS NOT NULL;

-- 4. Przyznaj dostęp anonimowy do VIEW (potrzebny dla SSR bez sesji)
GRANT SELECT ON public_candidates TO anon;
GRANT SELECT ON public_candidates TO authenticated;
