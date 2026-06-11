import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BRAND_LOGO_PATH } from '@/lib/brand'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    title: 'Ułatwiamy proces rekrutacji',
    description:
      'Szybkie dopasowanie kandydatów do ofert pracy dzięki zaawansowanym algorytmom AI i weryfikacji umiejętności.',
  },
  {
    title: 'Wspieramy rozwój zawodowy',
    description:
      'Oferujemy ekskluzywne zasoby, mentoring i ścieżki rozwoju, które przyspieszają karierę w branży IT.',
  },
  {
    title: 'Budujemy zaufaną społeczność',
    description:
      'Cenimy każde zgłoszenie i każdego użytkownika. Tworzymy bezpieczne środowisko dla profesjonalistów IT.',
  },
] as const

const MOCK_CANDIDATES = [
  { name: 'Mariusz', role: 'Frontend Developer', tagClass: 'bg-primary/15 text-primary' },
  { name: 'Cezary', role: 'Backend Developer', tagClass: 'bg-sky-100 text-sky-700' },
  { name: 'Anna', role: 'UI Designer', tagClass: 'bg-pink-100 text-pink-700' },
  { name: 'Piotr', role: 'DevOps Engineer', tagClass: 'bg-emerald-100 text-emerald-700' },
  { name: 'Kasia', role: 'Product Manager', tagClass: 'bg-amber-100 text-amber-800' },
] as const

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-primary/12 text-primary">
        <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      </div>
      <div className="space-y-1.5 pt-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </li>
  )
}

function RecruiterAppMockup() {
  return (
    <div className="flex h-full min-h-[280px] overflow-hidden rounded-tl-[4px] bg-white shadow-xl">
      <aside className="hidden w-[72px] shrink-0 border-r border-black/5 bg-[#fafafa] p-3 sm:flex sm:w-[88px] sm:flex-col sm:items-center sm:gap-4">
        <img src={BRAND_LOGO_PATH} alt="" className="h-5 w-auto max-w-[64px] object-contain" />
        <div className="mt-2 w-full space-y-2">
          <div className="mx-auto h-8 w-8 rounded-[4px] bg-primary/15" />
          <div className="mx-auto h-8 w-8 rounded-[4px] bg-black/5" />
          <div className="mx-auto h-8 w-8 rounded-[4px] bg-black/5" />
        </div>
      </aside>

      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="mb-4 flex h-9 items-center rounded-[4px] border border-black/8 bg-[#f7f7f8] px-3">
          <div className="h-2 w-24 rounded-full bg-black/10" />
        </div>

        <div className="space-y-2.5">
          {MOCK_CANDIDATES.map((candidate) => (
            <div
              key={candidate.name}
              className="flex items-center justify-between gap-3 rounded-[4px] border border-black/6 bg-white px-3 py-2.5"
            >
              <span className="truncate text-sm font-medium text-foreground">{candidate.name}</span>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium',
                  candidate.tagClass
                )}
              >
                {candidate.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RecruiterPromoCard() {
  return (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-[4px] bg-primary lg:flex-row">
      <div className="flex flex-col justify-center p-8 lg:w-[38%] lg:shrink-0 xl:w-[36%]">
        <h3 className="text-xl font-medium text-white sm:text-2xl">Funkcje dla Rekruterów</h3>
        <p className="mt-2 text-sm text-white/85">Dostępne tylko dla zalogowanych.</p>
        <Button
          asChild
          className="mt-6 h-11 w-fit rounded-[4px] bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1a1a1a] hover:bg-white/90"
        >
          <Link href="/rekruter">Załóż darmowe konto</Link>
        </Button>
      </div>

      <div className="flex flex-1 bg-primary p-4 pt-0 lg:py-4 lg:pr-0 lg:pl-2">
        <div className="h-full min-h-[280px] w-full lg:min-h-0">
          <RecruiterAppMockup />
        </div>
      </div>
    </div>
  )
}

export function AboutSection() {
  return (
    <section id="o-nas" className="relative overflow-hidden border-t bg-background scroll-mt-20">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 100% 100%, oklch(0.93 0.07 92) 0%, transparent 68%), radial-gradient(ellipse 35% 35% at 0% 90%, oklch(0.96 0.04 95) 0%, transparent 62%)',
        }}
      />

      <div className="section-container relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            O nas
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.15] text-foreground">
            Qualibase to platforma dla rekruterów i kandydatów z branży IT.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="space-y-8">
            <ul className="space-y-7">
              {FEATURES.map((feature) => (
                <FeatureItem key={feature.title} {...feature} />
              ))}
            </ul>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              Niektóre funkcjonalności są dostępne wyłącznie dla zalogowanych użytkowników. Zachęcamy
              do rejestracji, aby w pełni korzystać z możliwości platformy.
            </p>
          </div>

          <RecruiterPromoCard />
        </div>
      </div>
    </section>
  )
}
