This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## SEO – zasady indeksacji, canonicale i robots

- **Globalne ustawienia SEO**
  - Globalne `metadata` są zdefiniowane w `app/layout.tsx` (tytuł, opis, Open Graph, Twitter, domyślne `robots: { index: true, follow: true }`).
  - `metadataBase` jest ustawione na `NEXT_PUBLIC_APP_URL` (fallback `https://www.qualibase.pl`), co zapewnia poprawne generowanie absolutnych URL-i.

- **Meta robots (index/noindex)**
  - Strony publiczne (np. `/`, `/kandydaci`, profile kandydatów) domyślnie dziedziczą `index,follow`.
  - Strony techniczne/systemowe (np. `/app/login`, `/register`) jawnie ustawiają:
    - `robots: { index: false, follow: true }` w swoich `metadata`.
  - Dla listingów kandydatów (`/kandydaci`, `/kandydaci/[rola]`, `/kandydaci/[rola]/[technologia]`, `/kandydaci/[rola]/[technologia]/[lokalizacja]`):
    - w `generateMetadata` zastosowana jest logika: jeśli liczba kandydatów `< 5`, strona otrzymuje `robots: { index: false }` (ochrona thin content).

- **Canonicale**
  - Dla strony głównej oraz wybranych podstron (`/`, `/kontakt`, `/register`, `/app/login` itd.) canonical jest ustawiony przez pole `alternates: { canonical: ... }` w `metadata`.
  - Dla listingów kandydatów canonicale są generowane helperem:
    - `lib/seo/listing-content.ts` – funkcja `getListingCanonicalUrl` buduje kanoniczny URL na podstawie segmentów ścieżki (`/kandydaci`, `/kandydaci/[rola]`, itd.) bez parametrów query.
  - Dzięki temu:
    - listingi mają jeden stabilny, kanoniczny adres URL niezależnie od technicznych parametrów (gdyby zostały dodane np. do nawigacji po wielu profilach),
    - inne strony mogą nadpisywać canonical per-strona przez `metadata.alternates.canonical`.

- **Strukturyzowane dane (structured data)**
  - W `lib/seo/structured-data.ts` znajdują się helpery:
    - `getOrganizationSchema`, `getWebSiteSchema`, `getBreadcrumbSchema`.
  - W `app/layout.tsx` wstawiane są globalne schematy Organization i WebSite jako `application/ld+json`.
  - Listingi i profile kandydatów używają `getBreadcrumbSchema` oraz (dla profilu kandydata) dedykowanego schematu `Person`.

- **Robots.txt i sitemap**
  - `app/robots.ts`:
    - Zezwala na indeksację kluczowych ścieżek publicznych (`/`, `/kandydaci`, `/kandydat`, `/rekruter`, `/o-nas`, `/kontakt`, `/polityka-prywatnosci`).
    - Blokuje m.in. `/app`, `/api`, `/register`, `/reset-password`, `/update-password`, `/accept-invite`.
    - Ustawia link do sitemapy: `sitemap: <baseUrl>/sitemap.xml`.
  - `app/sitemap.ts` generuje dynamiczną sitemapę:
    - Zawiera strony statyczne (home, `/kandydaci`, `/kandydat`, `/rekruter`, `/o-nas`, `/kontakt`).
    - Zawiera listingi kandydatów (na podstawie danych z `lib/data/candidates-queries.ts`).
    - Zawiera profile kandydatów (slugowane URL-e `kandydat/[slug]`).

- **Unikanie duplikacji treści**
  - `next.config.ts` definiuje redirecty 301 dla historycznych/alternatywnych ścieżek (np. `/main` → `/`, `/database` → `/app/kandydaci`).
  - Canonicale są oparte na głównym `baseUrl` i nie uwzględniają parametrów query, co redukuje ryzyko duplikacji wynikającej z parametrów technicznych.

- **Jak dodawać nowe strony z poprawnym SEO**
  - Używaj `export const metadata` lub `export async function generateMetadata()` w plikach znajdujących się w `app/`.
  - Ustaw:
    - `title`, `description`,
    - opcjonalnie `alternates.canonical` – zwłaszcza dla stron kluczowych z punktu widzenia SEO,
    - `robots` – np. `index: false` dla stron technicznych (logowanie, panele, redirect-only, itp.).
  - Dla nowych listingów lub stron z filtrowaniem:
    - Rozważ użycie istniejącego helpera `getListingCanonicalUrl` lub dodanie podobnego helpera, który:
      - buduje canonical bez parametrów technicznych (np. `utm_*`, `gclid`),
      - pozwala w razie potrzeby decydować, które kombinacje filtrów są indeksowane (np. poprzez warunek i nadpisanie `robots`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
