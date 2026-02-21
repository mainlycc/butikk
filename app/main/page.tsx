import type { Metadata } from 'next'
import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Mail,
  CheckCircle2,
  Lock,
  Atom,
  Braces,
  Cloud,
  Code2,
  Database,
} from 'lucide-react'
import DatabaseContentMock from '@/components/database-content-mock'
import { DualPerspectiveSection } from '@/components/dual-perspective'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek",
  description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio. Platforma rekrutacyjna dla branży IT.",
  alternates: {
    canonical: `${baseUrl}/main`,
  },
  openGraph: {
    title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek | QualiBase",
    description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    url: `${baseUrl}/main`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "QualiBase - Platforma Rekrutacyjna IT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Znajdź topowe talenty IT szybciej niż kiedykolwiek | QualiBase",
    description: "Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    images: ["/og-image.jpg"],
  },
}

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      
      {/* Hero Section */}
      <section className="bg-white pt-10 pb-16 px-4 sm:px-10 border-b">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-8">
          {/* Hero Text */}
          <div className="max-w-[800px] flex flex-col gap-4">
            <h1 className="text-foreground text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
              Znajdź topowe talenty IT<br/>
              <span className="text-primary">szybciej niż kiedykolwiek</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-normal leading-relaxed max-w-[600px] mx-auto">
              Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button asChild size="lg" className="h-12 px-6 text-base font-bold shadow-lg w-full sm:w-auto">
                <Link href="/main/kandydat">
                  Zarejestruj się jako kandydat
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base font-bold w-full sm:w-auto">
                <Link href="/main/rekruter">
                  Korzystaj jako rekruter
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Table Visualization */}
          <div className="w-full mt-8 max-w-[1280px] relative z-10">
            {/* Decorational background blobs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative">
              <DatabaseContentMock />
            </div>
          </div>
        </div>
      </section>

      {/* Technologies Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 space-y-6">
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
      </section>

      <DualPerspectiveSection />

      {/* O nas Section */}
      <section id="o-nas" className="py-16 px-4 sm:px-10 bg-white border-t scroll-mt-20">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="flex flex-col gap-6 order-2 lg:order-1">
            <h2 className="text-3xl font-bold text-foreground">O nas</h2>
            <p className="text-muted-foreground text-lg">
              QualiBase to platforma dla rekruterów i kandydatów z branży IT. Niektóre funkcjonalności są dostępne wyłącznie dla zalogowanych użytkowników. Zachęcamy do rejestracji, aby w pełni korzystać z możliwości platformy.
            </p>
            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Ułatwiamy proces rekrutacji</span>
                  <p className="text-sm text-muted-foreground">Szybkie dopasowanie kandydatów do ofert pracy dzięki zaawansowanym algorytmom AI i weryfikacji umiejętności.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Wspieramy rozwój zawodowy</span>
                  <p className="text-sm text-muted-foreground">Oferujemy ekskluzywne zasoby, mentoring i ścieżki rozwoju, które przyspieszają karierę w branży IT.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-green-500 mt-0.5 w-5 h-5 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">Budujemy zaufaną społeczność</span>
                  <p className="text-sm text-muted-foreground">Cenimy każde zgłoszenie i każdego użytkownika. Tworzymy bezpieczne środowisko dla profesjonalistów IT.</p>
                </div>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                *Wszelkie dane kandydatów i rekruterów są chronione
              </p>
            </div>
          </div>

          {/* Right: Visual Teaser */}
          <div className="order-1 lg:order-2 relative bg-muted rounded-2xl p-8 border border-dashed min-h-[400px] flex items-center justify-center overflow-hidden">
            {/* Abstract Background Chart pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
            
            {/* The Card Component */}
            <Card className="relative w-full max-w-sm shadow-lg">
              <div className="h-40 bg-muted w-full rounded-t-xl"></div>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>

              {/* Lock Overlay */}
              <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
                  <Lock className="text-primary w-5 h-5" />
                </div>
                <h4 className="font-bold text-foreground mb-1">Funkcje dla Rekruterów</h4>
                <p className="text-xs text-muted-foreground mb-4">Dostępne tylko dla zalogowanych</p>
                <Button size="sm" className="text-xs">
                  Załóż darmowe konto
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="rejestracja" className="py-20 px-4 bg-gradient-to-br from-blue-50/50 to-white border-t">
        <div className="max-w-[800px] mx-auto text-center flex flex-col gap-6">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">Gotowy na zmianę?</h2>
          <p className="text-muted-foreground text-lg">
            Dołącz do tysięcy specjalistów i firm, które zaufały Qualibase. Rejestracja zajmuje mniej niż 2 minuty.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
            <Button asChild size="lg" className="h-12 px-8 text-base font-bold shadow-lg">
              <Link href="/main/kandydat">Zarejestruj się jako kandydat</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base font-bold">
              <Link href="/main/rekruter">Korzystaj jako rekruter</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Kontakt Section (bardziej wyróżniona na dole strony) */}
      <section
        id="kontakt"
        className="border-t bg-gradient-to-b from-white via-blue-50/40 to-white"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <p className="text-xs font-semibold tracking-[0.25em] text-primary uppercase mb-3">
              Kontakt
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Porozmawiajmy o współpracy
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Masz pytania dotyczące QualiBase, rekrutacji lub danych? Odezwij się do nas – chętnie doradzimy,
              jak najlepiej wykorzystać platformę w Twojej organizacji.
            </p>
          </div>

          <Card className="shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="grid gap-8 md:grid-cols-[1.1fr_minmax(0,1fr)] items-start">
                {/* Dane kontaktowe */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      Dane kontaktowe
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Najszybciej złapiesz nas mailowo – odpowiadamy zazwyczaj w ciągu 1 dnia roboczego.
                    </p>
                  </div>

                  <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground mb-1">E‑mail</p>
                      <Link
                        href="mailto:dominik.nowicki@qualibase.pl"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        dominik.nowicki@qualibase.pl
                        <Mail className="w-4 h-4" />
                      </Link>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">Telefon</p>
                      <Link
                        href="tel:+48501447626"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        +48 501 447 626
                      </Link>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      asChild
                      className="w-full sm:w-auto"
                    >
                      <Link href="mailto:dominik.nowicki@qualibase.pl?subject=Zapytanie%20dotyczące%20QualiBase">
                        Napisz do nas
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Dane spółki */}
                <div className="space-y-4 text-sm sm:text-base text-muted-foreground">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    Dane spółki
                  </h3>
                  <div className="rounded-2xl border bg-white/70 p-5 sm:p-6 space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Nazwa pełna
                      </p>
                      <p className="font-medium">
                        DESKSET SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          KRS
                        </p>
                        <p>0001199624</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          NIP
                        </p>
                        <p>6772531924</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          REGON
                        </p>
                        <p>542978418</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Kapitał zakładowy
                        </p>
                        <p>55 000 zł</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Adres siedziby
                      </p>
                      <p>Juliusza Lea 22 / 14, 30-052 Kraków, Polska</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
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

