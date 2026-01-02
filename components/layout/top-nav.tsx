'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Network } from 'lucide-react'

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b w-full">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-3 flex items-center justify-between">
        <Link href="/main" className="flex items-center gap-2 text-foreground">
          <Network className="text-primary text-3xl" />
          <h2 className="text-foreground text-xl font-bold tracking-tight">Qualibase</h2>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/main#o-nas" 
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
          >
            O nas
          </Link>
          <Link 
            href="/main#dla-rekrutera" 
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
          >
            Dla Rekruterów
          </Link>
          <Link 
            href="/main#dla-kandydata" 
            className="text-foreground text-sm font-medium hover:text-primary transition-colors"
          >
            Dla Kandydatów
          </Link>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="hidden sm:flex h-9 px-4 bg-transparent hover:bg-gray-100 text-foreground text-sm font-bold"
            asChild
          >
            <Link href="/main/zaloguj">Zaloguj</Link>
          </Button>
          <Button
            asChild
            className="flex h-9 px-4 bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm"
          >
            <Link href="/main/kandydat">Rejestracja</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

