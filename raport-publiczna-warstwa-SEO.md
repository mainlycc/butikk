# Raport SEO – publiczna warstwa aplikacji

## 1. Publiczna warstwa SEO (oddzielenie od części aplikacyjnej)

- **Wydzielenie publicznej struktury stron**
  - Zastosowano grupę routingu `app/(public)` dla stron publicznych (landing, kandydaci, pojedynczy kandydat, rekruter, o nas, kontakt, polityka prywatności itd.).
  - Część aplikacyjna (panel/logika po zalogowaniu) działa w osobnej grupie `app/(app)` z własnym layoutem i nawigacją boczną.
  - Dzięki temu roboty wyszukiwarek widzą czystą, publiczną strukturę URL (bez elementów panelu) oraz logiczny podział na podstrony ofertowe/marketingowe.

- **Osobny layout zoptymalizowany pod SEO**
  - Globalny layout `app/layout.tsx` definiuje bazowe meta dane: tytuł, opis, słowa kluczowe, Open Graph, Twitter, robots, favicony oraz `metadataBase`.
  - W warstwie publicznej (`app/(public)/layout.tsx`) przygotowano osobny layout z nawigacją górną i stopką, tak aby publiczne strony miały spójny, lekki układ bez elementów panelu.
  - Strony publiczne (np. landing w `app/(public)/page.tsx`, listing kandydatów w `app/(public)/kandydaci/page.tsx`) posiadają własne meta dane (tytuł, opis, canonical, OG, Twitter), często generowane dynamicznie na podstawie treści.
  - Dodano dane strukturalne JSON‑LD (Organization, WebSite, BreadcrumbList) przez helpery w `lib/seo`, co poprawia widoczność w wyszukiwarce.

- **Optymalizacja struktury nagłówków i semantyki HTML**
  - Na stronach publicznych zastosowano jedną główną etykietę `h1` na stronę (np. hero na landing page, tytuł listingu kandydatów), a kolejne sekcje korzystają z `h2` i niższych poziomów, co tworzy czytelną hierarchię.
  - Publiczny layout wykorzystuje semantyczne bloki (`<main>`, nagłówek i stopka przez dedykowane komponenty), a treści osadzone są głównie w akapitach `<p>`, listach i kartach, bez nadużywania elementów nie‑semantycznych.
  - Na stronach listingu i szczegółów kandydatów treść opisowa (nagłówki, opisy, listy tagów) jest generowana tak, aby była zrozumiała kontekstowo dla użytkownika i wyszukiwarek (opis roli, technologii, lokalizacji, liczby kandydatów).
  - Formularze (np. rejestracja kandydata) mają wyraźne tytuły (`h1`) oraz logicznie oznaczone pola, co poprawia zarówno UX, jak i czytelność dla crawlerów.

## 2. SEO-friendly listing kandydatów

- **Struktura URL: rola / technologia / lokalizacja**
  - Zaimplementowano pełne drzewo routingu w `app/(public)/kandydaci`: `/kandydaci`, `/kandydaci/[rola]`, `/kandydaci/[rola]/[technologia]`, `/kandydaci/[rola]/[technologia]/[lokalizacja]`.
  - Każdy poziom ma własny plik `page.tsx`, dzięki czemu adresy URL są czytelne semantycznie i dobrze opisują zawartość strony.

- **Strony kategorii oraz kombinacji (cross)**
  - Dla samych ról, rola+technologia oraz rola+technologia+lokalizacja przygotowano osobne strony z dedykowaną logiką filtrowania kandydatów (`getPublicCandidates`).
  - Każda kombinacja generuje własne meta dane (tytuł, opis, canonical, Open Graph) na podstawie helperów w `lib/seo/listing-content.ts`.

- **Renderowanie po stronie serwera (SSR)**
  - Strony listingów kandydatów są asynchronicznymi komponentami serwerowymi Next.js (brak `"use client"`), pobierają dane po stronie serwera i renderują HTML gotowy do indeksowania.
  - Wykorzystanie SSR zapewnia dostępność pełnej treści listingu już przy pierwszym załadowaniu, co jest korzystne zarówno dla SEO, jak i dla użytkowników.

## 3. Kontrola indeksacji i struktury SEO

- **Konfiguracja meta robots (index / noindex)**
  - Globalna konfiguracja w `app/layout.tsx` ustawia domyślnie `index, follow` dla publicznych stron, z rozszerzonym `googleBot`.
  - Dla listingów kandydatów zastosowano warunek `robots: { index: false }` przy niskiej liczbie wyników (`count < 5`), aby ograniczyć indeksowanie „cienkich” stron.
  - Plik `app/robots.ts` doprecyzowuje, które ścieżki są do indeksowania (landing, listingi, strony informacyjne), a które są blokowane (`/app`, ścieżki auth, API).

- **Ustawienie canonicali**
  - Landing i wszystkie kluczowe strony publiczne definiują `alternates.canonical`, co wskazuje wyszukiwarce preferowaną wersję adresu.
  - Listing główny `/kandydaci` oraz warianty z rolą/technologią/lokalizacją korzystają z helpera `getListingCanonicalUrl`, który generuje spójne canonicale dla każdej kombinacji i strony paginacji.

- **Obsługa parametrów filtrowania pod kątem SEO**
  - Filtry rola/technologia/lokalizacja są odwzorowane w segmentach ścieżki (np. `/kandydaci/frontend/react/krakow`), a nie w parametrach typu `?role=...`, co sprzyja SEO i czytelności URL.
  - Parametry zapytania (`searchParams`) są wykorzystywane tylko do obsługi paginacji (`page`), a ich wpływ na canonicale jest kontrolowany przez `getListingCanonicalUrl`.

- **Zabezpieczenie przed duplikacją treści**
  - Połączenie świadomych canonicali, filtrów w ścieżce, a także wyłączania indeksowania słabych listingów zmniejsza ryzyko duplikacji treści i „thin content”.
  - `app/sitemap.ts` generuje sitemapę jedynie dla wybranych, indeksowalnych listingów (na podstawie `getIndexableListingPaths`), dzięki czemu do wyszukiwarek trafiają tylko wartościowe strony.

## 4. Dynamiczna sitemap

- **Generowanie mapy strony na podstawie bazy danych**
  - Plik `app/sitemap.ts` generuje sitemapę dynamicznie, przy każdym wywołaniu, na podstawie aktualnych danych z tabeli `public_candidates` w Supabase.
  - Wykorzystywane są helpery `getAllPublicSlugs` oraz `getIndexableListingPaths`, które odczytują bieżące rekordy kandydatów (slugi, role, technologie, lokalizacje).

- **Uwzględnienie profili kandydatów i stron kategorii**
  - Do sitemapy trafiają zarówno statyczne strony (landing, kontakt, o nas, kandydat/rekruter), jak i listingi kategorii oparte na roli, technologii i lokalizacji.
  - Każdy publiczny profil kandydata (`/kandydat/{slug}`) jest dodawany na podstawie listy slugów zwróconej przez `getAllPublicSlugs`.

- **Aktualizacja przy dodaniu lub usunięciu rekordów**
  - Ponieważ zapytania w `getAllPublicSlugs` i `getIndexableListingPaths` odwołują się zawsze do bieżącej zawartości `public_candidates`, każda zmiana w bazie (dodanie, modyfikacja, usunięcie kandydata) automatycznie wpływa na sitemapę.
  - Nie ma potrzeby ręcznej aktualizacji – sitemapę odświeża sama aplikacja przy kolejnym wygenerowaniu.

## 5. Konfiguracja rewalidacji i obsługa usuwania profili

- **Wdrożenie ISR (automatyczne odświeżanie treści)**
  - Publiczne listingi i profile kandydatów korzystają z bezpośrednich zapytań do Supabase (`getPublicCandidates`, `getCandidateBySlug`) wykonywanych na serwerze przy każdym żądaniu.
  - Zamiast klasycznego ISR opartego o cache statycznych plików, dane w warstwie publicznej są zawsze pobierane „na świeżo” z bazy, co zapewnia bieżącą treść bez okna staleness.

- **Poprawna obsługa 404/410 dla usuniętych rekordów**
  - Dla profilu publicznego kandydata (`app/(public)/kandydat/[slug]/page.tsx`) w przypadku braku rekordu `getCandidateBySlug` zwracany jest `notFound()`, co przekłada się na stronę 404 po stronie Next.js.
  - Również w `generateMetadata` obsłużono brak kandydata, zwracając tytuł informujący o braku profilu, co zapobiega prezentowaniu mylących meta danych.

- **Zapewnienie aktualności danych w warstwie publicznej**
  - Wszystkie główne widoki publiczne (listing kandydatów, profile, sitemap, meta dane zależne od liczby rekordów) są oparte o aktualne zapytania do tabeli `public_candidates`.
  - Dzięki temu dodanie, edycja lub usunięcie kandydata jest od razu widoczne zarówno na stronach publicznych, jak i w generowanych meta danych oraz sitemapie.

## Podsumowanie

Publiczna warstwa aplikacji została **oddzielona od części aplikacyjnej**, wyposażona w **dedykowany layout pod SEO**, **uporządkowaną strukturę nagłówków i semantykę HTML**, **SEO‑friendly listing kandydatów**, mechanizmy **kontroli indeksacji, canonicali i filtrowania bez duplikacji treści**, **dynamiczną sitemapę opartą o bazę danych** oraz **bieżące odświeżanie treści i poprawną obsługę usuwanych profili**. Razem tworzy to solidną bazę pod dalsze działania SEO (rozbudowę treści, linkowanie wewnętrzne, kolejne dane strukturalne).

