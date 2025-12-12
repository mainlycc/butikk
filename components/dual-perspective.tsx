"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, UserRound, BriefcaseBusiness } from "lucide-react"

export function DualPerspectiveSection() {
  return (
    <section className="bg-white py-16 px-4 sm:px-10 border-t">
      <div className="max-w-[1280px] mx-auto space-y-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Dwie perspektywy, jeden cel
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Platforma zaprojektowana, aby wspierać zarówno rozwój kariery, jak i efektywne
            budowanie zespołów.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            id="dla-kandydata"
            className="h-full shadow-sm scroll-mt-20 max-w-[520px] w-full mx-auto flex flex-col"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <UserRound className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-left">Dla Kandydata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left flex-1">
              <p className="text-muted-foreground">
                Buduj karierę na własnych zasadach. Bez presji i zbędnych rozmów. Zachowaj anonimowość,
                pokaż swoje kompetencje i rozmawiaj tylko z firmami, które naprawdę pasują.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <FeatureItem label="Pełna anonimowość do momentu Twojej decyzji" />
                <FeatureItem label="Umiejętności potwierdzone w praktyce" />
                <FeatureItem label="Oferty zgodne z Twoimi oczekiwaniami" />
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/main/kandydat">
                  Stwórz profil kandydata
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card
            id="dla-rekrutera"
            className="h-full shadow-sm scroll-mt-20 max-w-[520px] w-full mx-auto flex flex-col"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <BriefcaseBusiness className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl text-left">Dla Rekrutera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-left flex-1">
              <p className="text-muted-foreground">
                Docieraj do właściwych kandydatów. Szybciej i skuteczniej. Bez przypadkowych zgłoszeń
                i bez straty czasu.
              </p>
              <ul className="space-y-2 text-sm text-foreground">
                <FeatureItem label="Dostęp do kandydatów otwartych na zmianę" />
                <FeatureItem label="Profile oparte na realnych kompetencjach" />
                <FeatureItem label="Przejrzysty proces selekcji" />
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/main/rekruter">
                  Stwórz profil rekrutera
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}

function FeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
      <span>{label}</span>
    </li>
  )
}

