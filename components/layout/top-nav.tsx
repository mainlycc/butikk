'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Strona główna' },
  { href: '/#dla-kandydata', label: 'Dla kandydata' },
  { href: '/#dla-rekrutera', label: 'Dla rekrutera' },
  { href: '/#kontakt', label: 'Kontakt' },
] as const

const navLinkClass =
  'text-foreground text-sm font-medium hover:text-primary transition-colors'

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="section-container py-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <BrandMark imgClassName="h-7 sm:h-8" />

          <nav className="hidden md:flex items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-4 sm:gap-6">
            <Link
              href="/app/login"
              className={cn(navLinkClass, 'hidden sm:inline-flex')}
            >
              Zaloguj się
            </Link>
            <Button asChild size="default" className="hidden sm:inline-flex h-9 px-5 text-sm">
              <Link href="/kandydat">Zarejestruj się</Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Otwórz menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <SheetHeader>
                  <BrandMark href={null} className="mb-2" imgClassName="h-7" />
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-4">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className={cn('block', navLinkClass)}>
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-4 space-y-3 border-t">
                    <Link href="/app/login" className={cn('block', navLinkClass)}>
                      Zaloguj się
                    </Link>
                    <Button asChild className="w-full">
                      <Link href="/kandydat">Zarejestruj się</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
