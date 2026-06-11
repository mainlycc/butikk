import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BRAND_ICON_PATH } from '@/lib/brand'

const CONTACT_EMAIL = 'dominik.nowicki@qualibase.pl'
const CONTACT_PHONE = '+48 501 447 626'
const CONTACT_ADDRESS = 'Juliusza Lea 22/14, 30-052 Kraków, Polska'

const COMPANY_LEGAL =
  'DESKSET SPÓŁKA Z OGRANICZONĄ ODPOWIEDZIALNOŚCIĄ, KRS: 0001199624, NIP: 6772531924, REGON: 542978418 KAPITAŁ ZAKŁADOWY: 55 000 zł'

function ContactField({
  label,
  children,
  bordered = true,
}: {
  label: string
  children: ReactNode
  bordered?: boolean
}) {
  return (
    <div className={bordered ? 'border-b border-black/10 pb-6 mb-6 last:mb-0 last:border-b-0 last:pb-0' : ''}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      <div className="text-lg sm:text-xl font-medium text-[#1a1a1a]">{children}</div>
    </div>
  )
}

export function ContactSection() {
  return (
    <section id="kontakt" className="bg-surface-footer text-white">
      <div className="section-container py-16 sm:py-20 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20 items-start">
          <div className="space-y-6 lg:max-w-xl lg:pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">Kontakt</p>
            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] font-normal text-white">
              Porozmawiajmy o współpracy
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-white/75 max-w-lg">
              Masz pytania dotyczące Qualibase, rekrutacji lub danych? Odezwij się do nas – chętnie doradzimy,
              jak najlepiej wykorzystać platformę w Twojej organizacji.
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-[4px] px-8 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              <Link href={`mailto:${CONTACT_EMAIL}?subject=Zapytanie%20dotyczące%20Qualibase`}>
                Napisz do nas
              </Link>
            </Button>
          </div>

          <div className="rounded-[4px] bg-[#f3f3f3] p-8 sm:p-10 text-[#1a1a1a]">
            <div className="mb-8 space-y-2">
              <h3 className="text-xl sm:text-2xl font-medium text-[#1a1a1a]">Dane kontaktowe</h3>
              <p className="text-sm leading-relaxed text-[#5c5c5c]">
                Najszybciej złapiesz nas mailowo – odpowiadamy zazwyczaj w ciągu 1 dnia roboczego.
              </p>
            </div>

            <div>
              <ContactField label="E-mail">
                <Link href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary transition-colors">
                  {CONTACT_EMAIL}
                </Link>
              </ContactField>
              <ContactField label="Telefon">
                <Link href="tel:+48501447626" className="hover:text-primary transition-colors">
                  {CONTACT_PHONE}
                </Link>
              </ContactField>
              <ContactField label="Adres" bordered={false}>
                {CONTACT_ADDRESS}
              </ContactField>
            </div>

            <div className="mt-10 flex items-start gap-3 border-t border-black/10 pt-8">
              <img
                src={BRAND_ICON_PATH}
                alt=""
                width={28}
                height={28}
                className="mt-0.5 h-7 w-7 shrink-0 rounded-[3px]"
                aria-hidden
              />
              <p className="text-[10px] sm:text-[11px] leading-relaxed uppercase tracking-[0.04em] text-[#6b6b6b]">
                {COMPANY_LEGAL}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
