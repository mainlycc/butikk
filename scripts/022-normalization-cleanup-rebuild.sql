-- ETAP 5: Czyszczenie + pełny rebuild normalizacji
-- Cel: usunąć zduplikowane/błędne wpisy kanoniczne powstałe z pierwszego uruchomienia
--       i przebudować relacje z aktualnymi funkcjami normalize/pretty/resolve.
--
-- WAŻNE: Przed uruchomieniem tego skryptu upewnij się, że skrypty 020 i 021 zostały
--         wykonane (aby zaktualizować funkcje CREATE OR REPLACE).
--
-- Kolejność: 020 → 021 → TUTAJ (022)

BEGIN;

-- ============================================================
-- KROK 1: Wyczyść relacje i dane kanoniczne (zachowaj ręczne aliasy)
-- ============================================================

TRUNCATE TABLE public.candidate_technologies;

UPDATE public.candidates SET canonical_role_id = NULL;

DELETE FROM public.technology_aliases;
DELETE FROM public.technologies_canonical;

DELETE FROM public.role_aliases;
DELETE FROM public.roles_canonical;

-- ============================================================
-- KROK 2: Re-seed ręcznych aliasów technologii
-- ============================================================
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
    (public.normalize_tech_token('.net(c)'), id_dotnet, 'manual'),
    (public.normalize_tech_token('.net core'), id_dotnet, 'manual'),
    (public.normalize_tech_token('dot net'), id_dotnet, 'manual'),
    (public.normalize_tech_token('.net framewrok'), id_dotnet, 'manual'),
    (public.normalize_tech_token('junity'), id_junit, 'manual'),
    (public.normalize_tech_token('agular'), id_angular, 'manual'),
    (public.normalize_tech_token('angular angularjs'), id_angular, 'manual'),
    (public.normalize_tech_token('angular.js c#'), id_angular, 'manual'),
    (public.normalize_tech_token('angular v'), id_angular, 'manual'),
    (public.normalize_tech_token('angular jwt'), id_angular, 'manual'),
    (public.normalize_tech_token('angular signals'), id_angular, 'manual'),
    (public.normalize_tech_token('angular cli'), id_angular, 'manual'),
    (public.normalize_tech_token('simple bug investigation and fixing (react'), id_react, 'manual'),
    (public.normalize_tech_token('boot 2'), id_spring_boot, 'manual'),
    (public.normalize_tech_token('es6'), id_javascript, 'manual'),
    (public.normalize_tech_token('ecmascript'), id_javascript, 'manual'),
    (public.normalize_tech_token('css3 sass'), id_sass, 'manual'),
    (public.normalize_tech_token('css3 sass scss'), id_sass, 'manual'),
    (public.normalize_tech_token('aws a b tests'), id_aws, 'manual'),
    (public.normalize_tech_token('chmura publiczna(aws'), id_aws, 'manual'),
    (public.normalize_tech_token('azure integrations'), id_azure, 'manual'),
    (public.normalize_tech_token('conuence'), id_confluence, 'manual'),
    (public.normalize_tech_token('scrumm'), id_scrum, 'manual'),
    (public.normalize_tech_token('csm'), id_scrum, 'manual'),
    (public.normalize_tech_token('ci cd pipelines'), id_cicd, 'manual'),
    (public.normalize_tech_token('continous integration'), id_cicd, 'manual'),
    (public.normalize_tech_token('rest soap integration'), id_rest, 'manual'),
    (public.normalize_tech_token('restfull(jax rs'), id_rest, 'manual'),
    (public.normalize_tech_token('relacyjne bazy danych(sql'), id_sql, 'manual'),
    (public.normalize_tech_token('docker mysql'), id_docker, 'manual'),
    (public.normalize_tech_token('docker containers'), id_docker, 'manual'),
    (public.normalize_tech_token('docker machine'), id_docker, 'manual'),
    (public.normalize_tech_token('elk stack(elasticsearch'), id_elasticsearch, 'manual'),
    (public.normalize_tech_token('domain driven design(ddd'), id_ddd, 'manual'),
    (public.normalize_tech_token('progressive web app(pwa'), id_pwa, 'manual'),
    (public.normalize_tech_token('accesibility'), id_wcag, 'manual'),
    (public.normalize_tech_token('event driven architecture(eda'), id_eda, 'manual'),
    (public.normalize_tech_token('event driven design(edd'), id_eda, 'manual'),
    (public.normalize_tech_token('agile event driven architecture(eda'), id_agile, 'manual'),
    (public.normalize_tech_token('atlassian tools(jira'), id_jira, 'manual')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id,
        note = excluded.note
    WHERE public.technology_aliases.note LIKE 'auto%'
       OR public.technology_aliases.note = 'manual';
END $$;

-- ============================================================
-- KROK 3: Re-seed ręcznych aliasów ról
-- ============================================================
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
    (public.normalize_role_token('FE Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Front-end Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Frontend Dev'), id_frontend, 'manual'),
    (public.normalize_role_token('Frontend Programista'), id_frontend, 'manual'),
    (public.normalize_role_token('Senior Fronend Dev'), id_frontend, 'manual'),
    (public.normalize_role_token('Senior Front End Developer'), id_frontend, 'manual'),
    (public.normalize_role_token('Senior Frontend'), id_frontend, 'manual'),
    (public.normalize_role_token('Senior Frontend Developer Fullstack Dev'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Frontend Engineer, Ux Consultant'), id_frontend, 'manual'),
    (public.normalize_role_token('BE Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Back-end Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Backend Dev'), id_backend, 'manual'),
    (public.normalize_role_token('Server Side Developer'), id_backend, 'manual'),
    (public.normalize_role_token('API Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Backend Programista'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Backend Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Backend Dev Fullstack Dev'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Backen Fulstack Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Lead Backend Developer Aws Data Engineer'), id_backend, 'manual'),
    (public.normalize_role_token('Full-Stack Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Fullstack Dev'), id_fullstack, 'manual'),
    (public.normalize_role_token('FS Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Fullstack Programista'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Fullstack Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Full Stack Software Engineer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Java Fullstack Developer'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Java Dev Fullstack'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Java Developer Fulstack'), id_fullstack, 'manual'),
    (public.normalize_role_token('Senior Fulstack Java, Senior Security Application Engeiner'), id_fullstack, 'manual'),
    (public.normalize_role_token('Dev Ops Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('DevOps Specialist'), id_devops, 'manual'),
    (public.normalize_role_token('DevOps Inżynier'), id_devops, 'manual'),
    (public.normalize_role_token('Devop Cloud Engeeiner'), id_devops, 'manual'),
    (public.normalize_role_token('Senior Devops'), id_devops, 'manual'),
    (public.normalize_role_token('Senior Devops Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('Staff Devops Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('Cloud Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('Cloud System Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('Azure Cloud Engineer'), id_devops, 'manual'),
    (public.normalize_role_token('Quality Assurance Engineer'), id_qa, 'manual'),
    (public.normalize_role_token('QA Specialist'), id_qa, 'manual'),
    (public.normalize_role_token('Quality Assurance'), id_qa, 'manual'),
    (public.normalize_role_token('Automation Tester'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Test Automation Engineer'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Tester Automatyzujący'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Test Automation Engineer, Senior'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Test Engineer With Python'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Testesr Programista'), id_qa_auto, 'manual'),
    (public.normalize_role_token('Mobile App Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Mobile Programista'), id_mobile, 'manual'),
    (public.normalize_role_token('Senior Mobile Developer, Mid Jr Backend Devloper'), id_mobile, 'manual'),
    (public.normalize_role_token('Senior Ios Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Senior Android Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Android Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Android Developer Staff Engineer'), id_mobile, 'manual'),
    (public.normalize_role_token('iOS Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Ios Team Leader Senior Ios Developer'), id_mobile, 'manual'),
    (public.normalize_role_token('Inżynier Danych'), id_data_eng, 'manual'),
    (public.normalize_role_token('Data Dev'), id_data_eng, 'manual'),
    (public.normalize_role_token('Machine Learning Engineer'), id_ml, 'manual'),
    (public.normalize_role_token('AI Engineer'), id_ml, 'manual'),
    (public.normalize_role_token('AI Developer'), id_ml, 'manual'),
    (public.normalize_role_token('AI/ML Engineer'), id_ml, 'manual'),
    (public.normalize_role_token('UX&UI Designer'), id_ux_ui, 'manual'),
    (public.normalize_role_token('UI/UX Designer'), id_ux_ui, 'manual'),
    (public.normalize_role_token('Web Designer'), id_ux_ui, 'manual'),
    (public.normalize_role_token('Programista'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Developer'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Inżynier Oprogramowania'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Software Engineer Python I C#'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Software Engineer Vp Of Engineering'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Expert Software Engineer'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Mid Senior Software Engineer'), id_sw_eng, 'manual'),
    (public.normalize_role_token('Technical Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Team Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Lead Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Lider Techniczny'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Team Lead Senior Java Dev'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Tech Lead Senior Python Developer Rpa Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Tech Lead Solution Architect Full Stack Senior Java Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Certified Scrum Master'), id_scrum, 'manual'),
    (public.normalize_role_token('CSM'), id_scrum, 'manual'),
    (public.normalize_role_token('Cybersecurity Engineer'), id_security, 'manual'),
    (public.normalize_role_token('InfoSec Engineer'), id_security, 'manual'),
    (public.normalize_role_token('Inżynier Bezpieczeństwa'), id_security, 'manual'),
    (public.normalize_role_token('Embedded Software Engineer'), id_embedded, 'manual'),
    (public.normalize_role_token('Programista Embedded'), id_embedded, 'manual'),
    -- Java-specific roles → Full Stack / Backend
    (public.normalize_role_token('Java Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Java Programmer'), id_backend, 'manual'),
    (public.normalize_role_token('Java Senior'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Java Dev'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Java Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Java Devoloper'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Java Software Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Java Developer Senior, Team Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Java Team Leader, Senior Architect'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Java Tech Lead'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Process Automation Engeineer, Java Mid Developer'), id_backend, 'manual'),
    -- .NET / Python / Architect roles
    (public.normalize_role_token('.NET Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Senior .Net Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Python Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Senior Python Developer'), id_backend, 'manual'),
    (public.normalize_role_token('Solution Architect'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Senior Solution Architect'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Solution Architect Senior Java Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Solution Architect, Cloud Architect, Enterprise Architect'), id_tech_lead, 'manual'),
    (public.normalize_role_token('System Architect, Architect It, Architect Senior Developer'), id_tech_lead, 'manual'),
    (public.normalize_role_token('Aws Cloud Solutions Architect'), id_tech_lead, 'manual')
  ON CONFLICT (alias) DO UPDATE
    SET canonical_id = excluded.canonical_id,
        note = excluded.note;
END $$;

-- ============================================================
-- KROK 4: Pełny rebuild technologii i ról dla WSZYSTKICH kandydatów
-- ============================================================

SELECT public.rebuild_candidate_technologies();
SELECT public.rebuild_candidate_roles();

-- ============================================================
-- KROK 5: Cleanup – usuń osieroconą canonical entries bez powiązań
-- ============================================================
DELETE FROM public.technologies_canonical tc
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidate_technologies ct WHERE ct.technology_id = tc.id
)
AND NOT EXISTS (
  SELECT 1 FROM public.technology_aliases ta WHERE ta.canonical_id = tc.id AND ta.note = 'manual'
);

DELETE FROM public.roles_canonical rc
WHERE NOT EXISTS (
  SELECT 1 FROM public.candidates c WHERE c.canonical_role_id = rc.id
)
AND NOT EXISTS (
  SELECT 1 FROM public.role_aliases ra WHERE ra.canonical_id = rc.id AND ra.note = 'manual'
);

COMMIT;

-- ============================================================
-- KROK 6: Statystyki po rebuild (wykonaj po COMMIT)
-- ============================================================
SELECT 'technologies_canonical' AS tabela, count(*) AS ile FROM public.technologies_canonical
UNION ALL
SELECT 'roles_canonical', count(*) FROM public.roles_canonical
UNION ALL
SELECT 'candidate_technologies', count(*) FROM public.candidate_technologies
UNION ALL
SELECT 'technology_aliases', count(*) FROM public.technology_aliases
UNION ALL
SELECT 'role_aliases', count(*) FROM public.role_aliases;
