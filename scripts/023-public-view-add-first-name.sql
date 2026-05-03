-- Imię na publicznym listingu (/kandydaci) — kolumna z tabeli candidates
-- UWAGA: first_name MUSI być na końcu SELECT — w przeciwnym razie PostgreSQL
-- (CREATE OR REPLACE VIEW) zgłasza 42P16: „cannot change name of view column role to first_name”.
CREATE OR REPLACE VIEW public.public_candidates_normalized AS
SELECT
  c.id,
  c.slug,
  COALESCE(rc.name, c.role) AS role,
  c.seniority,
  (
    SELECT string_agg(tc.name, ', ' ORDER BY tc.name)
    FROM public.candidate_technologies ct
    JOIN public.technologies_canonical tc ON tc.id = ct.technology_id
    WHERE ct.candidate_id = c.id
  ) AS technologies,
  c.location,
  c.experience_years,
  c.summary,
  c.availability,
  c.languages,
  c.skills,
  c.first_name
FROM public.candidates c
LEFT JOIN public.roles_canonical rc ON rc.id = c.canonical_role_id
WHERE c.slug IS NOT NULL;

GRANT SELECT ON public.public_candidates_normalized TO anon;
GRANT SELECT ON public.public_candidates_normalized TO authenticated;
