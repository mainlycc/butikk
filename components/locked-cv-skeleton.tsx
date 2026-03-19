import { cn } from "@/lib/utils"

interface LockedCvSkeletonProps {
  className?: string
  blurred?: boolean
}

export default function LockedCvSkeleton({ className, blurred = true }: LockedCvSkeletonProps) {
  // This component renders a faux CV layout and then "anonymizes" it:
  // - content is slightly blurred
  // - a translucent blur layer reduces readability
  // - a few "redaction" bars simulate hidden personal data
  const blur = blurred ? "select-none blur-[1.5px] opacity-90" : ""

  return (
    <div className={cn("absolute inset-0 p-6 h-full max-h-full overflow-hidden", className)}>
      {/* CONTENT (looks like a real CV) */}
      <div className={cn("relative", blur)} aria-hidden="true">
        {/* Accent band (adds "designed CV" vibe) */}
        <div className="absolute inset-x-0 -top-6 h-20 bg-gradient-to-r from-primary/18 via-accent/16 to-transparent" />

        {/* Top header */}
        <div className="relative grid grid-cols-12 gap-6 min-w-0 max-w-full overflow-hidden">
          <div className="min-w-0 col-span-8">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/35 to-accent/25 ring-1 ring-border/60" />
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-tight text-foreground">
                  Aleksandra Nowak
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Full‑stack Developer • 6+ lat • React / Node.js
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-blue-600/15 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                    TypeScript
                  </span>
                  <span className="rounded-full bg-blue-600/15 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                    Next.js
                  </span>
                  <span className="rounded-full bg-blue-600/15 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                    Supabase
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-foreground/80">
              Buduję produkty end‑to‑end: od UI (design system, a11y, performance) po backend (API,
              integracje, CI/CD). Lubię mierzalne efekty: krótszy time‑to‑ship i stabilność.
            </p>
          </div>

          {/* Side contact/info column */}
          <div className="min-w-0 col-span-4 space-y-2 text-[10px] text-muted-foreground max-w-full overflow-hidden">
            <div className="rounded-lg border bg-muted/20 p-2">
              <div className="font-medium text-foreground/80">Kontakt</div>
              <div className="mt-1 space-y-1">
                <div className="break-words max-w-full">aleksandra.nowak@domain.com</div>
                <div>+48 600 000 000</div>
                <div>Warszawa / Remote</div>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/20 p-2">
              <div className="font-medium text-foreground/80">Linki</div>
              <div className="mt-1 space-y-1 break-words max-w-full">
                <div>github.com/alnowak</div>
                <div>linkedin.com/in/alnowak</div>
                <div>portfolio.dev/alnowak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px w-full bg-border/60" />

        {/* Main two-column layout */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 space-y-4">
            {/* EXPERIENCE */}
            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">DOŚWIADCZENIE</div>
              <div className="space-y-2 rounded-lg border bg-card/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold text-foreground">Senior Frontend Engineer • FinTech</div>
                    <div className="text-[10px] text-muted-foreground">Warszawa / Remote</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">2022 – 2025</div>
                </div>
                <ul className="ml-4 list-disc space-y-0.5 text-[11px] text-foreground/80 leading-snug">
                  <li>Przebudowa kluczowych widoków: +18% konwersji, -22% drop‑off.</li>
                  <li>Design system + komponenty (Radix/shadcn), spójne UX i a11y.</li>
                  <li>Optymalizacja bundle i RSC: szybszy TTI, mniej regresji.</li>
                </ul>
              </div>
            </section>

            {/* PROJECTS */}
            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">PROJEKTY</div>
              <div className="space-y-2 text-[11px] text-foreground/80">
                <div className="rounded-lg border bg-muted/10 p-3">
                  <div className="font-semibold text-foreground">Platforma rekrutacyjna (B2B)</div>
                  <div className="mt-1">
                    Next.js, Supabase, automatyzacje mailowe, panel admina, analityka. Skupienie na
                    szybkości i czytelności danych.
                  </div>
                </div>
              </div>
            </section>

            {/* EDUCATION */}
            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">EDUKACJA</div>
              <div className="rounded-lg border bg-card/30 p-3 text-[11px] text-foreground/80">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">Informatyka • Politechnika</div>
                    <div className="text-[10px] text-muted-foreground">Specjalizacja: inżynieria oprogramowania</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">2016 – 2020</div>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: skills/stack */}
          <div className="col-span-4 space-y-4">
            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">STACK</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  React
                </span>
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  Next.js
                </span>
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  TS
                </span>
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  Node.js
                </span>
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  Postgres
                </span>
                <span className="rounded-full bg-blue-600/15 px-2 py-1 text-[10px] font-medium text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-600/20">
                  CI/CD
                </span>
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">UMIEJĘTNOŚCI</div>
              <div className="rounded-lg border bg-muted/10 p-3 text-[11px] text-foreground/80">
                <div>Architektura FE • DX • testy • performance • a11y</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Jira, GitHub Actions, monitoring</div>
              </div>
            </section>

            <section className="space-y-2">
              <div className="text-[11px] font-semibold tracking-wide text-primary">JĘZYKI</div>
              <div className="space-y-2">
                <div className="rounded-lg border bg-card/30 px-3 py-2 text-[11px] text-foreground/80">
                  Polski (C2) • Angielski (B2/C1)
                </div>
                <div className="rounded-lg border bg-card/30 px-3 py-2 text-[11px] text-foreground/80">
                  Dostępność: 2 tygodnie
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ANONYMIZATION layer: blur wash + redactions + subtle noise */}
      {blurred && (
        <>
          {/* blur wash */}
          <div
            className="pointer-events-none absolute inset-0 bg-background/25 backdrop-blur-[1px]"
            aria-hidden="true"
          />

          {/* redaction bars (simulate hidden personal data) */}
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute left-10 top-10 h-3 w-40 rounded bg-foreground/25" />
            <div className="absolute right-10 top-16 h-3 w-28 rounded bg-foreground/25" />
            <div className="absolute right-10 top-24 h-3 w-36 rounded bg-foreground/20" />
            <div className="absolute left-10 top-28 h-3 w-56 rounded bg-foreground/15" />
          </div>

          {/* subtle noise */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.35), rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)",
            }}
            aria-hidden="true"
          />
        </>
      )}
    </div>
  )
}

