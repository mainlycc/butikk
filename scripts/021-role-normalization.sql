-- ETAP 4: Standaryzacja ról kandydatów
-- Cel: trzymać surowe dane z Google Sheets w candidates.role, ale zbudować kanoniczną
--      listę ról przez tabele słownikowe + kolumnę candidate.canonical_role_id.
--      Warianty pisowni ("Front-end Developer", "FE Developer", "frontend dev") → "Frontend Developer"
--
-- UWAGA: Ten skrypt jest idempotentny (IF NOT EXISTS / OR REPLACE).
--         Wymaga wcześniejszego uruchomienia pg_trgm (już z 020-technology-normalization).

-- 1) Słownik ról kanonicznych
CREATE TABLE IF NOT EXISTS public.roles_canonical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Alias → rola kanoniczna (na ręczne wyjątki i literówki)
CREATE TABLE IF NOT EXISTS public.role_aliases (
  alias text PRIMARY KEY,
  canonical_id uuid NOT NULL REFERENCES public.roles_canonical(id) ON DELETE CASCADE,
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_role_aliases_canonical_id
  ON public.role_aliases(canonical_id);

-- 3) Indeks pod fuzzy matching (pg_trgm) po nazwach kanonicznych
CREATE INDEX IF NOT EXISTS idx_roles_canonical_name_trgm
  ON public.roles_canonical
  USING gin (name gin_trgm_ops);

-- 4) Kolumna canonical_role_id w candidates (FK do roles_canonical)
ALTER TABLE public.candidates
  ADD COLUMN IF NOT EXISTS canonical_role_id uuid REFERENCES public.roles_canonical(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_canonical_role_id
  ON public.candidates(canonical_role_id);

-- 5) Normalizacja tokenu roli
--    - lower/trim
--    - usuwa fragmenty w nawiasach
--    - unifikuje separatory (/ _ \ -)
--    - usuwa "developer"/"engineer"/"programista" na końcu (do aliasowania)
--    - składa spacje
CREATE OR REPLACE FUNCTION public.normalize_role_token(raw text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  WITH s AS (
    SELECT coalesce(raw, '')::text AS v
  ),
  a AS (
    SELECT lower(trim(v)) AS v FROM s
  ),
  b AS (
    SELECT regexp_replace(v, '\([^)]*\)', '', 'g') AS v FROM a
  ),
  b2 AS (
    SELECT regexp_replace(v, '\s*\(.*$', '', 'g') AS v FROM b
  ),
  c AS (
    SELECT regexp_replace(v, '[/_\\\-]+', ' ', 'g') AS v FROM b2
  ),
  d AS (
    SELECT regexp_replace(v, '[\.\,\;\:]+$', '', 'g') AS v FROM c
  ),
  e AS (
    SELECT regexp_replace(v, '\s+', ' ', 'g') AS v FROM d
  )
  SELECT nullif(trim(v), '') FROM e;
$$;

-- 6) Kanoniczne nazwy ról
CREATE OR REPLACE FUNCTION public.pretty_role_name(norm text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN norm IS NULL OR norm = '' THEN NULL

    -- ===== FRONTEND =====
    WHEN norm ~ '^front.?end' THEN 'Frontend Developer'
    WHEN norm IN ('fe developer', 'fe dev', 'fe engineer', 'fe programista') THEN 'Frontend Developer'
    WHEN norm IN ('frontend developer', 'frontend dev', 'frontend engineer',
                  'frontend programista', 'front end developer', 'front end dev',
                  'front end engineer') THEN 'Frontend Developer'
    WHEN norm = 'ui developer' THEN 'Frontend Developer'
    WHEN norm IN ('react developer', 'react dev', 'react engineer',
                  'reactjs developer', 'react.js developer') THEN 'React Developer'
    WHEN norm IN ('angular developer', 'angular dev', 'angular engineer') THEN 'Angular Developer'
    WHEN norm IN ('vue developer', 'vue dev', 'vue.js developer',
                  'vuejs developer') THEN 'Vue.js Developer'

    -- ===== BACKEND =====
    WHEN norm ~ '^back.?end' THEN 'Backend Developer'
    WHEN norm IN ('be developer', 'be dev', 'be engineer') THEN 'Backend Developer'
    WHEN norm IN ('backend developer', 'backend dev', 'backend engineer',
                  'backend programista', 'back end developer', 'back end dev',
                  'back end engineer') THEN 'Backend Developer'
    WHEN norm IN ('server side developer', 'api developer') THEN 'Backend Developer'
    WHEN norm IN ('java developer', 'java dev', 'java engineer',
                  'java programista', 'java software engineer') THEN 'Java Developer'
    WHEN norm IN ('python developer', 'python dev', 'python engineer',
                  'python programista') THEN 'Python Developer'
    WHEN norm IN ('node developer', 'node.js developer', 'nodejs developer',
                  'node dev', 'node.js dev', 'node.js engineer') THEN 'Node.js Developer'
    WHEN norm IN ('.net developer', 'dotnet developer', '.net dev',
                  'dotnet dev', '.net engineer', 'c# developer',
                  'c# dev', 'c# engineer', 'csharp developer') THEN '.NET Developer'
    WHEN norm IN ('php developer', 'php dev', 'php engineer',
                  'php programista') THEN 'PHP Developer'
    WHEN norm IN ('ruby developer', 'ruby dev', 'ruby engineer',
                  'ruby on rails developer', 'rails developer',
                  'ror developer') THEN 'Ruby Developer'
    WHEN norm IN ('go developer', 'golang developer', 'go dev',
                  'golang dev', 'go engineer') THEN 'Go Developer'
    WHEN norm IN ('rust developer', 'rust dev', 'rust engineer') THEN 'Rust Developer'
    WHEN norm IN ('scala developer', 'scala dev', 'scala engineer') THEN 'Scala Developer'
    WHEN norm IN ('kotlin developer', 'kotlin dev', 'kotlin engineer') THEN 'Kotlin Developer'
    WHEN norm IN ('elixir developer', 'elixir dev', 'elixir engineer') THEN 'Elixir Developer'

    -- ===== FULLSTACK =====
    WHEN norm ~ '^full.?stack' THEN 'Full Stack Developer'
    WHEN norm IN ('fs developer', 'fs dev', 'fs engineer') THEN 'Full Stack Developer'
    WHEN norm IN ('full stack developer', 'fullstack developer',
                  'full stack dev', 'fullstack dev',
                  'full stack engineer', 'fullstack engineer',
                  'fullstack programista') THEN 'Full Stack Developer'

    -- ===== SOFTWARE / GENERIC =====
    WHEN norm IN ('software engineer', 'software developer', 'software dev',
                  'software programista', 'programista', 'developer', 'dev',
                  'engineer', 'inżynier oprogramowania',
                  'programista aplikacji') THEN 'Software Engineer'
    WHEN norm IN ('senior software engineer', 'senior developer',
                  'senior software developer', 'senior programista',
                  'senior dev') THEN 'Software Engineer'
    WHEN norm IN ('junior software engineer', 'junior developer',
                  'junior software developer', 'junior programista',
                  'junior dev') THEN 'Software Engineer'
    WHEN norm IN ('mid software engineer', 'mid developer',
                  'regular developer', 'regular software engineer') THEN 'Software Engineer'

    -- ===== MOBILE =====
    WHEN norm IN ('mobile developer', 'mobile dev', 'mobile engineer',
                  'mobile programista', 'mobile app developer') THEN 'Mobile Developer'
    WHEN norm IN ('ios developer', 'ios dev', 'ios engineer',
                  'swift developer', 'swift dev') THEN 'iOS Developer'
    WHEN norm IN ('android developer', 'android dev', 'android engineer',
                  'android programista') THEN 'Android Developer'
    WHEN norm IN ('react native developer', 'react native dev',
                  'react native engineer') THEN 'React Native Developer'
    WHEN norm IN ('flutter developer', 'flutter dev', 'flutter engineer') THEN 'Flutter Developer'

    -- ===== DEVOPS / SRE / INFRA =====
    WHEN norm IN ('devops engineer', 'devops', 'dev ops', 'dev ops engineer',
                  'devops developer', 'devops specialist', 'devops inżynier') THEN 'DevOps Engineer'
    WHEN norm IN ('sre', 'site reliability engineer',
                  'site reliability engineering') THEN 'Site Reliability Engineer'
    WHEN norm IN ('platform engineer', 'platform dev') THEN 'Platform Engineer'
    WHEN norm IN ('infrastructure engineer', 'infra engineer') THEN 'Infrastructure Engineer'
    WHEN norm IN ('cloud engineer', 'cloud developer', 'cloud dev') THEN 'Cloud Engineer'
    WHEN norm IN ('cloud architect', 'cloud solutions architect') THEN 'Cloud Architect'
    WHEN norm IN ('system administrator', 'sysadmin', 'sys admin',
                  'administrator systemów', 'linux administrator',
                  'linux admin', 'windows administrator') THEN 'System Administrator'
    WHEN norm IN ('network engineer', 'network administrator',
                  'network admin', 'inżynier sieci') THEN 'Network Engineer'
    WHEN norm IN ('release engineer', 'release manager',
                  'build engineer') THEN 'Release Engineer'

    -- ===== QA / TESTING =====
    WHEN norm IN ('qa engineer', 'qa', 'qa developer', 'qa dev',
                  'quality assurance', 'quality assurance engineer',
                  'qa specialist', 'qa inżynier') THEN 'QA Engineer'
    WHEN norm IN ('qa tester', 'tester', 'test engineer',
                  'software tester', 'manual tester',
                  'tester oprogramowania', 'tester manualny') THEN 'QA Tester'
    WHEN norm IN ('qa automation engineer', 'automation tester',
                  'test automation engineer', 'automation qa engineer',
                  'qa automation', 'automation engineer',
                  'tester automatyzujący', 'test automation') THEN 'QA Automation Engineer'
    WHEN norm IN ('qa lead', 'qa manager', 'test lead',
                  'test manager', 'quality lead') THEN 'QA Lead'
    WHEN norm IN ('performance tester', 'performance engineer',
                  'performance test engineer') THEN 'Performance Engineer'
    WHEN norm IN ('sdet', 'software development engineer in test') THEN 'SDET'

    -- ===== DATA =====
    WHEN norm IN ('data engineer', 'data dev', 'data developer',
                  'inżynier danych') THEN 'Data Engineer'
    WHEN norm IN ('data scientist', 'data science', 'naukowiec danych') THEN 'Data Scientist'
    WHEN norm IN ('data analyst', 'data analytics', 'analityk danych',
                  'analityk') THEN 'Data Analyst'
    WHEN norm IN ('business intelligence', 'bi developer', 'bi analyst',
                  'bi engineer', 'bi specialist') THEN 'BI Analyst'
    WHEN norm IN ('machine learning engineer', 'ml engineer', 'ml dev',
                  'ml developer', 'ai engineer', 'ai developer',
                  'ai ml engineer', 'ai ml developer') THEN 'ML Engineer'
    WHEN norm IN ('nlp engineer', 'nlp developer', 'nlp specialist') THEN 'NLP Engineer'
    WHEN norm IN ('data architect', 'data platform engineer') THEN 'Data Architect'
    WHEN norm IN ('etl developer', 'etl engineer') THEN 'ETL Developer'
    WHEN norm IN ('database administrator', 'dba', 'db admin',
                  'database engineer', 'administrator baz danych') THEN 'Database Administrator'
    WHEN norm IN ('big data engineer', 'big data developer') THEN 'Big Data Engineer'

    -- ===== SECURITY =====
    WHEN norm IN ('security engineer', 'cybersecurity engineer',
                  'information security engineer', 'infosec engineer',
                  'security specialist', 'inżynier bezpieczeństwa') THEN 'Security Engineer'
    WHEN norm IN ('security analyst', 'cybersecurity analyst',
                  'soc analyst') THEN 'Security Analyst'
    WHEN norm IN ('penetration tester', 'pentester', 'pen tester',
                  'ethical hacker') THEN 'Penetration Tester'
    WHEN norm IN ('security architect') THEN 'Security Architect'

    -- ===== ARCHITEKTURA =====
    WHEN norm IN ('software architect', 'application architect',
                  'architekt oprogramowania', 'architekt') THEN 'Software Architect'
    WHEN norm IN ('solution architect', 'solutions architect',
                  'architekt rozwiązań') THEN 'Solution Architect'
    WHEN norm IN ('enterprise architect') THEN 'Enterprise Architect'
    WHEN norm IN ('system architect', 'systems architect') THEN 'System Architect'
    WHEN norm IN ('technical architect') THEN 'Technical Architect'

    -- ===== LEADERSHIP / MANAGEMENT =====
    WHEN norm IN ('tech lead', 'technical lead', 'team lead',
                  'team leader', 'lead developer', 'lead dev',
                  'lead engineer', 'lider techniczny') THEN 'Tech Lead'
    WHEN norm IN ('engineering manager', 'em', 'development manager',
                  'kierownik zespołu', 'kierownik developerski') THEN 'Engineering Manager'
    WHEN norm IN ('vp of engineering', 'vp engineering',
                  'vice president of engineering') THEN 'VP of Engineering'
    WHEN norm IN ('cto', 'chief technology officer',
                  'chief technical officer') THEN 'CTO'
    WHEN norm IN ('head of engineering', 'head of development',
                  'director of engineering') THEN 'Head of Engineering'
    WHEN norm IN ('principal engineer', 'staff engineer',
                  'distinguished engineer') THEN 'Principal Engineer'

    -- ===== PRODUCT / PM =====
    WHEN norm IN ('product manager', 'pm', 'product mgr') THEN 'Product Manager'
    WHEN norm IN ('product owner', 'po') THEN 'Product Owner'
    WHEN norm IN ('project manager', 'project mgr',
                  'kierownik projektu') THEN 'Project Manager'
    WHEN norm IN ('program manager', 'programme manager') THEN 'Program Manager'
    WHEN norm IN ('delivery manager') THEN 'Delivery Manager'
    WHEN norm IN ('technical project manager', 'technical pm') THEN 'Technical Project Manager'

    -- ===== AGILE =====
    WHEN norm IN ('scrum master', 'scrum master certified',
                  'csm', 'certified scrum master') THEN 'Scrum Master'
    WHEN norm IN ('agile coach', 'agile master') THEN 'Agile Coach'

    -- ===== UX / UI / DESIGN =====
    WHEN norm IN ('ux designer', 'user experience designer',
                  'ux design', 'projektant ux') THEN 'UX Designer'
    WHEN norm IN ('ui designer', 'user interface designer',
                  'ui design', 'projektant ui') THEN 'UI Designer'
    WHEN norm IN ('ux ui designer', 'ui ux designer', 'ux&ui designer',
                  'ux ui design', 'ui ux design',
                  'ux ui', 'ui ux', 'designer', 'web designer') THEN 'UX/UI Designer'
    WHEN norm IN ('product designer', 'digital product designer') THEN 'Product Designer'
    WHEN norm IN ('graphic designer', 'grafik', 'grafik komputerowy') THEN 'Graphic Designer'
    WHEN norm IN ('interaction designer') THEN 'Interaction Designer'
    WHEN norm IN ('design lead', 'ux lead', 'head of design') THEN 'Design Lead'

    -- ===== EMBEDDED / HARDWARE =====
    WHEN norm IN ('embedded developer', 'embedded dev', 'embedded engineer',
                  'embedded software engineer', 'embedded software developer',
                  'embedded programista', 'programista embedded') THEN 'Embedded Developer'
    WHEN norm IN ('firmware engineer', 'firmware developer') THEN 'Firmware Engineer'
    WHEN norm IN ('hardware engineer', 'hw engineer') THEN 'Hardware Engineer'
    WHEN norm IN ('fpga engineer', 'fpga developer') THEN 'FPGA Engineer'
    WHEN norm IN ('iot developer', 'iot engineer') THEN 'IoT Engineer'

    -- ===== GAME DEV =====
    WHEN norm IN ('game developer', 'game dev', 'game programmer',
                  'game engineer', 'unity developer', 'unreal developer') THEN 'Game Developer'

    -- ===== BUSINESS / OTHER =====
    WHEN norm IN ('business analyst', 'ba', 'analityk biznesowy') THEN 'Business Analyst'
    WHEN norm IN ('systems analyst', 'system analyst', 'analityk systemowy') THEN 'Systems Analyst'
    WHEN norm IN ('technical writer', 'tech writer',
                  'documentation engineer') THEN 'Technical Writer'
    WHEN norm IN ('consultant', 'it consultant', 'technology consultant',
                  'konsultant', 'konsultant it') THEN 'IT Consultant'
    WHEN norm IN ('support engineer', 'technical support',
                  'it support', 'help desk') THEN 'Support Engineer'
    WHEN norm IN ('erp consultant', 'sap consultant', 'sap developer',
                  'sap engineer') THEN 'SAP Consultant'
    WHEN norm IN ('salesforce developer', 'salesforce consultant',
                  'salesforce engineer') THEN 'Salesforce Developer'
    WHEN norm IN ('crm developer', 'crm consultant') THEN 'CRM Developer'
    WHEN norm IN ('sharepoint developer', 'sharepoint consultant') THEN 'SharePoint Developer'

    -- ===== BLOCKCHAIN / WEB3 =====
    WHEN norm IN ('blockchain developer', 'blockchain engineer',
                  'web3 developer', 'smart contract developer',
                  'solidity developer') THEN 'Blockchain Developer'

    -- ===== LOW CODE / NO CODE =====
    WHEN norm IN ('low code developer', 'no code developer',
                  'citizen developer', 'power platform developer',
                  'mendix developer', 'outsystems developer') THEN 'Low-Code Developer'

    -- ===== RPA =====
    WHEN norm IN ('rpa developer', 'rpa engineer',
                  'uipath developer', 'automation developer') THEN 'RPA Developer'

    -- ===== CATCHALL =====
    ELSE initcap(norm)
  END;
$$;

-- 7) Slug dla roli (pod URL/SEO)
CREATE OR REPLACE FUNCTION public.role_slug(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN name IS NULL OR trim(name) = '' THEN NULL
    WHEN name = '.NET Developer' THEN 'dotnet-developer'
    WHEN name = 'C# Developer' THEN 'csharp-developer'
    WHEN name = 'Node.js Developer' THEN 'nodejs-developer'
    WHEN name = 'Vue.js Developer' THEN 'vuejs-developer'
    WHEN name = 'UX/UI Designer' THEN 'ux-ui-designer'
    WHEN name = 'AI/ML Engineer' THEN 'ai-ml-engineer'
    WHEN name = 'iOS Developer' THEN 'ios-developer'
    WHEN name = 'IoT Engineer' THEN 'iot-engineer'
    WHEN name = 'VP of Engineering' THEN 'vp-of-engineering'
    ELSE
      trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
  END;
$$;

-- 8) Rozwiązanie tokenu do canonical_id (alias → canonical, w razie braku tworzy canonical)
CREATE OR REPLACE FUNCTION public.resolve_canonical_role(raw text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  norm text;
  canon_id uuid;
  canon_note text;
  canon_name text;
  canon_slug text;
  slug_base text;
  best_id uuid;
  best_sim real;
BEGIN
  norm := public.normalize_role_token(raw);
  IF norm IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT canonical_id, note INTO canon_id, canon_note
  FROM public.role_aliases
  WHERE alias = norm;

  IF canon_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.roles_canonical rc WHERE rc.id = canon_id) THEN
      IF canon_note IS DISTINCT FROM 'auto' THEN
        RETURN canon_id;
      END IF;
    ELSE
      canon_id := NULL;
    END IF;
  END IF;

  canon_name := public.pretty_role_name(norm);
  slug_base := public.role_slug(canon_name);
  canon_slug := slug_base;

  -- Fuzzy matching: próbuj dopasować do istniejących kanonów
  IF (canon_note IS NULL OR canon_note LIKE 'auto%') AND length(norm) >= 6 THEN
    SELECT rc.id,
           similarity(public.normalize_role_token(rc.name), norm) AS sim
      INTO best_id, best_sim
    FROM public.roles_canonical rc
    ORDER BY sim DESC
    LIMIT 1;

    IF best_id IS NOT NULL AND best_sim >= 0.80 THEN
      INSERT INTO public.role_aliases (alias, canonical_id, note)
      VALUES (norm, best_id, 'auto_fuzzy')
      ON CONFLICT (alias) DO UPDATE
        SET canonical_id = excluded.canonical_id,
            note = excluded.note
        WHERE public.role_aliases.note LIKE 'auto%';
      RETURN best_id;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.roles_canonical rc
    WHERE rc.slug = canon_slug AND rc.name <> canon_name
  ) THEN
    canon_slug := canon_slug || '-' || substring(md5(canon_name) for 6);
  END IF;

  SELECT id INTO canon_id
  FROM public.roles_canonical
  WHERE name = canon_name;

  IF canon_id IS NULL THEN
    INSERT INTO public.roles_canonical (name, slug)
    VALUES (canon_name, canon_slug)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO canon_id;

    IF canon_id IS NULL THEN
      SELECT id INTO canon_id
      FROM public.roles_canonical
      WHERE name = canon_name;
    END IF;
  END IF;

  INSERT INTO public.role_aliases (alias, canonical_id, note)
  VALUES (norm, canon_id, 'auto')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id
    WHERE public.role_aliases.note LIKE 'auto%';

  RETURN canon_id;
END;
$$;

-- 9) Ustawienie canonical_role_id dla jednego kandydata
CREATE OR REPLACE FUNCTION public.rebuild_candidate_role_for_candidate(p_candidate_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  raw_role text;
  resolved_id uuid;
BEGIN
  SELECT role INTO raw_role
  FROM public.candidates
  WHERE id = p_candidate_id;

  IF raw_role IS NULL OR trim(raw_role) = '' THEN
    UPDATE public.candidates SET canonical_role_id = NULL WHERE id = p_candidate_id;
    RETURN;
  END IF;

  resolved_id := public.resolve_canonical_role(raw_role);

  UPDATE public.candidates
  SET canonical_role_id = resolved_id
  WHERE id = p_candidate_id;
END;
$$;

-- 10) Przebudowa ról dla całej bazy
CREATE OR REPLACE FUNCTION public.rebuild_candidate_roles()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT id FROM public.candidates LOOP
    PERFORM public.rebuild_candidate_role_for_candidate(r.id);
  END LOOP;
END;
$$;

-- 11) Zaktualizuj VIEW public_candidates_normalized — dodaj znormalizowaną rolę
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
  c.skills
FROM public.candidates c
LEFT JOIN public.roles_canonical rc ON rc.id = c.canonical_role_id
WHERE c.slug IS NOT NULL;

GRANT SELECT ON public.public_candidates_normalized TO anon;
GRANT SELECT ON public.public_candidates_normalized TO authenticated;

-- 12) Trigger: automatyczna przebudowa canonical_role_id po zmianie role
CREATE OR REPLACE FUNCTION public.trg_candidates_rebuild_candidate_role()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF coalesce(NEW.role, '') = coalesce(OLD.role, '') THEN
      RETURN NEW;
    END IF;
  END IF;

  PERFORM public.rebuild_candidate_role_for_candidate(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS candidates_rebuild_candidate_role ON public.candidates;
CREATE TRIGGER candidates_rebuild_candidate_role
AFTER INSERT OR UPDATE OF role ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.trg_candidates_rebuild_candidate_role();

-- 13) Seed aliasów (ręczne wyjątki / warianty pisowni)
DO $$
DECLARE
  id_frontend uuid;
  id_backend uuid;
  id_fullstack uuid;
  id_devops uuid;
  id_qa uuid;
  id_qa_auto uuid;
  id_mobile uuid;
  id_data_eng uuid;
  id_ml uuid;
  id_ux_ui uuid;
  id_sw_eng uuid;
  id_tech_lead uuid;
  id_scrum uuid;
  id_security uuid;
  id_embedded uuid;
BEGIN
  id_frontend := public.resolve_canonical_role('Frontend Developer');
  id_backend := public.resolve_canonical_role('Backend Developer');
  id_fullstack := public.resolve_canonical_role('Full Stack Developer');
  id_devops := public.resolve_canonical_role('DevOps Engineer');
  id_qa := public.resolve_canonical_role('QA Engineer');
  id_qa_auto := public.resolve_canonical_role('QA Automation Engineer');
  id_mobile := public.resolve_canonical_role('Mobile Developer');
  id_data_eng := public.resolve_canonical_role('Data Engineer');
  id_ml := public.resolve_canonical_role('ML Engineer');
  id_ux_ui := public.resolve_canonical_role('UX/UI Designer');
  id_sw_eng := public.resolve_canonical_role('Software Engineer');
  id_tech_lead := public.resolve_canonical_role('Tech Lead');
  id_scrum := public.resolve_canonical_role('Scrum Master');
  id_security := public.resolve_canonical_role('Security Engineer');
  id_embedded := public.resolve_canonical_role('Embedded Developer');

  INSERT INTO public.role_aliases(alias, canonical_id, note) VALUES
    -- Frontend warianty
    (public.normalize_role_token('Front-End Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Front End Dev'), id_frontend, 'manual'),
    (public.normalize_role_token('FE Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('UI Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Web Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Frontend Programista'), id_frontend, 'manual'),

    -- Backend warianty
    (public.normalize_role_token('Back-End Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Back End Dev'), id_backend, 'manual'),
    (public.normalize_role_token('BE Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Server Side Developer'), id_backend, 'manual'),
    (public.normalize_role_token('API Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Backend Programista'), id_backend, 'manual'),

    -- Fullstack warianty
    (public.normalize_role_token('Full-Stack Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Fullstack Dev'), id_fullstack, 'manual'),
    (public.normalize_role_token('FS Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Fullstack Programista'), id_fullstack, 'manual'),

    -- DevOps warianty
    (public.normalize_role_token('Dev Ops Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('DevOps Specialist'), id_devops, 'manual'),
    (public.normalize_role_token('DevOps Inżynier'), id_devops, 'manual'),

    -- QA warianty
    (public.normalize_role_token('Quality Assurance Engineer'), id_qa, 'manual'),
    (public.normalize_role_token('QA Specialist'), id_qa, 'manual'),
    (public.normalize_role_token('Quality Assurance'), id_qa, 'manual'),

    -- QA Automation warianty
    (public.normalize_role_token('Automation Tester'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Test Automation Engineer'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Tester Automatyzujący'), id_qa_auto, 'manual'),

    -- Mobile warianty
    (public.normalize_role_token('Mobile App Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Mobile Programista'), id_mobile, 'manual'),

    -- Data Engineer warianty
    (public.normalize_role_token('Inżynier Danych'), id_data_eng, 'manual'),
    (public.normalize_role_token('Data Dev'), id_data_eng, 'manual'),

    -- ML warianty
    (public.normalize_role_token('Machine Learning Engineer'), id_ml, 'manual'),
    (public.normalize_role_token('AI Engineer'), id_ml, 'manual'),
    (public.normalize_role_token('AI Developer'), id_ml, 'manual'),
    (public.normalize_role_token('AI/ML Engineer'), id_ml, 'manual'),

    -- UX/UI warianty
    (public.normalize_role_token('UX&UI Designer'), id_ux_ui, 'manual'),
    (public.normalize_role_token('UI/UX Designer'), id_ux_ui, 'manual'),
    (public.normalize_role_token('Web Designer'), id_ux_ui, 'manual'),

    -- Software Engineer warianty
    (public.normalize_role_token('Programista'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Developer'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Inżynier Oprogramowania'), id_sw_eng, 'manual'),

    -- Tech Lead warianty
    (public.normalize_role_token('Technical Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Team Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Lead Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Lider Techniczny'), id_tech_lead, 'manual'),

    -- Scrum Master warianty
    (public.normalize_role_token('Certified Scrum Master'), id_scrum, 'manual'),
    (public.normalize_role_token('CSM'), id_scrum, 'manual'),

    -- Security warianty
    (public.normalize_role_token('Cybersecurity Engineer'), id_security, 'manual'),
    (public.normalize_role_token('InfoSec Engineer'), id_security, 'manual'),
    (public.normalize_role_token('Inżynier Bezpieczeństwa'), id_security, 'manual'),

    -- Embedded warianty
    (public.normalize_role_token('Embedded Software Engineer'), id_embedded, 'manual'),
    (public.normalize_role_token('Programista Embedded'), id_embedded, 'manual')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id,
        note = excluded.note
    WHERE public.role_aliases.note LIKE 'auto%'
       OR public.role_aliases.note = 'manual';
END $$;
