import Link from 'next/link'
import { Linkedin } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'
import { BRAND_ICON_PATH } from '@/lib/brand'
import { BRAND_NAME } from '@/lib/branding'
import { cn } from '@/lib/utils'

const brandSerif = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
})

export function Footer() {
  return (
    <footer className="bg-surface-footer text-surface-footer-foreground border-t border-white/10 px-4 sm:px-10 pt-12 sm:pt-14 pb-8 sm:pb-10">
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <img
              src={BRAND_ICON_PATH}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-[4px]"
              aria-hidden
            />
            <span className={cn(brandSerif.className, 'text-[1.75rem] leading-none text-white')}>
              {BRAND_NAME}
            </span>
          </Link>

          <Link
            href="https://www.linkedin.com/company/qualibase"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[4px] border border-white/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/5"
          >
            LinkedIn
            <Linkedin className="h-4 w-4" aria-hidden />
          </Link>

          <p className="col-span-1 max-w-[16rem] text-base leading-relaxed text-white/90">
            Nowoczesna platforma
            <br />
            rekrutacyjna dla branży IT.
          </p>
        </div>

        <div className="mt-16 sm:mt-20 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-white/70">
          <p>© 2025 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
          <Link
            href="/polityka-prywatnosci"
            className="w-fit transition-colors hover:text-white"
          >
            Polityka Prywatności
          </Link>
        </div>
      </div>
    </footer>
  )
}
