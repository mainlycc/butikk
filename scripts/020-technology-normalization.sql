-- ETAP 3: Standaryzacja technologii kandydatów
-- Cel: trzymać surowe CSV w candidates.technologies, ale budować kanoniczną listę technologii
--      przez tabele słownikowe + relację candidate_technologies.
--      Wersje (liczby) są usuwane (np. ".NET 6" -> ".NET").
--
-- UWAGA: Ten skrypt jest idempotentny (IF NOT EXISTS / OR REPLACE).

-- Wspiera fuzzy matching literówek (np. "agular" -> "angular")
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1) Słownik technologii kanonicznych
CREATE TABLE IF NOT EXISTS public.technologies_canonical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Alias -> technologia kanoniczna (na ręczne wyjątki i literówki)
-- Alias przechowujemy w formie *znormalizowanej* (wynik normalize_tech_token).
CREATE TABLE IF NOT EXISTS public.technology_aliases (
  alias text PRIMARY KEY,
  canonical_id uuid NOT NULL REFERENCES public.technologies_canonical(id) ON DELETE CASCADE,
  note text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Jeśli tabela istniała wcześniej z inną strukturą, doprowadź ją do oczekiwanego kształtu.
DO $$
DECLARE
  c record;
BEGIN
  -- Usuń stare constrainty FK z poprzednich wersji schematu (często wskazują na public.technologies).
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid = 'public.technology_aliases'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.technology_aliases DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;

  -- przypadek: ktoś miał kolumnę technology_id zamiast canonical_id
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'technology_aliases'
      AND column_name = 'technology_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'technology_aliases'
      AND column_name = 'canonical_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.technology_aliases RENAME COLUMN technology_id TO canonical_id';
  END IF;

  -- upewnij się, że canonical_id istnieje
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'technology_aliases'
      AND column_name = 'canonical_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.technology_aliases ADD COLUMN canonical_id uuid';
  END IF;

  -- upewnij się, że note/created_at istnieją
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'technology_aliases'
      AND column_name = 'note'
  ) THEN
    EXECUTE 'ALTER TABLE public.technology_aliases ADD COLUMN note text';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'technology_aliases'
      AND column_name = 'created_at'
  ) THEN
    EXECUTE 'ALTER TABLE public.technology_aliases ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()';
  END IF;

  -- Dodaj poprawny FK do technologies_canonical. Używamy NOT VALID, żeby nie wywalić skryptu,
  -- jeśli istnieją stare rekordy aliasów, które nie pasują do nowego słownika.
  BEGIN
    EXECUTE 'ALTER TABLE public.technology_aliases
             ADD CONSTRAINT technology_aliases_canonical_id_fkey
             FOREIGN KEY (canonical_id) REFERENCES public.technologies_canonical(id) ON DELETE CASCADE NOT VALID';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  -- Wyczyść historyczne aliasy, które wskazują na nieistniejące canonical_id
  -- (to jest najczęstsza przyczyna błędu 23503 przy rebuild, gdy FK jest NOT VALID).
  DELETE FROM public.technology_aliases ta
  WHERE ta.canonical_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.technologies_canonical tc WHERE tc.id = ta.canonical_id
    );

  -- jeśli canonical_id jest NULL w istniejących wierszach, ustaw bezpieczną wartość dopiero po pierwszym rebuildzie
  -- (tu nic nie robimy; rebuild/seed wypełni canonical_id dla nowych aliasów).
END $$;

-- 3) Relacja kandydat <-> technologia kanoniczna
CREATE TABLE IF NOT EXISTS public.candidate_technologies (
  candidate_id uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  technology_id uuid NOT NULL REFERENCES public.technologies_canonical(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (candidate_id, technology_id)
);

-- Jeśli tabela istniała wcześniej z FK do innej tabeli (np. public.technologies), wyczyść i załóż poprawny FK.
DO $$
DECLARE
  c record;
BEGIN
  -- usuń WSZYSTKIE FK z poprzednich wersji (mogą mieć różne nazwy)
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE contype = 'f'
      AND conrelid = 'public.candidate_technologies'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.candidate_technologies DROP CONSTRAINT IF EXISTS %I', c.conname);
  END LOOP;

  -- Candidate FK (bezpiecznie; zwykle już jest poprawny)
  BEGIN
    EXECUTE 'ALTER TABLE public.candidate_technologies
             ADD CONSTRAINT candidate_technologies_candidate_id_fkey
             FOREIGN KEY (candidate_id) REFERENCES public.candidates(id) ON DELETE CASCADE NOT VALID';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  -- Technology FK -> technologies_canonical
  BEGIN
    EXECUTE 'ALTER TABLE public.candidate_technologies
             ADD CONSTRAINT candidate_technologies_technology_id_fkey
             FOREIGN KEY (technology_id) REFERENCES public.technologies_canonical(id) ON DELETE CASCADE NOT VALID';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

CREATE INDEX IF NOT EXISTS idx_candidate_technologies_technology_id
  ON public.candidate_technologies(technology_id);

-- 3b) Indeksy wspierające mapowanie aliasów
CREATE INDEX IF NOT EXISTS idx_technology_aliases_canonical_id
  ON public.technology_aliases(canonical_id);

-- 3c) Indeks pod fuzzy matching (pg_trgm) po nazwach kanonicznych
CREATE INDEX IF NOT EXISTS idx_technologies_canonical_name_trgm
  ON public.technologies_canonical
  USING gin (name gin_trgm_ops);

-- 4) Normalizacja tokenu technologii
--    - lower/trim
--    - usuwa fragmenty w nawiasach: "(c)", "(...)" (np. ".net(c)")
--    - unifikuje separatory
--    - usuwa wersje/liczby (strip_versions)
--    - składa spacje
CREATE OR REPLACE FUNCTION public.normalize_tech_token(raw text)
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
    -- wytnij wszystko w nawiasach okrągłych (zostawiając resztę)
    SELECT regexp_replace(v, '\([^)]*\)', '', 'g') AS v FROM a
  ),
  b2 AS (
    -- jeśli nawias jest niedomknięty, utnij końcówkę od "(" do końca
    SELECT regexp_replace(v, '\s*\(.*$', '', 'g') AS v FROM b
  ),
  c AS (
    -- separatorów używanych „losowo” -> spacje
    SELECT regexp_replace(v, '[/_\\\-]+', ' ', 'g') AS v FROM b2
  ),
  d AS (
    -- usuń znaki, które często doklejają się do końca tokenu
    SELECT regexp_replace(v, '[\.\,\;\:\/\(\)\[\]\{\}]+$', '', 'g') AS v FROM c
  ),
  d2 AS (
    -- usuń częste „wypełniacze” które tworzą sztuczne unikalne tagi
    SELECT regexp_replace(v, '\b(including|incl|w\\/|with|or|and|etc)\\b', '', 'g') AS v FROM d
  ),
  e AS (
    -- usuń wersje/liczby (np. "java 17", ".net 6", "spring boot 3")
    -- usuwa także ".0" itp.
    SELECT regexp_replace(v, '\b\d+(\.\d+)*\b', '', 'g') AS v FROM d2
  ),
  f AS (
    -- usuń plusy jako „wersje” typu "2+"
    SELECT regexp_replace(v, '\b\d+\s*\+\b', '', 'g') AS v FROM e
  ),
  g AS (
    -- zredukuj wielokrotne spacje
    SELECT regexp_replace(v, '\s+', ' ', 'g') AS v FROM f
  ),
  h AS (
    -- odrzuć „technologie” będące samą liczbą / fragmentem wersji (np. 11, 17, 2, 3.x, 1.0)
    -- Zostaw np. 802.11 (≥3 cyfry przed kropką i ≥2 po — identyfikatory typu Wi‑Fi).
    SELECT CASE
      WHEN trim(v) = '' THEN NULL::text
      WHEN trim(v) ~ '^\d+$' THEN NULL::text
      WHEN trim(v) ~ '^\d+\.x$' THEN NULL::text
      WHEN trim(v) ~ '^\d+\.\d+$' AND trim(v) !~ '^\d{3,}\.\d{2,}$' THEN NULL::text
      WHEN trim(v) ~ '^[.\-+_]+$' THEN NULL::text
      ELSE trim(v)
    END AS v
    FROM g
  )
  SELECT nullif(trim(v), '') FROM h;
$$;

-- 5) „Ładna” nazwa technologii na podstawie tokenu znormalizowanego
CREATE OR REPLACE FUNCTION public.pretty_tech_name(norm text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN norm IS NULL OR norm = '' THEN NULL

    -- ===== JĘZYKI PROGRAMOWANIA =====
    WHEN norm IN ('c#', 'c sharp', 'csharp', 'c# .net') THEN 'C#'
    WHEN norm IN ('c++', 'cpp', 'c c++', 'boost c++') THEN 'C++'
    WHEN norm IN ('js', 'javascript', 'ecmascript', 'es', 'es6', 'es6+', 'vanilla javascript', 'vanillajs') THEN 'JavaScript'
    WHEN norm IN ('ts', 'typescript') THEN 'TypeScript'
    WHEN norm = 'java' THEN 'Java'
    WHEN norm = 'python' THEN 'Python'
    WHEN norm = 'kotlin' THEN 'Kotlin'
    WHEN norm = 'php' THEN 'PHP'
    WHEN norm = 'ruby' THEN 'Ruby'
    WHEN norm = 'dart' THEN 'Dart'
    WHEN norm = 'rust' THEN 'Rust'
    WHEN norm IN ('go', 'golang') THEN 'Go'
    WHEN norm = 'swift' THEN 'Swift'
    WHEN norm = 'scala' THEN 'Scala'
    WHEN norm = 'elixir' THEN 'Elixir'
    WHEN norm = 'clojure' THEN 'Clojure'
    WHEN norm = 'groovy' THEN 'Groovy'
    WHEN norm = 'haskell' THEN 'Haskell'
    WHEN norm = 'perl' THEN 'Perl'
    WHEN norm = 'lua' THEN 'Lua'
    WHEN norm = 'cobol' THEN 'COBOL'
    WHEN norm = 'fortran' THEN 'Fortran'
    WHEN norm = 'erlang' THEN 'Erlang'
    WHEN norm IN ('r', 'r markdown') THEN 'R'
    WHEN norm IN ('objective c', 'obj c', 'objc') THEN 'Objective-C'
    WHEN norm = 'actionscript' THEN 'ActionScript'
    WHEN norm IN ('vb', 'visual basic') THEN 'Visual Basic'
    WHEN norm IN ('vb.net', 'vb net', 'visual basic.net', 'visual basic net') THEN 'VB.NET'
    WHEN norm IN ('vba', 'vba excel') THEN 'VBA'
    WHEN norm IN ('ansi c', 'embedded c') THEN 'C'
    WHEN norm = 'capl' THEN 'CAPL'
    WHEN norm = 'rescript' THEN 'ReScript'
    WHEN norm = 'solidity' THEN 'Solidity'
    WHEN norm IN ('t sql', 'tsql') THEN 'T-SQL'
    WHEN norm IN ('pl sql', 'plsql') THEN 'PL/SQL'
    WHEN norm = 'dhtml' THEN 'HTML'
    WHEN norm = 'clipper' THEN 'Clipper'
    WHEN norm = 'ada' THEN 'Ada'
    WHEN norm IN ('assembler x', 'assembler') THEN 'Assembler'

    -- ===== .NET EKOSYSTEM =====
    WHEN norm IN ('.net', 'dot net', 'dotnet', 'dotnet core', '.net core',
                  '.net framework', '.net framewrok', '.net core') THEN '.NET'
    WHEN norm IN ('asp.net', 'asp net', 'asp mvc') THEN 'ASP.NET'
    WHEN norm IN ('asp.net core', 'asp net core') THEN 'ASP.NET Core'
    WHEN norm IN ('asp.net mvc', 'asp net mvc') THEN 'ASP.NET MVC'
    WHEN norm IN ('asp.net web api', 'asp net web api') THEN 'ASP.NET Web API'
    WHEN norm IN ('asp.net web forms', 'asp net web forms') THEN 'ASP.NET Web Forms'
    WHEN norm IN ('ado.net', 'ado net', 'ado') THEN 'ADO.NET'
    WHEN norm = 'ef core' THEN 'Entity Framework Core'
    WHEN norm IN ('entity framework', 'entityframework') THEN 'Entity Framework'
    WHEN norm = 'entity framework core' THEN 'Entity Framework Core'
    WHEN norm = 'wpf' THEN 'WPF'
    WHEN norm IN ('windows forms', 'winforms') THEN 'WinForms'
    WHEN norm = 'wcf' THEN 'WCF'
    WHEN norm = 'signalr' THEN 'SignalR'
    WHEN norm = 'blazor' THEN 'Blazor'
    WHEN norm = 'maui' THEN '.NET MAUI'
    WHEN norm IN ('xamarin', 'xamarin uitest') THEN 'Xamarin'
    WHEN norm = 'nuget' THEN 'NuGet'
    WHEN norm = 'automapper' THEN 'AutoMapper'
    WHEN norm = 'dapper' THEN 'Dapper'
    WHEN norm = 'resharper' THEN 'ReSharper'
    WHEN norm = 'rider' THEN 'Rider'
    WHEN norm = 'specflow' THEN 'SpecFlow'
    WHEN norm = 'nunit' THEN 'NUnit'
    WHEN norm = 'xunit' THEN 'xUnit'
    WHEN norm = 'restsharp' THEN 'RestSharp'
    WHEN norm IN ('caliburn.micro', 'caliburnmicro') THEN 'Caliburn.Micro'
    WHEN norm = 'castlewindsor' THEN 'Castle Windsor'
    WHEN norm = 'servicestack' THEN 'ServiceStack'
    WHEN norm = 'devexpress' THEN 'DevExpress'
    WHEN norm = 'devextreme' THEN 'DevExtreme'
    WHEN norm IN ('telerik', 'telerik ui', 'telerik dojoui') THEN 'Telerik'

    -- ===== FRONTEND FRAMEWORKI =====
    WHEN norm IN ('react', 'reactjs', 'react js') THEN 'React'
    WHEN norm ~ '^angular\s' THEN 'Angular'
    WHEN norm = 'angular' THEN 'Angular'
    WHEN norm IN ('agular') THEN 'Angular'
    WHEN norm IN ('angularjs', 'angular js', 'angular.js') THEN 'AngularJS'
    WHEN norm IN ('vue', 'vuejs', 'vue js', 'vue.js') THEN 'Vue.js'
    WHEN norm IN ('next.js', 'nextjs', 'next js') THEN 'Next.js'
    WHEN norm IN ('nuxt', 'nuxtjs', 'nuxt js', 'nuxt.js') THEN 'Nuxt.js'
    WHEN norm = 'svelte' THEN 'Svelte'
    WHEN norm = 'sveltekit' THEN 'SvelteKit'
    WHEN norm IN ('gatsby', 'gatsbyjs') THEN 'Gatsby'
    WHEN norm IN ('ember', 'ember.js', 'ember data') THEN 'Ember.js'
    WHEN norm IN ('backbone', 'backbone.js', 'backbonejs') THEN 'Backbone.js'
    WHEN norm IN ('jquery', 'j query') THEN 'jQuery'
    WHEN norm IN ('solidjs', 'solid js') THEN 'SolidJS'
    WHEN norm IN ('astro', 'astrojs') THEN 'Astro'
    WHEN norm IN ('remix', 'remixjs') THEN 'Remix'
    WHEN norm = 'htmx' THEN 'htmx'
    WHEN norm IN ('extjs', 'ext js') THEN 'ExtJS'
    WHEN norm = 'stenciljs' THEN 'StencilJS'
    WHEN norm = 'analogjs' THEN 'AnalogJS'
    WHEN norm = 'preact' THEN 'Preact'
    WHEN norm = 'aurelia' THEN 'Aurelia'
    WHEN norm = 'prototype.js' THEN 'Prototype.js'
    WHEN norm IN ('lit', 'lit element') THEN 'Lit'
    WHEN norm = 'alpine' THEN 'Alpine.js'

    -- ===== REACT EKOSYSTEM =====
    WHEN norm = 'react native' THEN 'React Native'
    WHEN norm = 'react hooks' THEN 'React'
    WHEN norm = 'react router' THEN 'React Router'
    WHEN norm = 'react redux' THEN 'React'
    WHEN norm IN ('react query') THEN 'React Query'
    WHEN norm = 'react hook form' THEN 'React Hook Form'
    WHEN norm IN ('react testing library', 'react native testing library') THEN 'React Testing Library'
    WHEN norm = 'react navigation' THEN 'React Navigation'
    WHEN norm = 'react bootstrap' THEN 'React Bootstrap'
    WHEN norm = 'react dnd' THEN 'React DnD'
    WHEN norm = 'react email' THEN 'React Email'
    WHEN norm = 'react storybooks' THEN 'Storybook'

    -- ===== STATE MANAGEMENT =====
    WHEN norm = 'redux' THEN 'Redux'
    WHEN norm IN ('redux toolkit', '@reduxjs toolkit', 'rtk') THEN 'Redux Toolkit'
    WHEN norm = 'redux saga' THEN 'Redux Saga'
    WHEN norm = 'redux thunk' THEN 'Redux Thunk'
    WHEN norm = 'redux observable' THEN 'Redux Observable'
    WHEN norm = 'redux form' THEN 'Redux Form'
    WHEN norm IN ('zustand', 'redux zustand') THEN 'Zustand'
    WHEN norm = 'mobx' THEN 'MobX'
    WHEN norm = 'ngrx' THEN 'NgRx'
    WHEN norm = 'vuex' THEN 'Vuex'
    WHEN norm = 'pinia' THEN 'Pinia'
    WHEN norm = 'recoil' THEN 'Recoil'
    WHEN norm = 'jotai' THEN 'Jotai'
    WHEN norm = 'context api' THEN 'React Context API'
    WHEN norm = 'akita' THEN 'Akita'
    WHEN norm = 'signal store' THEN 'Signal Store'
    WHEN norm = 'signals' THEN 'Signals'

    -- ===== TANSTACK =====
    WHEN norm IN ('tanstack query') THEN 'TanStack Query'
    WHEN norm = 'tanstack router' THEN 'TanStack Router'
    WHEN norm = 'tanstack form' THEN 'TanStack Form'
    WHEN norm = 'tanstack' THEN 'TanStack'

    -- ===== CSS / STYLING =====
    WHEN norm = 'css' THEN 'CSS'
    WHEN norm IN ('css2', 'css3') THEN 'CSS'
    WHEN norm IN ('sass', 'scss', 'sass scss', 'css3 sass', 'css3 sass scss') THEN 'Sass/SCSS'
    WHEN norm IN ('tailwind', 'tailwind css', 'tailwindcss') THEN 'Tailwind CSS'
    WHEN norm IN ('bootstrap', 'bootstrap 4') THEN 'Bootstrap'
    WHEN norm IN ('styled components', 'sass tailwind styled components') THEN 'Styled Components'
    WHEN norm = 'css modules' THEN 'CSS Modules'
    WHEN norm = 'css in js' THEN 'CSS-in-JS'
    WHEN norm = 'emotion' THEN 'Emotion'
    WHEN norm IN ('material ui', 'mui') THEN 'Material UI'
    WHEN norm = 'chakra ui' THEN 'Chakra UI'
    WHEN norm IN ('shadcn', 'shadcn ui') THEN 'shadcn/ui'
    WHEN norm = 'radix ui' THEN 'Radix UI'
    WHEN norm = 'daisyui' THEN 'DaisyUI'
    WHEN norm IN ('primeng') THEN 'PrimeNG'
    WHEN norm = 'primereact' THEN 'PrimeReact'
    WHEN norm = 'primevue' THEN 'PrimeVue'
    WHEN norm IN ('ant design', 'antd') THEN 'Ant Design'
    WHEN norm = 'vuetify' THEN 'Vuetify'
    WHEN norm = 'bem' THEN 'BEM'
    WHEN norm = 'bulma' THEN 'Bulma'
    WHEN norm = 'angular material' THEN 'Angular Material'
    WHEN norm = 'ag grid' THEN 'AG Grid'

    -- ===== BACKEND / SERWER =====
    WHEN norm = 'spring' THEN 'Spring'
    WHEN norm IN ('spring boot', 'springboot') THEN 'Spring Boot'
    WHEN norm = 'spring cloud' THEN 'Spring Cloud'
    WHEN norm IN ('spring cloud netflix', 'spring cloud sleuth') THEN 'Spring Cloud'
    WHEN norm IN ('spring data', 'spring data jpa', 'spring jpa') THEN 'Spring Data'
    WHEN norm = 'spring security' THEN 'Spring Security'
    WHEN norm = 'spring security oauth' THEN 'Spring Security'
    WHEN norm IN ('spring mvc', 'spring web flow', 'spring webflow') THEN 'Spring MVC'
    WHEN norm = 'spring webflux' THEN 'Spring WebFlux'
    WHEN norm = 'spring batch' THEN 'Spring Batch'
    WHEN norm = 'spring integration' THEN 'Spring Integration'
    WHEN norm IN ('spring core', 'spring framework', 'spring ecosystem',
                  'spring spring boot') THEN 'Spring'
    WHEN norm IN ('spring test', 'spring mockmvc') THEN 'Spring Test'
    WHEN norm = 'spring tool suite' THEN 'Spring Tool Suite'
    WHEN norm = 'project reactor' THEN 'Project Reactor'
    WHEN norm IN ('node', 'nodejs', 'node js', 'node.js') THEN 'Node.js'
    WHEN norm IN ('express', 'express.js', 'expressjs') THEN 'Express.js'
    WHEN norm = 'fastify' THEN 'Fastify'
    WHEN norm = 'nestjs' THEN 'NestJS'
    WHEN norm IN ('django', 'django rest', 'django drf') THEN 'Django'
    WHEN norm IN ('django rest framework', 'drf') THEN 'Django REST Framework'
    WHEN norm = 'flask' THEN 'Flask'
    WHEN norm = 'fastapi' THEN 'FastAPI'
    WHEN norm IN ('rails', 'ruby on rails') THEN 'Ruby on Rails'
    WHEN norm = 'laravel' THEN 'Laravel'
    WHEN norm = 'symfony' THEN 'Symfony'
    WHEN norm = 'codeigniter' THEN 'CodeIgniter'
    WHEN norm = 'phoenix' THEN 'Phoenix'
    WHEN norm = 'gin' THEN 'Gin'
    WHEN norm = 'fiber' THEN 'Fiber'
    WHEN norm = 'quarkus' THEN 'Quarkus'
    WHEN norm = 'vert.x' THEN 'Vert.x'
    WHEN norm = 'micronaut' THEN 'Micronaut'
    WHEN norm = 'hibernate' THEN 'Hibernate'
    WHEN norm = 'jpa' THEN 'JPA'
    WHEN norm IN ('ejb', 'ejb 3.x') THEN 'EJB'
    WHEN norm IN ('servlet api', 'servlets', 'servlet jsp') THEN 'Java Servlets'
    WHEN norm = 'thymeleaf' THEN 'Thymeleaf'
    WHEN norm IN ('struts', 'apache struts', 'apache struts 1') THEN 'Struts'
    WHEN norm = 'strapi' THEN 'Strapi'
    WHEN norm = 'deno' THEN 'Deno'
    WHEN norm = 'bun' THEN 'Bun'
    WHEN norm = 'uvicorn' THEN 'Uvicorn'
    WHEN norm = 'celery' THEN 'Celery'
    WHEN norm = 'drools' THEN 'Drools'
    WHEN norm IN ('grpc', 'grpc api') THEN 'gRPC'
    WHEN norm = 'graphql' THEN 'GraphQL'
    WHEN norm IN ('apollo', 'apollo client', 'apollo graphql') THEN 'Apollo GraphQL'
    WHEN norm IN ('prisma', 'prisma orm', 'prisma webpack') THEN 'Prisma'
    WHEN norm = 'typeorm' THEN 'TypeORM'
    WHEN norm = 'sequelize' THEN 'Sequelize'
    WHEN norm = 'sqlalchemy' THEN 'SQLAlchemy'
    WHEN norm IN ('knex', 'knexjs') THEN 'Knex.js'
    WHEN norm = 'ecto' THEN 'Ecto'
    WHEN norm IN ('absinthe') THEN 'Absinthe'
    WHEN norm = 'yii' THEN 'Yii'
    WHEN norm IN ('zend', 'zend framework') THEN 'Zend'
    WHEN norm = 'blade' THEN 'Blade'
    WHEN norm = 'twig' THEN 'Twig'
    WHEN norm = 'tornado' THEN 'Tornado'
    WHEN norm = 'pylons' THEN 'Pylons'

    -- ===== BAZY DANYCH =====
    WHEN norm IN ('postgres', 'postgresql', 'aurora postgresql') THEN 'PostgreSQL'
    WHEN norm = 'mysql' THEN 'MySQL'
    WHEN norm IN ('mssql', 'sql server', 'ms sql', 'sql server management studio',
                  'sql server profiler') THEN 'SQL Server'
    WHEN norm = 'sql' THEN 'SQL'
    WHEN norm IN ('sql developer', 'sql oracle',
                  'sql postgres', 'sql lite', 'sql management studio') THEN 'SQL'
    WHEN norm = 'oracle' THEN 'Oracle'
    WHEN norm = 'mongodb' THEN 'MongoDB'
    WHEN norm = 'redis' THEN 'Redis'
    WHEN norm IN ('elasticsearch', 'elasticsearch opensearch') THEN 'Elasticsearch'
    WHEN norm = 'cassandra' THEN 'Cassandra'
    WHEN norm = 'couchdb' THEN 'CouchDB'
    WHEN norm = 'couchbase' THEN 'Couchbase'
    WHEN norm IN ('dynamodb', 'amazon dynamodb', 'aws dynamodb', 'dynamodb streams') THEN 'DynamoDB'
    WHEN norm IN ('sqlite', 'sqlite storage') THEN 'SQLite'
    WHEN norm IN ('cosmosdb', 'cosmos db') THEN 'Azure Cosmos DB'
    WHEN norm = 'neo4j' THEN 'Neo4j'
    WHEN norm = 'mariadb' THEN 'MariaDB'
    WHEN norm IN ('firestore', 'aws firestore') THEN 'Firestore'
    WHEN norm IN ('firebase', 'firebase sdk') THEN 'Firebase'
    WHEN norm = 'supabase' THEN 'Supabase'
    WHEN norm = 'influxdb' THEN 'InfluxDB'
    WHEN norm = 'timescaledb' THEN 'TimescaleDB'
    WHEN norm = 'clickhouse' THEN 'ClickHouse'
    WHEN norm = 'snowflake' THEN 'Snowflake'
    WHEN norm = 'bigquery' THEN 'BigQuery'
    WHEN norm = 'cockroachdb' THEN 'CockroachDB'
    WHEN norm IN ('amazon redshift', 'aws redshift', 'redshift') THEN 'Amazon Redshift'
    WHEN norm IN ('amazon rds', 'aws rds', 'rds') THEN 'Amazon RDS'
    WHEN norm = 'atlas mongodb' THEN 'MongoDB Atlas'
    WHEN norm = 'aerospikedb' THEN 'Aerospike'
    WHEN norm IN ('room', 'room db') THEN 'Room'
    WHEN norm IN ('realm', 'realmdb') THEN 'Realm'
    WHEN norm = 'rocksdb' THEN 'RocksDB'
    WHEN norm IN ('documentdb') THEN 'Amazon DocumentDB'
    WHEN norm = 'sybase' THEN 'Sybase'

    -- ===== MESSAGE BROKERS / STREAMING =====
    WHEN norm IN ('kafka', 'apache kafka', 'confluent kafka') THEN 'Kafka'
    WHEN norm = 'rabbitmq' THEN 'RabbitMQ'
    WHEN norm IN ('activemq', 'active mq', 'apache activemq', 'amq') THEN 'ActiveMQ'
    WHEN norm IN ('sqs', 'aws sqs', 'amazon sqs') THEN 'Amazon SQS'
    WHEN norm IN ('sns', 'aws sns', 'amazon sns') THEN 'Amazon SNS'
    WHEN norm IN ('eventbridge', 'aws eventbridge') THEN 'Amazon EventBridge'
    WHEN norm IN ('pub sub', 'pubsub') THEN 'Pub/Sub'
    WHEN norm = 'azure service bus' THEN 'Azure Service Bus'
    -- 'event streaming (kafka' → po normalizacji → 'event streaming', obsługiwane przez fuzzy match

    -- ===== CLOUD PROVIDERS =====
    WHEN norm IN ('aws', 'amazon web services', 'aws services', 'aws tools',
                  'aws stack', 'aws infrastructure') THEN 'AWS'
    WHEN norm IN ('gcp', 'google cloud') THEN 'GCP'
    WHEN norm IN ('azure', 'ms azure', 'microsoft azure', 'azure cloud',
                  'aws microsoft azure') THEN 'Azure'
    WHEN norm IN ('digitalocean', 'digital ocean') THEN 'DigitalOcean'
    WHEN norm = 'heroku' THEN 'Heroku'
    WHEN norm = 'vercel' THEN 'Vercel'
    WHEN norm = 'netlify' THEN 'Netlify'
    WHEN norm = 'cloudflare' THEN 'Cloudflare'
    WHEN norm = 'cloudflare workers' THEN 'Cloudflare Workers'
    WHEN norm = 'alibaba cloud' THEN 'Alibaba Cloud'
    WHEN norm = 'scaleway' THEN 'Scaleway'
    WHEN norm IN ('fly.io', 'flyio') THEN 'Fly.io'

    -- ===== AWS USŁUGI =====
    WHEN norm IN ('aws lambda') THEN 'AWS Lambda'
    WHEN norm IN ('aws ec', 'ec') THEN 'AWS EC2'
    WHEN norm IN ('aws s', 'amazon s') THEN 'AWS S3'
    WHEN norm IN ('aws ecs', 'ecs') THEN 'AWS ECS'
    WHEN norm IN ('aws eks', 'eks') THEN 'AWS EKS'
    WHEN norm IN ('aws ecr', 'ecr') THEN 'AWS ECR'
    WHEN norm IN ('aws cdk', 'cdk') THEN 'AWS CDK'
    WHEN norm IN ('aws cognito', 'cognito') THEN 'AWS Cognito'
    WHEN norm IN ('aws cloudformation', 'cloudformation') THEN 'AWS CloudFormation'
    WHEN norm IN ('aws cloudfront', 'cloudfront') THEN 'AWS CloudFront'
    WHEN norm IN ('aws cloudwatch', 'cloudwatch') THEN 'AWS CloudWatch'
    WHEN norm IN ('aws api gateway', 'api gateway', 'aws gateway') THEN 'AWS API Gateway'
    WHEN norm IN ('aws amplify', 'amplify') THEN 'AWS Amplify'
    WHEN norm IN ('aws sam', 'sam') THEN 'AWS SAM'
    WHEN norm = 'aws glue' THEN 'AWS Glue'
    WHEN norm = 'aws kinesis' THEN 'AWS Kinesis'
    WHEN norm = 'aws iam' THEN 'AWS IAM'
    WHEN norm IN ('aws codebuild', 'codebuild') THEN 'AWS CodeBuild'
    WHEN norm IN ('aws codepipeline', 'codepipeline') THEN 'AWS CodePipeline'
    WHEN norm IN ('aws codedeploy', 'codedeploy') THEN 'AWS CodeDeploy'
    WHEN norm IN ('aws ses', 'ses') THEN 'AWS SES'
    WHEN norm IN ('aws step functions', 'step functions') THEN 'AWS Step Functions'
    WHEN norm IN ('aws fargate', 'fargate') THEN 'AWS Fargate'
    WHEN norm = 'aws elastic beanstalk' THEN 'AWS Elastic Beanstalk'
    WHEN norm = 'aws waf' THEN 'AWS WAF'
    WHEN norm = 'aws neptune' THEN 'AWS Neptune'
    WHEN norm IN ('aws athena', 'athena') THEN 'AWS Athena'
    WHEN norm IN ('elasticache', 'aws elasticache') THEN 'AWS ElastiCache'
    WHEN norm IN ('aws vpc', 'vpc') THEN 'AWS VPC'
    WHEN norm IN ('appsync', 'aws appsync') THEN 'AWS AppSync'
    WHEN norm = 'aws device farm' THEN 'AWS Device Farm'
    WHEN norm IN ('aws timestream', 'amazon timestream', 'timestream') THEN 'AWS Timestream'
    WHEN norm = 'aws backup' THEN 'AWS Backup'
    WHEN norm = 'aws dms' THEN 'AWS DMS'
    WHEN norm IN ('aws efs') THEN 'AWS EFS'
    WHEN norm IN ('aws waf & shield') THEN 'AWS WAF'
    WHEN norm IN ('ebs', 'aws ebs') THEN 'AWS EBS'
    WHEN norm IN ('alb', 'aws alb') THEN 'AWS ALB'

    -- ===== AZURE USŁUGI =====
    WHEN norm IN ('azure devops') THEN 'Azure DevOps'
    WHEN norm IN ('azure pipelines', 'azure pipeline') THEN 'Azure Pipelines'
    WHEN norm IN ('azure active directory', 'azure ad', 'entraid') THEN 'Microsoft Entra ID'
    WHEN norm IN ('azure kubernetes service', 'aks') THEN 'AKS'
    WHEN norm = 'azure data factory' THEN 'Azure Data Factory'
    WHEN norm = 'azure sql' THEN 'Azure SQL'
    WHEN norm = 'azure functions' THEN 'Azure Functions'
    WHEN norm = 'azure monitor' THEN 'Azure Monitor'
    WHEN norm = 'azure automation' THEN 'Azure Automation'
    WHEN norm = 'azure cli' THEN 'Azure CLI'
    WHEN norm = 'azure security' THEN 'Azure Security'
    WHEN norm = 'azure firewall' THEN 'Azure Firewall'
    WHEN norm = 'azure cost management' THEN 'Azure Cost Management'
    WHEN norm = 'bicep' THEN 'Bicep'
    WHEN norm IN ('arm templates', 'arm') THEN 'ARM Templates'

    -- ===== GCP USŁUGI =====
    WHEN norm IN ('cloud functions gcp') THEN 'Cloud Functions'
    WHEN norm IN ('cloud run') THEN 'Cloud Run'
    WHEN norm IN ('cloud storage') THEN 'Cloud Storage'

    -- ===== DEVOPS / CI-CD =====
    WHEN norm = 'docker' THEN 'Docker'
    WHEN norm IN ('docker compose') THEN 'Docker Compose'
    WHEN norm IN ('docker swarm') THEN 'Docker Swarm'
    WHEN norm IN ('docker containers', 'docker machine', 'docker mysql', 'dind') THEN 'Docker'
    WHEN norm IN ('k8s', 'kubernetes') THEN 'Kubernetes'
    WHEN norm = 'terraform' THEN 'Terraform'
    WHEN norm = 'terragrunt' THEN 'Terragrunt'
    WHEN norm = 'ansible' THEN 'Ansible'
    WHEN norm = 'puppet' THEN 'Puppet'
    WHEN norm = 'chef' THEN 'Chef'
    WHEN norm = 'jenkins' THEN 'Jenkins'
    WHEN norm IN ('ci cd', 'ci', 'continuous integration', 'continous integration',
                  'ci cd pipelines', 'ci cd (github actions', 'ci cd (jenkins') THEN 'CI/CD'
    WHEN norm = 'github actions' THEN 'GitHub Actions'
    WHEN norm IN ('gitlab ci', 'gitlab ci cd') THEN 'GitLab CI/CD'
    WHEN norm = 'circleci' THEN 'CircleCI'
    WHEN norm IN ('travis ci', 'travis') THEN 'Travis CI'
    WHEN norm = 'bamboo' THEN 'Bamboo'
    WHEN norm = 'teamcity' THEN 'TeamCity'
    WHEN norm IN ('argocd', 'argo cd') THEN 'Argo CD'
    WHEN norm = 'helm' THEN 'Helm'
    WHEN norm = 'rancher' THEN 'Rancher'
    WHEN norm = 'buildkite' THEN 'Buildkite'
    WHEN norm = 'pulumi' THEN 'Pulumi'
    WHEN norm = 'crossplane.io' THEN 'Crossplane'
    WHEN norm = 'spinnaker' THEN 'Spinnaker'
    WHEN norm = 'buddy' THEN 'Buddy'
    WHEN norm = 'bitrise' THEN 'Bitrise'
    WHEN norm = 'codemagic' THEN 'Codemagic'
    WHEN norm IN ('fastlane', 'fastlan') THEN 'Fastlane'
    WHEN norm = 'artifactory' THEN 'Artifactory'
    WHEN norm = 'nexus' THEN 'Nexus'

    -- ===== VCS / GIT =====
    WHEN norm = 'git' THEN 'Git'
    WHEN norm = 'github' THEN 'GitHub'
    WHEN norm = 'gitlab' THEN 'GitLab'
    WHEN norm = 'bitbucket' THEN 'Bitbucket'
    WHEN norm IN ('bitbucket pipelines', 'bitbucket ci cd') THEN 'Bitbucket Pipelines'
    WHEN norm IN ('svn', 'subversion') THEN 'SVN'
    WHEN norm IN ('tortoise svn', 'tortoisesvn') THEN 'TortoiseSVN'
    WHEN norm = 'sourcetree' THEN 'SourceTree'
    WHEN norm = 'stash' THEN 'Stash'
    WHEN norm = 'cvs' THEN 'CVS'

    -- ===== TESTOWANIE =====
    WHEN norm = 'junit' THEN 'JUnit'
    WHEN norm = 'jest' THEN 'Jest'
    WHEN norm = 'pytest' THEN 'pytest'
    WHEN norm = 'cypress' THEN 'Cypress'
    WHEN norm = 'playwright' THEN 'Playwright'
    WHEN norm IN ('selenium', 'selenium webdriver') THEN 'Selenium'
    WHEN norm = 'mockito' THEN 'Mockito'
    WHEN norm = 'testng' THEN 'TestNG'
    WHEN norm IN ('spock', 'spock framework') THEN 'Spock'
    WHEN norm = 'rspec' THEN 'RSpec'
    WHEN norm = 'mocha' THEN 'Mocha'
    WHEN norm = 'chai' THEN 'Chai'
    WHEN norm = 'sinon' THEN 'Sinon'
    WHEN norm IN ('enzyme', 'enzyme.js') THEN 'Enzyme'
    WHEN norm = 'protractor' THEN 'Protractor'
    WHEN norm IN ('cucumber', 'cucumber.js') THEN 'Cucumber'
    WHEN norm = 'appium' THEN 'Appium'
    WHEN norm = 'espresso' THEN 'Espresso'
    WHEN norm = 'xctest' THEN 'XCTest'
    WHEN norm = 'vitest' THEN 'Vitest'
    WHEN norm = 'testcafe' THEN 'TestCafe'
    WHEN norm = 'robot framework' THEN 'Robot Framework'
    WHEN norm IN ('soapui', 'soap ui') THEN 'SoapUI'
    WHEN norm = 'rest assured' THEN 'REST Assured'
    WHEN norm = 'webdriverio' THEN 'WebDriverIO'
    WHEN norm = 'assertj' THEN 'AssertJ'
    WHEN norm = 'wiremock' THEN 'WireMock'
    WHEN norm IN ('testcontainers', 'test containers') THEN 'Testcontainers'
    WHEN norm = 'robolectric' THEN 'Robolectric'
    WHEN norm = 'qunit' THEN 'QUnit'
    WHEN norm = 'behave' THEN 'Behave'
    WHEN norm = 'bdd' THEN 'BDD'
    WHEN norm IN ('tdd', 'test driven development') THEN 'TDD'
    WHEN norm = 'storybook' THEN 'Storybook'
    WHEN norm = 'chromatic' THEN 'Chromatic'
    WHEN norm = 'browserstack' THEN 'BrowserStack'
    WHEN norm IN ('puppeteer', 'puppeteersharp') THEN 'Puppeteer'
    WHEN norm = 'easymock' THEN 'EasyMock'
    WHEN norm = 'catch' THEN 'Catch2'
    WHEN norm = 'spotbugs' THEN 'SpotBugs'
    WHEN norm = 'findbugs' THEN 'FindBugs'
    WHEN norm = 'checkstyle' THEN 'Checkstyle'
    WHEN norm IN ('cmock') THEN 'CMock'

    -- ===== MOBILE =====
    WHEN norm IN ('android', 'android sdk', 'android studio',
                  'android configuration', 'aosp') THEN 'Android'
    WHEN norm = 'android jetpack' THEN 'Android Jetpack'
    WHEN norm = 'ios' THEN 'iOS'
    WHEN norm = 'swiftui' THEN 'SwiftUI'
    WHEN norm = 'uikit' THEN 'UIKit'
    WHEN norm = 'flutter' THEN 'Flutter'
    WHEN norm = 'ionic' THEN 'Ionic'
    WHEN norm = 'cordova' THEN 'Cordova'
    WHEN norm = 'capacitor' THEN 'Capacitor'
    WHEN norm IN ('kotlin multiplatform', 'kmp') THEN 'Kotlin Multiplatform'
    WHEN norm IN ('compose', 'compose multiplatform') THEN 'Jetpack Compose'
    WHEN norm = 'expo' THEN 'Expo'
    WHEN norm IN ('cocoapods', 'cocoapods spm', 'spm') THEN 'CocoaPods'
    WHEN norm = 'cocoa touch' THEN 'Cocoa Touch'
    WHEN norm = 'core data' THEN 'Core Data'
    WHEN norm = 'core bluetooth' THEN 'Core Bluetooth'
    WHEN norm = 'combine' THEN 'Combine'
    WHEN norm = 'rxswift' THEN 'RxSwift'
    WHEN norm = 'rxjava' THEN 'RxJava'
    WHEN norm = 'rxjs' THEN 'RxJS'
    WHEN norm = 'rxcocoa' THEN 'RxCocoa'
    WHEN norm = 'retrofit' THEN 'Retrofit'
    WHEN norm = 'alamofire' THEN 'Alamofire'
    WHEN norm = 'snapkit' THEN 'SnapKit'
    WHEN norm = 'reanimated' THEN 'React Native Reanimated'
    WHEN norm IN ('clean swift', 'cleanswift') THEN 'Clean Swift'
    WHEN norm = 'viper' THEN 'VIPER'
    WHEN norm = 'bloc' THEN 'BLoC'
    WHEN norm = 'arkit' THEN 'ARKit'
    WHEN norm = 'swift concurrency' THEN 'Swift'
    WHEN norm = 'swiftlint' THEN 'SwiftLint'
    WHEN norm = 'swiftgen' THEN 'SwiftGen'
    WHEN norm = 'swiftpackagemanager' THEN 'Swift Package Manager'
    WHEN norm = 'exoplayer' THEN 'ExoPlayer'
    WHEN norm IN ('rxandroidble') THEN 'RxAndroid'
    WHEN norm = 'codepush' THEN 'CodePush'

    -- ===== MONITORING / OBSERVABILITY =====
    WHEN norm = 'datadog' THEN 'Datadog'
    WHEN norm = 'prometheus' THEN 'Prometheus'
    WHEN norm = 'grafana' THEN 'Grafana'
    WHEN norm IN ('sentry', 'sentry sdk') THEN 'Sentry'
    WHEN norm = 'new relic' THEN 'New Relic'
    WHEN norm = 'dynatrace' THEN 'Dynatrace'
    WHEN norm IN ('elk', 'elk stack', 'elk efk', 'elastic stack',
                  'elk stack (elasticsearch') THEN 'ELK Stack'
    WHEN norm = 'splunk' THEN 'Splunk'
    WHEN norm = 'kibana' THEN 'Kibana'
    WHEN norm = 'logstash' THEN 'Logstash'
    WHEN norm = 'application insights' THEN 'Application Insights'
    WHEN norm = 'coralogix' THEN 'Coralogix'
    WHEN norm = 'rollbar' THEN 'Rollbar'
    WHEN norm = 'crashlytics' THEN 'Crashlytics'
    WHEN norm = 'zabbix' THEN 'Zabbix'
    WHEN norm = 'telegraf' THEN 'Telegraf'

    -- ===== BUILD TOOLS / PACKAGE MANAGERS =====
    WHEN norm IN ('webpack', 'prisma webpack') THEN 'Webpack'
    WHEN norm = 'vite' THEN 'Vite'
    WHEN norm = 'esbuild' THEN 'esbuild'
    WHEN norm = 'rollup' THEN 'Rollup'
    WHEN norm IN ('babel', 'babeljs') THEN 'Babel'
    WHEN norm = 'eslint' THEN 'ESLint'
    WHEN norm = 'prettier' THEN 'Prettier'
    WHEN norm = 'tslint' THEN 'TSLint'
    WHEN norm = 'npm' THEN 'npm'
    WHEN norm = 'yarn' THEN 'Yarn'
    WHEN norm = 'pnpm' THEN 'pnpm'
    WHEN norm = 'maven' THEN 'Maven'
    WHEN norm = 'gradle' THEN 'Gradle'
    WHEN norm = 'sbt' THEN 'sbt'
    WHEN norm IN ('ant', 'apache ant') THEN 'Ant'
    WHEN norm = 'composer' THEN 'Composer'
    WHEN norm = 'bundler' THEN 'Bundler'
    WHEN norm = 'pip' THEN 'pip'
    WHEN norm = 'cmake' THEN 'CMake'
    WHEN norm = 'lerna' THEN 'Lerna'
    WHEN norm = 'turborepo' THEN 'Turborepo'
    WHEN norm = 'nx' THEN 'Nx'
    WHEN norm = 'browserify' THEN 'Browserify'
    WHEN norm = 'requirejs' THEN 'RequireJS'
    WHEN norm = 'conan' THEN 'Conan'
    WHEN norm = 'vcpkg' THEN 'vcpkg'
    WHEN norm = 'brew' THEN 'Homebrew'
    WHEN norm = 'semver' THEN 'SemVer'

    -- ===== API / PROTOKOŁY =====
    WHEN norm = 'rest' THEN 'REST'
    WHEN norm IN ('rest api', 'restful api', 'restful apis', 'rest apis',
                  'restful services', 'restful webservices', 'rest web services',
                  'rest restful apis', 'rest protocol', 'rest api design',
                  'rest api automation', 'restful api integration',
                  'rest soap integration', 'restfull') THEN 'REST API'
    WHEN norm IN ('soap', 'soap web services') THEN 'SOAP'
    WHEN norm IN ('websocket', 'websockets') THEN 'WebSocket'
    WHEN norm = 'socket.io' THEN 'Socket.io'
    WHEN norm = 'webrtc' THEN 'WebRTC'
    WHEN norm IN ('protobuf', 'protobufs', 'protocol buffers') THEN 'Protocol Buffers'
    WHEN norm = 'swagger' THEN 'Swagger'
    WHEN norm IN ('swagger openapi', 'openapi') THEN 'OpenAPI'
    WHEN norm IN ('api design', 'api development', 'api management',
                  'api integration', 'api testing', 'apis',
                  'custom api development') THEN 'API Development'
    WHEN norm IN ('wsdl', 'ws security', 'ws securitypolicy', 'ws') THEN 'Web Services'
    WHEN norm IN ('raml') THEN 'RAML'
    WHEN norm IN ('async api') THEN 'AsyncAPI'

    -- ===== CMS / E-COMMERCE =====
    WHEN norm IN ('wordpress', 'wordpress development', 'wordpress rest api',
                  'wordpress vip', 'wordpress vip hosting',
                  'cms wordpress') THEN 'WordPress'
    WHEN norm IN ('shopify', 'shopify api', 'shopify plus', 'shopify app bridge',
                  'shopify checkout extensions', 'shopify custom apps',
                  'shopify functions', 'shopify webhooks') THEN 'Shopify'
    WHEN norm = 'woocommerce' THEN 'WooCommerce'
    WHEN norm = 'drupal' THEN 'Drupal'
    WHEN norm = 'contentful' THEN 'Contentful'
    WHEN norm = 'sanity' THEN 'Sanity'
    WHEN norm = 'magento' THEN 'Magento'
    WHEN norm = 'sitecore' THEN 'Sitecore'
    WHEN norm = 'aem' THEN 'Adobe AEM'
    WHEN norm = 'elementor' THEN 'Elementor'
    WHEN norm = 'wpbakery' THEN 'WPBakery'
    WHEN norm = 'wix' THEN 'Wix'
    WHEN norm = 'bubble.io' THEN 'Bubble'
    WHEN norm = 'wagtail' THEN 'Wagtail'
    WHEN norm = 'docusaurus' THEN 'Docusaurus'
    WHEN norm = 'ghost' THEN 'Ghost'
    WHEN norm = 'refine' THEN 'Refine'
    WHEN norm IN ('bricks', 'beaver builder', 'divi') THEN initcap(norm)
    WHEN norm = 'advanced custom fields' THEN 'ACF'
    WHEN norm IN ('wpml') THEN 'WPML'
    WHEN norm IN ('yoast seo') THEN 'Yoast SEO'
    WHEN norm IN ('rank math') THEN 'Rank Math'
    WHEN norm IN ('whmcs') THEN 'WHMCS'
    WHEN norm IN ('wpgraphql') THEN 'WPGraphQL'
    WHEN norm IN ('wpforms') THEN 'WPForms'
    WHEN norm IN ('custom post types', 'cpt') THEN 'WordPress CPT'

    -- ===== NARZĘDZIA PROJECT MANAGEMENT =====
    WHEN norm = 'jira' THEN 'Jira'
    WHEN norm IN ('confluence', 'conuence') THEN 'Confluence'
    WHEN norm = 'trello' THEN 'Trello'
    WHEN norm = 'asana' THEN 'Asana'
    WHEN norm = 'clickup' THEN 'ClickUp'
    WHEN norm = 'basecamp' THEN 'Basecamp'
    WHEN norm = 'rally' THEN 'Rally'
    WHEN norm = 'taiga' THEN 'Taiga'
    WHEN norm IN ('notion') THEN 'Notion'
    WHEN norm IN ('slack') THEN 'Slack'

    -- ===== DESIGN TOOLS =====
    WHEN norm IN ('figma', 'figma api') THEN 'Figma'
    WHEN norm = 'sketch' THEN 'Sketch'
    WHEN norm = 'adobe xd' THEN 'Adobe XD'
    WHEN norm = 'adobe photoshop' THEN 'Photoshop'
    WHEN norm IN ('adobe', 'affinity designer', 'affinity photo') THEN initcap(norm)
    WHEN norm = 'zeplin' THEN 'Zeplin'

    -- ===== IDE =====
    WHEN norm IN ('visual studio') THEN 'Visual Studio'
    WHEN norm IN ('visual studio code', 'vs code', 'vscode', 'vscode extensions') THEN 'VS Code'
    WHEN norm IN ('xcode', 'xcodegen') THEN 'Xcode'
    WHEN norm IN ('eclipse', 'eclipse ide', 'eclipse plugins') THEN 'Eclipse'
    WHEN norm = 'intellij' THEN 'IntelliJ IDEA'
    WHEN norm = 'pycharm' THEN 'PyCharm'
    WHEN norm = 'clion' THEN 'CLion'
    WHEN norm = 'webstorm' THEN 'WebStorm'
    WHEN norm IN ('cursor', 'cursor ide') THEN 'Cursor'
    WHEN norm = 'appcode' THEN 'AppCode'
    WHEN norm = 'android studio' THEN 'Android Studio'

    -- ===== AI / NARZĘDZIA AI =====
    WHEN norm IN ('copilot') THEN 'GitHub Copilot'
    WHEN norm IN ('chatgpt', 'ai tools: chatgpt') THEN 'ChatGPT'
    WHEN norm IN ('claude', 'claude 3.5 sonnet', 'claude code', 'claudecode') THEN 'Claude'
    WHEN norm IN ('windsurf') THEN 'Windsurf'
    WHEN norm IN ('aider') THEN 'Aider'
    WHEN norm = 'replit' THEN 'Replit'

    -- ===== METODYKI / ARCHITEKTURA =====
    WHEN norm IN ('agile', 'agile scrum', 'agile scrum kanban') THEN 'Agile'
    WHEN norm IN ('scrum', 'scrumm') THEN 'Scrum'
    WHEN norm = 'kanban' THEN 'Kanban'
    WHEN norm = 'safe' THEN 'SAFe'
    WHEN norm = 'waterfall' THEN 'Waterfall'
    WHEN norm = 'microservices' THEN 'Microservices'
    WHEN norm IN ('ddd', 'domain driven design') THEN 'DDD'
    WHEN norm = 'cqrs' THEN 'CQRS'
    WHEN norm = 'event sourcing' THEN 'Event Sourcing'
    WHEN norm IN ('event driven', 'event driven architecture',
                  'event driven design') THEN 'Event-Driven Architecture'
    WHEN norm = 'event storming' THEN 'Event Storming'
    WHEN norm = 'clean architecture' THEN 'Clean Architecture'
    WHEN norm IN ('clean code', 'clean code principles') THEN 'Clean Code'
    WHEN norm IN ('solid', 'solid design principles') THEN 'SOLID'
    WHEN norm IN ('design patterns', 'software design patterns') THEN 'Design Patterns'
    WHEN norm = 'togaf' THEN 'TOGAF'
    WHEN norm = 'archimate' THEN 'ArchiMate'
    WHEN norm IN ('uml', 'uml diagrams', 'uml modelling') THEN 'UML'
    WHEN norm IN ('c4 model', 'c4 diagrams') THEN 'C4 Model'
    WHEN norm IN ('dry', 'yagni') THEN upper(norm)
    WHEN norm = 'vertical slices' THEN 'Vertical Slices'
    WHEN norm = 'strangler fig' THEN 'Strangler Fig Pattern'
    WHEN norm IN ('bff') THEN 'BFF'
    WHEN norm IN ('dependency injection', 'di') THEN 'Dependency Injection'
    WHEN norm IN ('atomic design') THEN 'Atomic Design'
    WHEN norm = 'trunk based development' THEN 'Trunk-Based Development'
    WHEN norm = 'serverless' THEN 'Serverless'
    WHEN norm IN ('serverless framework', 'serverless architecture') THEN 'Serverless'
    WHEN norm IN ('service oriented architecture', 'soa') THEN 'SOA'

    -- ===== SECURITY =====
    WHEN norm = 'oauth' THEN 'OAuth'
    WHEN norm = 'sso' THEN 'SSO'
    WHEN norm = 'jwt' THEN 'JWT'
    WHEN norm = 'keycloak' THEN 'Keycloak'
    WHEN norm = 'vault' THEN 'HashiCorp Vault'
    WHEN norm = 'snyk' THEN 'Snyk'
    WHEN norm IN ('sonarqube', 'sonar') THEN 'SonarQube'
    WHEN norm = 'sonarlint' THEN 'SonarLint'
    WHEN norm = 'sonarcloud' THEN 'SonarCloud'
    WHEN norm = 'veracode' THEN 'Veracode'
    WHEN norm = 'owasp' THEN 'OWASP'
    WHEN norm IN ('rbac', 'acls') THEN upper(norm)
    WHEN norm IN ('auth') THEN 'Auth'
    WHEN norm = 'conditional access' THEN 'Conditional Access'
    WHEN norm = 'zero trust' THEN 'Zero Trust'
    WHEN norm = 'burp suite' THEN 'Burp Suite'
    WHEN norm = 'wireshark' THEN 'Wireshark'

    -- ===== WEB TECHNOLOGIE =====
    WHEN norm = 'html' THEN 'HTML'
    WHEN norm = 'xml' THEN 'XML'
    WHEN norm = 'ajax' THEN 'AJAX'
    WHEN norm IN ('pwa', 'progressive web app', 'progressive web applications') THEN 'PWA'
    WHEN norm = 'spa' THEN 'SPA'
    WHEN norm = 'ssr' THEN 'SSR'
    WHEN norm = 'seo' THEN 'SEO'
    WHEN norm IN ('rwd', 'responsive web design', 'responsive ui') THEN 'Responsive Design'
    WHEN norm IN ('web components', 'webcomponents') THEN 'Web Components'
    WHEN norm = 'webgl' THEN 'WebGL'
    WHEN norm = 'three.js' THEN 'Three.js'
    WHEN norm IN ('d3.js', 'd3', 'd3 time', 'd3 zoom') THEN 'D3.js'
    WHEN norm IN ('service worker', 'workbox') THEN 'Service Worker'
    WHEN norm IN ('web worker') THEN 'Web Worker'
    WHEN norm IN ('wcag', 'accessibility', 'accesibility') THEN 'WCAG'
    WHEN norm IN ('deep linking') THEN 'Deep Linking'

    -- ===== INFRASTRUKTURA / SIEĆ =====
    WHEN norm = 'linux' THEN 'Linux'
    WHEN norm = 'ubuntu' THEN 'Ubuntu'
    WHEN norm = 'centos' THEN 'CentOS'
    WHEN norm = 'debian' THEN 'Debian'
    WHEN norm IN ('windows', 'windows xp', 'windows vista') THEN 'Windows'
    WHEN norm IN ('windows server', 'windows server 2016') THEN 'Windows Server'
    WHEN norm = 'nginx' THEN 'NGINX'
    WHEN norm IN ('apache', 'apache http server', 'apache webserver') THEN 'Apache HTTP Server'
    WHEN norm IN ('apache tomcat', 'tomcat') THEN 'Tomcat'
    WHEN norm = 'iis' THEN 'IIS'
    WHEN norm = 'weblogic' THEN 'WebLogic'
    WHEN norm = 'websphere' THEN 'WebSphere'
    WHEN norm IN ('wildfly', 'jboss') THEN 'WildFly'
    WHEN norm IN ('bash', 'bash scripting', 'shell', 'shell scripting', 'sh',
                  'unix shell scripting bash') THEN 'Bash'
    WHEN norm = 'powershell' THEN 'PowerShell'
    WHEN norm IN ('windows batch', 'windows batch script', 'batch') THEN 'Batch Script'
    WHEN norm IN ('vmware', 'vmware esxi', 'vmware vsphere', 'vmware workstation',
                  'esxi', 'vsphere') THEN 'VMware'
    WHEN norm = 'vagrant' THEN 'Vagrant'
    WHEN norm = 'consul' THEN 'Consul'
    WHEN norm = 'dns' THEN 'DNS'
    WHEN norm = 'dhcp' THEN 'DHCP'
    WHEN norm IN ('tcp', 'tcp ip sockets', 'tcpip') THEN 'TCP/IP'
    WHEN norm IN ('vpn gateways') THEN 'VPN'
    WHEN norm IN ('ssl tls', 'tls') THEN 'TLS/SSL'
    WHEN norm IN ('unix', 'unix sco', 'unix system') THEN 'Unix'
    WHEN norm = 'cpanel' THEN 'cPanel'
    WHEN norm = 'directadmin' THEN 'DirectAdmin'
    WHEN norm = 'proxmox' THEN 'Proxmox'
    WHEN norm = 'wsl' THEN 'WSL'
    WHEN norm = 'colima' THEN 'Colima'

    -- ===== DATA / AI / ML =====
    WHEN norm IN ('ai', 'artificial intelligence') THEN 'AI'
    WHEN norm IN ('ai agents', 'agentic flows', 'agents') THEN 'AI Agents'
    WHEN norm IN ('ai tools', 'ai integrations', 'ai assisted sdlc') THEN 'AI'
    WHEN norm IN ('ml', 'machine learning') THEN 'Machine Learning'
    WHEN norm IN ('tensorflow', 'tensorflow integration') THEN 'TensorFlow'
    WHEN norm = 'pytorch' THEN 'PyTorch'
    WHEN norm = 'scikit learn' THEN 'scikit-learn'
    WHEN norm = 'pyspark' THEN 'PySpark'
    WHEN norm IN ('spark', 'apache spark') THEN 'Apache Spark'
    WHEN norm = 'hadoop' THEN 'Hadoop'
    WHEN norm = 'apache airflow' THEN 'Apache Airflow'
    WHEN norm = 'databricks' THEN 'Databricks'
    WHEN norm = 'pandas' THEN 'Pandas'
    WHEN norm = 'numpy' THEN 'NumPy'
    WHEN norm = 'jupyter' THEN 'Jupyter'
    WHEN norm = 'dbt' THEN 'dbt'
    WHEN norm IN ('etl', 'etl process', 'elt') THEN 'ETL'
    WHEN norm = 'rag' THEN 'RAG'
    WHEN norm = 'langchain' THEN 'LangChain'
    WHEN norm = 'prompt engineering' THEN 'Prompt Engineering'
    WHEN norm = 'qdrant' THEN 'Qdrant'
    WHEN norm = 'data pipelines' THEN 'Data Pipelines'
    WHEN norm IN ('data warehousing', 'datawarehouse') THEN 'Data Warehouse'
    WHEN norm IN ('data analysis', 'data analytics') THEN 'Data Analytics'
    WHEN norm = 'bokeh' THEN 'Bokeh'
    WHEN norm = 'tableau' THEN 'Tableau'

    -- ===== INNE POPULARNE =====
    WHEN norm IN ('twilio', 'twilio video') THEN 'Twilio'
    WHEN norm = 'stripe' THEN 'Stripe'
    WHEN norm IN ('tauri') THEN 'Tauri'
    WHEN norm = 'electron' THEN 'Electron'
    WHEN norm IN ('chart.js', 'chartjs', 'charts') THEN 'Chart.js'
    WHEN norm = 'recharts' THEN 'Recharts'
    WHEN norm = 'apexcharts' THEN 'ApexCharts'
    WHEN norm = 'zod' THEN 'Zod'
    WHEN norm = 'yup' THEN 'Yup'
    WHEN norm = 'axios' THEN 'Axios'
    WHEN norm = 'lodash' THEN 'Lodash'
    WHEN norm IN ('ramda', 'ramdajs') THEN 'Ramda'
    WHEN norm = 'date fns' THEN 'date-fns'
    WHEN norm IN ('moment', 'momentjs') THEN 'Moment.js'
    WHEN norm IN ('underscore', 'underscore.js') THEN 'Underscore.js'
    WHEN norm = 'regex' THEN 'Regex'
    WHEN norm = 'json' THEN 'JSON'
    WHEN norm = 'yaml' THEN 'YAML'
    WHEN norm = 'markdown' THEN 'Markdown'
    WHEN norm = 'csv' THEN 'CSV'
    WHEN norm = 'amplitude' THEN 'Amplitude'
    WHEN norm = 'segment' THEN 'Segment'
    WHEN norm = 'mixpanel' THEN 'Mixpanel'
    WHEN norm IN ('unity', 'unity engine', 'unity3d', 'unity 3d', 'unity container') THEN 'Unity'
    WHEN norm IN ('unreal', 'unreal engine') THEN 'Unreal Engine'
    WHEN norm = 'blender' THEN 'Blender'
    WHEN norm = 'godot' THEN 'Godot'
    WHEN norm = 'postman' THEN 'Postman'
    WHEN norm = 'insomnia' THEN 'Insomnia'
    WHEN norm IN ('chrome devtools') THEN 'Chrome DevTools'
    WHEN norm IN ('chrome extension', 'chrome extensions', 'browser extensions') THEN 'Browser Extensions'
    WHEN norm = 'tinymce' THEN 'TinyMCE'
    WHEN norm = 'cke' THEN 'CKEditor'
    WHEN norm IN ('sendmail', 'smtp') THEN 'SMTP'
    WHEN norm IN ('algolia') THEN 'Algolia'
    WHEN norm IN ('cloudinary') THEN 'Cloudinary'
    WHEN norm IN ('resend') THEN 'Resend'
    WHEN norm IN ('appsmith', 'budibase') THEN initcap(norm)
    WHEN norm = 'backstage' THEN 'Backstage'
    WHEN norm = 'debezium' THEN 'Debezium'

    -- ===== SAP =====
    WHEN norm IN ('sap', 'sap commerce', 'sap hybris commerce',
                  'sap hybris e commerce platform', 'sap spartacus',
                  'sap ui', 'sapui', 'sap scripting') THEN 'SAP'

    -- ===== SALESFORCE =====
    WHEN norm IN ('salesforce', 'salesforce integration', 'salesforce rest api',
                  'salesforce.com development') THEN 'Salesforce'

    -- ===== APACHE TOOLS =====
    WHEN norm IN ('apache camel', 'camel') THEN 'Apache Camel'
    WHEN norm = 'apache flink' THEN 'Apache Flink'
    WHEN norm IN ('apache solr', 'solr') THEN 'Apache Solr'
    WHEN norm IN ('apache poi', 'apachepoi') THEN 'Apache POI'
    WHEN norm IN ('apache jmeter', 'jmeter') THEN 'JMeter'
    WHEN norm = 'apache lucene' THEN 'Apache Lucene'
    WHEN norm = 'apache storm' THEN 'Apache Storm'
    WHEN norm = 'apache velocity' THEN 'Apache Velocity'
    WHEN norm IN ('apache wicket', 'wicket') THEN 'Apache Wicket'
    WHEN norm IN ('apache cxf') THEN 'Apache CXF'
    WHEN norm IN ('apache ranger') THEN 'Apache Ranger'

    -- ===== CAMUNDA / BPM =====
    WHEN norm IN ('camunda', 'camunda bpmn', 'apache camunda') THEN 'Camunda'
    WHEN norm = 'bpmn' THEN 'BPMN'
    WHEN norm IN ('activiti', 'activiti bpmn') THEN 'Activiti'
    WHEN norm = 'dmn' THEN 'DMN'

    -- ===== AUTOMATYZACJA / RPA =====
    WHEN norm = 'uipath' THEN 'UiPath'
    WHEN norm = 'blue prism' THEN 'Blue Prism'

    -- ===== AUTOMOTIVE =====
    WHEN norm IN ('autosar classic', 'autosar') THEN 'AUTOSAR'
    WHEN norm IN ('automotive spice') THEN 'Automotive SPICE'
    WHEN norm IN ('can', 'can fd') THEN 'CAN'
    WHEN norm IN ('someip') THEN 'SOME/IP'
    WHEN norm IN ('docan', 'doip', 'uds') THEN upper(norm)

    -- ===== BLOCKCHAIN =====
    WHEN norm = 'blockchain' THEN 'Blockchain'
    WHEN norm = 'ethereum' THEN 'Ethereum'
    WHEN norm = 'bitcoin' THEN 'Bitcoin'
    WHEN norm = 'solana' THEN 'Solana'
    WHEN norm IN ('web3.js', 'web3j') THEN 'Web3'
    WHEN norm = 'ethers' THEN 'ethers.js'
    WHEN norm IN ('viem', 'wagmi') THEN initcap(norm)
    WHEN norm = 'arweave' THEN 'Arweave'

    -- ===== SERVICE MESH / INFRA =====
    WHEN norm = 'istio' THEN 'Istio'
    WHEN norm = 'envoy' THEN 'Envoy'
    WHEN norm = 'service fabric' THEN 'Service Fabric'
    WHEN norm = 'eureka' THEN 'Eureka'
    WHEN norm IN ('zuul') THEN 'Zuul'
    WHEN norm IN ('axon framework') THEN 'Axon Framework'

    -- ===== CATCHALL =====
    ELSE initcap(norm)
  END;
$$;

-- 6) Slug w SQL (pod URL/SEO). Specjalne przypadki dla kilku technologii.
CREATE OR REPLACE FUNCTION public.tech_slug(name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN name IS NULL OR trim(name) = '' THEN NULL
    WHEN name = '.NET' THEN 'dotnet'
    WHEN name = '.NET MAUI' THEN 'dotnet-maui'
    WHEN name = 'C#' THEN 'csharp'
    WHEN name = 'C++' THEN 'cpp'
    WHEN name = 'C' THEN 'c'
    WHEN name = 'R' THEN 'r'
    WHEN name = 'Node.js' THEN 'nodejs'
    WHEN name = 'Next.js' THEN 'nextjs'
    WHEN name = 'Nuxt.js' THEN 'nuxtjs'
    WHEN name = 'Vue.js' THEN 'vuejs'
    WHEN name = 'D3.js' THEN 'd3js'
    WHEN name = 'Three.js' THEN 'threejs'
    WHEN name = 'Ember.js' THEN 'emberjs'
    WHEN name = 'Socket.io' THEN 'socketio'
    WHEN name = 'Express.js' THEN 'expressjs'
    WHEN name = 'Knex.js' THEN 'knexjs'
    WHEN name = 'ASP.NET' THEN 'aspnet'
    WHEN name = 'ASP.NET Core' THEN 'aspnet-core'
    WHEN name = 'ASP.NET MVC' THEN 'aspnet-mvc'
    WHEN name = 'ASP.NET Web API' THEN 'aspnet-web-api'
    WHEN name = 'ASP.NET Web Forms' THEN 'aspnet-web-forms'
    WHEN name = 'ADO.NET' THEN 'adonet'
    WHEN name = 'VB.NET' THEN 'vbnet'
    WHEN name = 'Sass/SCSS' THEN 'sass-scss'
    WHEN name = 'CSS-in-JS' THEN 'css-in-js'
    WHEN name = 'shadcn/ui' THEN 'shadcn-ui'
    WHEN name = 'Objective-C' THEN 'objective-c'
    WHEN name = 'T-SQL' THEN 'tsql'
    WHEN name = 'PL/SQL' THEN 'plsql'
    WHEN name = 'TCP/IP' THEN 'tcp-ip'
    WHEN name = 'TLS/SSL' THEN 'tls-ssl'
    WHEN name = 'CI/CD' THEN 'ci-cd'
    WHEN name = 'Pub/Sub' THEN 'pub-sub'
    WHEN name = 'SOME/IP' THEN 'some-ip'
    WHEN name = 'ethers.js' THEN 'ethersjs'
    WHEN name = 'gRPC' THEN 'grpc'
    WHEN name = 'iOS' THEN 'ios'
    WHEN name = 'Fly.io' THEN 'fly-io'
    ELSE
      trim(both '-' from regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'))
  END;
$$;

-- 7) Rozwiązanie tokenu do canonical_id (alias -> canonical, w razie braku tworzy canonical)
CREATE OR REPLACE FUNCTION public.resolve_canonical_technology(raw text)
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
  norm := public.normalize_tech_token(raw);
  IF norm IS NULL THEN
    RETURN NULL;
  END IF;

  -- dodatkowa ochrona: token złożony tylko z cyfr / wersji (normalize czasem już to odfiltrował)
  IF norm ~ '^\d+$'
     OR norm ~ '^\d+\.x$'
     OR (norm ~ '^\d+\.\d+$' AND norm !~ '^\d{3,}\.\d{2,}$')
     OR norm ~ '^[.\-+_]+$'
  THEN
    RETURN NULL;
  END IF;

  SELECT canonical_id, note INTO canon_id, canon_note
  FROM public.technology_aliases
  WHERE alias = norm;

  -- Jeśli alias istnieje, ale wskazuje na usunięty/nieistniejący rekord (mogło zostać po starym schemacie),
  -- ignorujemy go i przechodzimy do wyliczenia/utworzenia canonical.
  IF canon_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM public.technologies_canonical tc WHERE tc.id = canon_id) THEN
      -- jeśli to ręczny alias, traktujemy go jako nadrzędny (nie ruszamy)
      IF canon_note IS DISTINCT FROM 'auto' THEN
        RETURN canon_id;
      END IF;
    ELSE
      canon_id := NULL;
    END IF;
  END IF;

  canon_name := public.pretty_tech_name(norm);
  slug_base := public.tech_slug(canon_name);
  canon_slug := slug_base;

  -- Fuzzy matching literówek:
  -- jeśli nie ma ręcznego aliasu i token jest dość długi, spróbuj dopasować do istniejących kanonów.
  -- Uwaga: robimy to PRZED tworzeniem nowego kanonu, żeby nie mnożyć bytów przez literówki.
  IF (canon_note IS NULL OR canon_note LIKE 'auto%') AND length(norm) >= 6 THEN
    SELECT tc.id,
           similarity(public.normalize_tech_token(tc.name), norm) AS sim
      INTO best_id, best_sim
    FROM public.technologies_canonical tc
    ORDER BY sim DESC
    LIMIT 1;

    IF best_id IS NOT NULL AND best_sim >= 0.87 THEN
      -- dopnij alias (auto_fuzzy) żeby kolejne przebudowy były stabilne
      INSERT INTO public.technology_aliases (alias, canonical_id, note)
      VALUES (norm, best_id, 'auto_fuzzy')
      ON CONFLICT (alias) DO UPDATE
        SET canonical_id = excluded.canonical_id,
            note = excluded.note
        WHERE public.technology_aliases.note LIKE 'auto%';

      RETURN best_id;
    END IF;
  END IF;

  -- Jeśli slug już istnieje dla innej nazwy, dodaj deterministyczny sufiks.
  -- Dzięki temu nie mieszamy różnych technologii w jedną przez slug.
  IF EXISTS (
    SELECT 1
    FROM public.technologies_canonical tc
    WHERE tc.slug = canon_slug
      AND tc.name <> canon_name
  ) THEN
    canon_slug := canon_slug || '-' || substring(md5(canon_name) for 6);
  END IF;

  -- (bardzo rzadkie) jeśli nadal kolizja, dobij licznik
  IF EXISTS (SELECT 1 FROM public.technologies_canonical tc WHERE tc.slug = canon_slug AND tc.name <> canon_name) THEN
    canon_slug := canon_slug || '-2';
  END IF;

  -- jeśli ktoś ręcznie dodał w międzyczasie, dociągnij
  SELECT id INTO canon_id
  FROM public.technologies_canonical
  WHERE name = canon_name;

  IF canon_id IS NULL THEN
    -- wstaw, ale jeśli name już istnieje (wyścig), po prostu pobierz id
    INSERT INTO public.technologies_canonical (name, slug)
    VALUES (canon_name, canon_slug)
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO canon_id;

    IF canon_id IS NULL THEN
      SELECT id INTO canon_id
      FROM public.technologies_canonical
      WHERE name = canon_name;
    END IF;
  END IF;

  -- alias auto: stabilizuj, ale pozwól też na "remap" gdy reguły kanonu się zmienią
  -- (np. "angular 8+" wcześniej mapowało do "Angular 8+", a teraz chcemy "Angular")
  INSERT INTO public.technology_aliases (alias, canonical_id, note)
  VALUES (norm, canon_id, 'auto')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id
    WHERE public.technology_aliases.note LIKE 'auto%';

  RETURN canon_id;
END;
$$;

-- 8) Przebudowa relacji dla jednego kandydata
CREATE OR REPLACE FUNCTION public.rebuild_candidate_technologies_for_candidate(p_candidate_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  tech_csv text;
BEGIN
  SELECT technologies INTO tech_csv
  FROM public.candidates
  WHERE id = p_candidate_id;

  DELETE FROM public.candidate_technologies
  WHERE candidate_id = p_candidate_id;

  IF tech_csv IS NULL OR trim(tech_csv) = '' THEN
    RETURN;
  END IF;

  INSERT INTO public.candidate_technologies (candidate_id, technology_id)
  SELECT p_candidate_id, s.technology_id
  FROM (
    SELECT public.resolve_canonical_technology(trim(z)) AS technology_id
    FROM regexp_split_to_table(tech_csv, '[,;\r\n]+') AS x
    CROSS JOIN LATERAL regexp_split_to_table(x, '[/\\|&]+') AS y
    CROSS JOIN LATERAL regexp_split_to_table(y, '\\s+(?:and|oraz|i)\\s+|\\s+\\+\\s+') AS z
    WHERE trim(z) IS NOT NULL AND trim(z) <> ''
  ) s
  WHERE s.technology_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$;

-- 9) Przebudowa relacji dla całej bazy
CREATE OR REPLACE FUNCTION public.rebuild_candidate_technologies()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  r record;
BEGIN
  TRUNCATE TABLE public.candidate_technologies;

  FOR r IN SELECT id FROM public.candidates LOOP
    PERFORM public.rebuild_candidate_technologies_for_candidate(r.id);
  END LOOP;
END;
$$;

-- 9c) Publiczny VIEW z kanonicznymi technologiami (CSV)
--     Zwraca ten sam zestaw pól co `public_candidates`, ale `technologies` jest już ustandaryzowane.
CREATE OR REPLACE VIEW public.public_candidates_normalized AS
SELECT
  c.id,
  c.slug,
  c.role,
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
WHERE c.slug IS NOT NULL;

GRANT SELECT ON public.public_candidates_normalized TO anon;
GRANT SELECT ON public.public_candidates_normalized TO authenticated;

-- 9b) Trigger: automatyczna przebudowa relacji po zmianie technologies
CREATE OR REPLACE FUNCTION public.trg_candidates_rebuild_candidate_tech()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- jeśli technologies się nie zmieniło, nie rób nic
  IF TG_OP = 'UPDATE' THEN
    IF coalesce(NEW.technologies, '') = coalesce(OLD.technologies, '') THEN
      RETURN NEW;
    END IF;
  END IF;

  PERFORM public.rebuild_candidate_technologies_for_candidate(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS candidates_rebuild_candidate_tech ON public.candidates;
CREATE TRIGGER candidates_rebuild_candidate_tech
AFTER INSERT OR UPDATE OF technologies ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.trg_candidates_rebuild_candidate_tech();

-- 10) Seed aliasów (ręczne wyjątki / literówki / warianty nieobsługiwane przez pretty_tech_name)
--     Alias musi być w formie normalize_tech_token(...)
--
--     WAŻNE: normalize_tech_token usuwa nawiasy i wersje, więc np.:
--       aws(basic), aws(ec), aws(lambda) → wszystkie normalizują się do "aws"
--     Wstawiamy tylko UNIKALNE znormalizowane tokeny, po jednym na alias.
DO $$
DECLARE
  id_dotnet uuid;
  id_junit uuid;
  id_angular uuid;
  id_react uuid;
  id_spring_boot uuid;
  id_docker uuid;
  id_aws uuid;
  id_azure uuid;
  id_javascript uuid;
  id_sass uuid;
  id_css uuid;
  id_sql uuid;
  id_scrum uuid;
  id_cicd uuid;
  id_rest uuid;
  id_confluence uuid;
  id_elasticsearch uuid;
  id_ddd uuid;
  id_pwa uuid;
  id_wcag uuid;
  id_eda uuid;
  id_agile uuid;
  id_jira uuid;
BEGIN
  id_dotnet := public.resolve_canonical_technology('.net');
  id_junit := public.resolve_canonical_technology('junit');
  id_angular := public.resolve_canonical_technology('angular');
  id_react := public.resolve_canonical_technology('react');
  id_spring_boot := public.resolve_canonical_technology('spring boot');
  id_docker := public.resolve_canonical_technology('docker');
  id_aws := public.resolve_canonical_technology('aws');
  id_azure := public.resolve_canonical_technology('azure');
  id_javascript := public.resolve_canonical_technology('javascript');
  id_sass := public.resolve_canonical_technology('sass');
  id_css := public.resolve_canonical_technology('css');
  id_sql := public.resolve_canonical_technology('sql');
  id_scrum := public.resolve_canonical_technology('scrum');
  id_cicd := public.resolve_canonical_technology('ci/cd');
  id_rest := public.resolve_canonical_technology('rest');
  id_confluence := public.resolve_canonical_technology('confluence');
  id_elasticsearch := public.resolve_canonical_technology('elasticsearch');
  id_ddd := public.resolve_canonical_technology('ddd');
  id_pwa := public.resolve_canonical_technology('pwa');
  id_wcag := public.resolve_canonical_technology('wcag');
  id_eda := public.resolve_canonical_technology('event driven architecture');
  id_agile := public.resolve_canonical_technology('agile');
  id_jira := public.resolve_canonical_technology('jira');

  INSERT INTO public.technology_aliases(alias, canonical_id, note) VALUES
    -- .NET warianty
    (public.normalize_tech_token('.net(c)'), id_dotnet, 'manual'),
    (public.normalize_tech_token('.net core'), id_dotnet, 'manual'),
    (public.normalize_tech_token('dot net'), id_dotnet, 'manual'),
    (public.normalize_tech_token('.net framewrok'), id_dotnet, 'manual'),

    -- JUnit
    (public.normalize_tech_token('junity'), id_junit, 'manual'),

    -- Angular
    (public.normalize_tech_token('agular'), id_angular, 'manual'),
    (public.normalize_tech_token('angular angularjs'), id_angular, 'manual'),
    (public.normalize_tech_token('angular.js c#'), id_angular, 'manual'),
    (public.normalize_tech_token('angular v'), id_angular, 'manual'),
    (public.normalize_tech_token('angular jwt'), id_angular, 'manual'),
    (public.normalize_tech_token('angular signals'), id_angular, 'manual'),
    (public.normalize_tech_token('angular cli'), id_angular, 'manual'),

    -- React
    (public.normalize_tech_token('simple bug investigation and fixing (react'), id_react, 'manual'),

    -- Spring Boot
    (public.normalize_tech_token('boot 2'), id_spring_boot, 'manual'),

    -- JavaScript
    (public.normalize_tech_token('es6'), id_javascript, 'manual'),
    (public.normalize_tech_token('ecmascript'), id_javascript, 'manual'),

    -- CSS / Sass
    (public.normalize_tech_token('css3 sass'), id_sass, 'manual'),
    (public.normalize_tech_token('css3 sass scss'), id_sass, 'manual'),

    -- AWS
    (public.normalize_tech_token('aws a b tests'), id_aws, 'manual'),
    (public.normalize_tech_token('chmura publiczna(aws'), id_aws, 'manual'),

    -- Azure
    (public.normalize_tech_token('azure integrations'), id_azure, 'manual'),

    -- Confluence
    (public.normalize_tech_token('conuence'), id_confluence, 'manual'),

    -- Scrum
    (public.normalize_tech_token('scrumm'), id_scrum, 'manual'),
    (public.normalize_tech_token('csm'), id_scrum, 'manual'),

    -- CI/CD
    (public.normalize_tech_token('ci cd pipelines'), id_cicd, 'manual'),
    (public.normalize_tech_token('continous integration'), id_cicd, 'manual'),

    -- REST
    (public.normalize_tech_token('rest soap integration'), id_rest, 'manual'),
    (public.normalize_tech_token('restfull(jax rs'), id_rest, 'manual'),

    -- SQL
    (public.normalize_tech_token('relacyjne bazy danych(sql'), id_sql, 'manual'),

    -- Docker
    (public.normalize_tech_token('docker mysql'), id_docker, 'manual'),
    (public.normalize_tech_token('docker containers'), id_docker, 'manual'),
    (public.normalize_tech_token('docker machine'), id_docker, 'manual'),

    -- ELK / Elasticsearch
    (public.normalize_tech_token('elk stack(elasticsearch'), id_elasticsearch, 'manual'),

    -- DDD
    (public.normalize_tech_token('domain driven design(ddd'), id_ddd, 'manual'),

    -- PWA
    (public.normalize_tech_token('progressive web app(pwa'), id_pwa, 'manual'),

    -- WCAG
    (public.normalize_tech_token('accesibility'), id_wcag, 'manual'),

    -- Event-Driven Architecture
    (public.normalize_tech_token('event driven architecture(eda'), id_eda, 'manual'),
    (public.normalize_tech_token('event driven design(edd'), id_eda, 'manual'),

    -- Agile
    (public.normalize_tech_token('agile event driven architecture(eda'), id_agile, 'manual'),

    -- Jira
    (public.normalize_tech_token('atlassian tools(jira'), id_jira, 'manual')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id,
        note = excluded.note
    WHERE public.technology_aliases.note LIKE 'auto%'
       OR public.technology_aliases.note = 'manual';
END $$;

