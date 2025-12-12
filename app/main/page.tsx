import Link from 'next/link'
import { TopNav } from '@/components/layout/top-nav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Globe,
  Mail,
  Share2,
  CheckCircle2,
  Lock,
  Network,
  Atom,
  Braces,
  Cloud,
  Code2,
  Database
} from 'lucide-react'
import DatabaseContentMock from '@/components/database-content-mock'
import { DualPerspectiveSection } from '@/components/dual-perspective'

export default function MainPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      
      {/* Hero Section */}
      <section className="bg-white pt-12 pb-20 px-4 sm:px-10 border-b">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-8">
          {/* Hero Text */}
          <div className="max-w-[800px] flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 self-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">Nowa jakość rekrutacji</span>
            </div>
            <h1 className="text-foreground text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight">
              Znajdź topowe talenty IT<br/>
              <span className="text-primary">szybciej niż kiedykolwiek</span>
            </h1>
            <p className="text-muted-foreground text-lg sm:text-xl font-normal leading-relaxed max-w-[600px] mx-auto">
              Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button asChild size="lg" className="h-12 px-6 text-base font-bold shadow-lg">
                <Link href="/main/kandydat">Zarejestruj się jako kandydat</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base font-bold">
                <Link href="/main/rekruter">Dla firm (rekruter)</Link>
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
                <h4 className="font-bold text-foreground mb-1">Funkcje Premium</h4>
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
              <Link href="/main/rekruter">Dla firm (rekruter)</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t pt-16 pb-8 px-4 sm:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <Network className="text-primary w-6 h-6" />
              <h3 className="text-lg font-bold">Qualibase</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Nowoczesna platforma rekrutacyjna dla branży IT.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Platforma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Przeglądaj oferty
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Baza kandydatów
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Firma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              O nas
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Kontakt
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Social</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Polityka Prywatności
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Regulamin
            </Link>
          </div>
        </div>
      </footer>
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

