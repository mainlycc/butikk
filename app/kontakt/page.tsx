import Link from 'next/link'
import type { Metadata } from 'next'
import { TopNav } from '@/components/layout/top-nav'
import { Globe, Mail, Network, Phone, Share2 } from 'lucide-react'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Skontaktuj się z Deskset Sp. z o.o. – operatorem platformy QualiBase. Dane kontaktowe, adres siedziby oraz informacje rejestrowe spółki.',
  alternates: {
    canonical: `${baseUrl}/kontakt`,
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />

      <main className="flex-1 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Kontakt
          </h1>

          <p className="text-sm text-muted-foreground mb-8">
            Masz pytania dotyczące platformy QualiBase, współpracy lub danych? Skontaktuj się z nami, korzystając z poniższych danych.
          </p>

          <div className="grid gap-10 md:grid-cols-2 text-sm sm:text-base text-muted-foreground">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Dane kontaktowe
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-foreground">E-mail</p>
                <p>
                  <Link
                    href="mailto:dominik.nowicki@qualibase.pl"
                    className="text-primary hover:underline"
                  >
                    dominik.nowicki@qualibase.pl
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-foreground">Telefon</p>
                <p>
                  <Link
                    href="tel:+48501447626"
                    className="text-primary hover:underline"
                  >
                    +48 501 447 626
                  </Link>
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground">
                Dane spółki
              </h2>
              <dl className="space-y-2">
                <div>
                  <dt className="font-medium text-foreground">Nazwa pełna</dt>
                  <dd>DESKSET SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">KRS</dt>
                  <dd>0001199624</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">NIP</dt>
                  <dd>6772531924</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">REGON</dt>
                  <dd>542978418</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Adres siedziby</dt>
                  <dd>Juliusza Lea 22 / 14, 30-052 Kraków, Polska</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Forma prawna</dt>
                  <dd>SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Data rejestracji</dt>
                  <dd>13 października 2025 r.</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Kapitał zakładowy</dt>
                  <dd>55 000 zł</dd>
                </div>
              </dl>
            </section>
          </div>
        </div>
      </main>

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
            <Link href="/kontakt" className="text-muted-foreground text-sm hover:text-primary">
              Kontakt
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Social</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="mailto:dominik.nowicki@qualibase.pl" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2025 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <Link href="/polityka-prywatnosci" className="text-xs text-muted-foreground hover:text-foreground">
              Polityka Prywatności
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

