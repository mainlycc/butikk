import Image from "next/image"
import Link from "next/link"
import { Check, Fingerprint } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Wgraj zdjęcia ręcznie do public/perspectives/
const CANDIDATE_IMAGE = "/perspectives/kandydat.jpg"
const RECRUITER_IMAGE = "/perspectives/rekruter.jpg"

const CANDIDATE_BENEFITS = [
  "Pełna anonimowość do momentu Twojej decyzji",
  "Umiejętności potwierdzone w praktyce",
  "Oferty zgodne z Twoimi oczekiwaniami",
] as const

const RECRUITER_BENEFITS = [
  "Dostęp do kandydatów otwartych na zmianę",
  "Profile oparte na realnych kompetencjach",
  "Przejrzysty proces selekcji",
] as const

const TRUST_PORTRAITS = [
  {
    src: "/hero/portraits/portrait-1.svg",
    className: "absolute left-[2%] top-1/2 -translate-y-1/2 w-20 h-24 sm:w-28 sm:h-32 opacity-15 rotate-[-6deg]",
  },
  {
    src: "/hero/portraits/portrait-3.svg",
    className: "absolute left-[8%] bottom-0 w-16 h-20 sm:w-24 sm:h-28 opacity-10 rotate-[4deg] hidden sm:block",
  },
  {
    src: "/hero/portraits/portrait-2.svg",
    className: "absolute right-[2%] top-1/2 -translate-y-1/2 w-20 h-24 sm:w-28 sm:h-32 opacity-15 rotate-[6deg]",
  },
  {
    src: "/hero/portraits/portrait-4.svg",
    className: "absolute right-[8%] bottom-0 w-16 h-20 sm:w-24 sm:h-28 opacity-10 rotate-[-4deg] hidden sm:block",
  },
] as const

export function DualPerspectiveSection() {
  return (
    <section className="border-t bg-white">
      <div className="section-container py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Dla kandydatów i rekruterów
          </p>
          <h2 className="text-3xl text-foreground sm:text-4xl">Dwie perspektywy, jeden cel</h2>
          <p className="text-lg text-muted-foreground">
            Platforma zaprojektowana, aby wspierać zarówno rozwój kariery, jak i efektywne budowanie
            zespołów.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-0 md:mt-12 md:grid-cols-2">
          <DarkPanel
            id="dla-kandydata"
            title="Dla Kandydata"
            description="Buduj karierę na własnych zasadach. Bez presji i zbędnych rozmów. Zachowaj anonimowość, pokaż swoje kompetencje i rozmawiaj tylko z firmami, które naprawdę pasują."
            ctaLabel="Zarejestruj się jako kandydat"
            ctaHref="/kandydat"
          />

          <ImagePanel src={CANDIDATE_IMAGE} alt="Kandydat" benefits={CANDIDATE_BENEFITS} />

          <ImagePanel src={RECRUITER_IMAGE} alt="Rekruter" benefits={RECRUITER_BENEFITS} />

          <DarkPanel
            id="dla-rekrutera"
            title="Dla Rekrutera"
            description="Docieraj do właściwych kandydatów. Szybciej i skuteczniej. Bez przypadkowych zgłoszeń i bez straty czasu."
            ctaLabel="Stwórz profil rekrutera"
            ctaHref="/rekruter"
          />
        </div>

        <TrustFooter />
      </div>
    </section>
  )
}

function DocumentIcon() {
  return (
    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-[4px] bg-white/10" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="12" height="14" rx="1" stroke="white" strokeWidth="1.5" />
        <line x1="7" y1="7" x2="13" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="10" x2="11" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="13" x2="13" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function DarkPanel({
  id,
  title,
  description,
  ctaLabel,
  ctaHref,
}: {
  id: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div
      id={id}
      style={{ backgroundColor: "#1a1a1a" }}
      className="scroll-mt-20 flex min-h-[300px] flex-col justify-between p-8 text-white sm:min-h-[360px] sm:p-10 md:aspect-square md:min-h-0"
    >
      <div>
        <DocumentIcon />
        <h3 className="text-xl font-medium text-white sm:text-2xl">{title}</h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{description}</p>
      </div>
      <Button
        asChild
        className="mt-8 h-11 w-full rounded-[4px] text-[11px] font-semibold uppercase tracking-[0.14em] sm:w-auto sm:px-6"
      >
        <Link href={ctaHref}>{ctaLabel}</Link>
      </Button>
    </div>
  )
}

function ImagePanel({
  src,
  alt,
  benefits,
}: {
  src: string
  alt: string
  benefits: readonly string[]
}) {
  return (
    <div className="relative min-h-[300px] overflow-hidden bg-neutral-200 md:aspect-square">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      <div className="absolute bottom-4 left-4 flex max-w-[90%] flex-col gap-2 sm:bottom-6 sm:left-6">
        {benefits.map((label) => (
          <BenefitBadge key={label} label={label} />
        ))}
      </div>
    </div>
  )
}

function BenefitBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs shadow-sm sm:text-sm">
      <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
      <span className="text-foreground">{label}</span>
    </div>
  )
}

function TrustFooter() {
  return (
    <div className="relative mt-10 overflow-hidden sm:mt-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {TRUST_PORTRAITS.map((portrait) => (
          <Image
            key={portrait.src}
            src={portrait.src}
            alt=""
            width={112}
            height={128}
            className={cn(portrait.className)}
            unoptimized
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-xl flex-col items-center gap-2 px-4 text-center">
        <Fingerprint className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Wszelkie dane kandydatów i rekruterów są chronione
        </p>
        <p className="text-sm text-muted-foreground/80">
          Wszelkie dane kandydatów i rekruterów są chronione
        </p>
      </div>
    </div>
  )
}
