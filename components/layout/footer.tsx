import Link from 'next/link'
import { Globe, Mail, Share2, Network } from 'lucide-react'

export function Footer() {
  return (
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
          <Link href="/main/zaloguj" className="text-muted-foreground text-sm hover:text-primary">
            Przeglądaj oferty
          </Link>
          <Link href="/main/zaloguj" className="text-muted-foreground text-sm hover:text-primary">
            Baza kandydatów
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Firma</h4>
          <Link href="/main#o-nas" className="text-muted-foreground text-sm hover:text-primary">
            O nas
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
        <p className="text-xs text-muted-foreground">© 2025 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
        <div className="flex gap-6">
          <Link href="/polityka-prywatnosci" className="text-xs text-muted-foreground hover:text-foreground">
            Polityka Prywatności
          </Link>
        </div>
      </div>
    </footer>
  )
}
