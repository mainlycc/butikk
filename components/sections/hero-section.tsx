import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroImage } from "@/components/sections/hero-image"

const HERO_PORTRAITS = [
  {
    src: "/hero/portraits/portrait-1.svg",
    alt: "",
    width: 120,
    height: 140,
    className: "absolute top-[8%] left-[4%] w-24 h-28 sm:w-28 sm:h-32 opacity-25 rotate-[-8deg]",
  },
  {
    src: "/hero/portraits/portrait-2.svg",
    alt: "",
    width: 100,
    height: 120,
    className: "absolute top-[12%] right-[6%] w-20 h-24 sm:w-24 sm:h-28 opacity-20 rotate-[6deg]",
  },
  {
    src: "/hero/portraits/portrait-3.svg",
    alt: "",
    width: 110,
    height: 130,
    className: "absolute bottom-[18%] left-[8%] w-24 h-28 sm:w-28 sm:h-32 opacity-25 rotate-[4deg]",
  },
  {
    src: "/hero/portraits/portrait-4.svg",
    alt: "",
    width: 100,
    height: 120,
    className: "absolute bottom-[14%] right-[5%] w-20 h-24 sm:w-24 sm:h-28 opacity-20 rotate-[-5deg]",
  },
  {
    src: "/hero/portraits/portrait-5.svg",
    alt: "",
    width: 90,
    height: 110,
    className: "absolute top-[42%] left-[2%] w-20 h-24 sm:w-24 sm:h-28 opacity-15 rotate-[-12deg] hidden lg:block",
  },
  {
    src: "/hero/portraits/portrait-6.svg",
    alt: "",
    width: 90,
    height: 110,
    className: "absolute top-[38%] right-[2%] w-20 h-24 sm:w-24 sm:h-28 opacity-15 rotate-[10deg] hidden lg:block",
  },
] as const

export function HeroSection() {
  return (
    <section className="hero-gradient relative overflow-hidden border-b">
      <div className="hidden sm:block pointer-events-none absolute inset-0" aria-hidden>
        {HERO_PORTRAITS.map((portrait) => (
          <HeroImage key={portrait.src} {...portrait} />
        ))}
      </div>

      <div className="section-container relative z-10 py-16 sm:py-24 text-center">
        <div className="max-w-[800px] mx-auto flex flex-col gap-4">
          <h1 className="text-foreground text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight">
            Znajdź topowe talenty IT
            <br />
            szybciej niż kiedykolwiek
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl font-normal leading-relaxed max-w-[600px] mx-auto">
            Odblokuj potencjał swojej firmy z Qualibase. Łączymy najlepsze firmy ze zweryfikowanymi
            specjalistami IT bezpośrednio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto shadow-lg">
              <Link href="/kandydat">Zarejestruj się jako kandydat</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/rekruter">Korzystaj jako rekruter</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
