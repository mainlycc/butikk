import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Atom,
  Braces,
  Cloud,
  Code2,
  Database,
} from 'lucide-react'
import HomepageCandidatesPreview from '@/components/homepage-candidates-preview'
import { getAllPublicCandidates } from '@/lib/data/candidates-queries'
import { DualPerspectiveSection } from '@/components/dual-perspective'
import { AboutSection } from '@/components/sections/about-section'
import { ContactSection } from '@/components/sections/contact-section'
import { HeroSection } from '@/components/sections/hero-section'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.qualibase.pl'

export const metadata: Metadata = {
  title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek",
  description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio. Platforma rekrutacyjna dla branży IT.",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek | Qualibase",
    description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    url: baseUrl,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Qualibase - Platforma Rekrutacyjna IT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek | Qualibase",
    description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    images: ["/og-image.jpg"],
  },
}

export default async function MainPage() {
  const candidates = await getAllPublicCandidates()

  return (
    <>
      <HeroSection />

      {/* Candidates Section */}
      <section className="relative overflow-hidden border-b bg-background py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 55% 45% at 100% 100%, oklch(0.93 0.07 92) 0%, transparent 68%), radial-gradient(ellipse 35% 35% at 0% 90%, oklch(0.96 0.04 95) 0%, transparent 62%)',
          }}
        />
        <div className="section-container relative">
          <div className="mb-10 sm:mb-12 space-y-6">
            <p className="text-center text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Wspieramy najpopularniejsze technologie
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-muted-foreground">
              <TechItem icon={<Atom className="w-6 h-6" />} label="React" />
              <TechItem icon={<Braces className="w-6 h-6" />} label="Python" />
              <TechItem icon={<Cloud className="w-6 h-6" />} label="AWS" />
              <TechItem icon={<Code2 className="w-6 h-6" />} label="TypeScript" />
              <TechItem icon={<Database className="w-6 h-6" />} label="PostgreSQL" />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl text-foreground text-center mb-8 sm:mb-10">
            Jedyni. Właściwi kandydaci.
          </h2>

          <HomepageCandidatesPreview candidates={candidates} />
        </div>
      </section>

      <DualPerspectiveSection />

      <AboutSection />

      {/* CTA Section */}
      <section id="rejestracja" className="py-20 px-4 hero-gradient border-t">
        <div className="max-w-[800px] mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl sm:text-4xl text-foreground">Gotowy na zmianę?</h2>
          <p className="text-muted-foreground text-lg">
            Dołącz do tysięcy specjalistów i firm, które zaufały Qualibase. Rejestracja zajmuje mniej niż 2 minuty.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg">
              <Link href="/kandydat">Zarejestruj się jako kandydat</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/rekruter">Korzystaj jako rekruter</Link>
            </Button>
          </div>
        </div>
      </section>

      <ContactSection />
    </>
  )
}

function TechItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-base font-medium">
      {icon}
      <span>{label}</span>
    </div>
  )
}
