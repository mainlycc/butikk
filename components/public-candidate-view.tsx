"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Clock,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  FileText,
  Mail,
  Bookmark,
  Eye,
  CheckCircle2,
  Activity,
} from "lucide-react"
import type { PublicCandidate } from "@/lib/types/candidate"
import SimilarCandidates from "@/components/similar-candidates"
import LockedCvSkeleton from "@/components/locked-cv-skeleton"

interface PublicCandidateViewProps {
  candidate: PublicCandidate
  autoDescription: string
  similarCandidates: PublicCandidate[]
  previousSlug: string | null
  nextSlug: string | null
  currentIndex: number
  totalCount: number
}

export default function PublicCandidateView({
  candidate,
  autoDescription,
  similarCandidates,
  previousSlug,
  nextSlug,
  currentIndex,
  totalCount,
}: PublicCandidateViewProps) {
  const router = useRouter()
  const [showAllTechnologies, setShowAllTechnologies] = useState(false)

  const technologies = candidate.technologies
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const navigateTo = (slug: string) => {
    router.push(`/kandydat/${slug}`)
  }

  const locked = "select-none blur-sm opacity-70"
  const empty = "—"
  const technologyLimit = 20
  const visibleTechnologies = technologies
    ? (showAllTechnologies ? technologies : technologies.slice(0, technologyLimit))
    : null

  return (
    <div className="space-y-6">
      {/* Navigation bar */}
      {totalCount > 1 && (
        <Card className="border-2 shadow-sm">
          <CardContent className="py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/kandydaci")}
                className="text-xs"
              >
                <ArrowLeft className="w-3 h-3 mr-1" />
                Lista
              </Button>

              <span className="text-xs text-muted-foreground font-medium">
                {currentIndex + 1} z {totalCount}
              </span>

              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!previousSlug}
                  onClick={() => previousSlug && navigateTo(previousSlug)}
                  className="text-xs px-2"
                  aria-label="Poprzedni kandydat"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextSlug}
                  onClick={() => nextSlug && navigateTo(nextSlug)}
                  className="text-xs px-2"
                  aria-label="Następny kandydat"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard layout like screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left main column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tytuł + badże */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl tracking-tight leading-tight">
              {candidate.role || "Profil kandydata"}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {candidate.availability && (
                <Badge
                  variant="outline"
                  className={
                    candidate.availability.toLowerCase().includes("immediate")
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-sm sm:text-base px-3 py-1.5 rounded-full"
                      : "bg-background text-sm sm:text-base px-3 py-1.5 rounded-full"
                  }
                >
                  Dostępność:{" "}
                  <span className="ml-1 inline-flex items-center gap-2 font-semibold">
                    {candidate.availability.toLowerCase().includes("immediate") && (
                      <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.75)]" />
                      </span>
                    )}
                    {candidate.availability.toLowerCase().includes("immediate")
                      ? "od zaraz"
                      : candidate.availability}
                  </span>
                </Badge>
              )}
              {candidate.experience_years != null && (
                <Badge
                  variant="outline"
                  className="bg-background text-sm sm:text-base px-3 py-1.5 rounded-full"
                >
                  Doświadczenie:{" "}
                  <span className="ml-1 font-semibold">
                    {candidate.experience_years}{" "}
                    {candidate.experience_years === 1 ? "rok" : "lat"}
                  </span>
                </Badge>
              )}
              {candidate.seniority && (
                <Badge
                  variant="outline"
                  className="bg-background text-sm sm:text-base px-3 py-1.5 rounded-full"
                >
                  Seniority: <span className="ml-1 font-semibold">{candidate.seniority}</span>
                </Badge>
              )}
              {candidate.location && (
                <Badge
                  variant="outline"
                  className="bg-background text-sm sm:text-base px-3 py-1.5 rounded-full"
                >
                  {candidate.location.toLowerCase().includes("zdalnie") || candidate.location.toLowerCase().includes("remote")
                    ? "Tryb pracy: Zdalnie"
                    : `Lokalizacja: ${candidate.location}`}
                </Badge>
              )}
            </div>
          </div>

          {/* Main locked card with blended fields + CV preview */}
          {/* About */}
          <Card className="border-2 shadow-sm gap-0 py-0">
            <CardHeader className="px-6 pt-4 pb-0 gap-0">
              <CardTitle className="text-sm tracking-wide text-muted-foreground">
                OPIS
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pt-2 pb-4">
              <div className="space-y-1">
                <p className="text-sm leading-relaxed">
                  {autoDescription}
                </p>
                {candidate.summary && candidate.summary.trim().length > 0 && (
                  <div className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Dodatkowe informacje:</span>{" "}
                    {candidate.summary}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Pełne dane tego kandydata
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Imię, nazwisko, dane kontaktowe, CV i stawka — dostępne po zalogowaniu
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-base sm:text-lg font-bold uppercase tracking-wide ${locked}`}>IMIĘ NAZWISKO</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className={`text-sm font-medium ${locked}`}>email@example.com</span>
                </div>
              </div>

              {/* CV preview */}
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>Podgląd CV</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs">Premium</Badge>
                </div>

                {/* A4-like PDF placeholder */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative w-full max-w-[420px]">
                    <div className="mx-auto aspect-[210/297] w-full rounded-xl border bg-background/70 shadow-sm overflow-hidden">
                      <LockedCvSkeleton />

                      {/* overlay lock */}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/35 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2 text-center px-6">
                          <div className="w-14 h-14 rounded-full border bg-background flex items-center justify-center shadow-sm">
                            <Lock className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-sm font-semibold">Podgląd CV zablokowany</div>
                          <div className="text-xs text-muted-foreground">
                            Zaloguj się, aby zobaczyć dokument PDF (A4)
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span className={locked}>CV.pdf</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium">Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right sidebar column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rate card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground">Stawka B2B (netto)</CardTitle>
                <Lock className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-12 flex items-center">
                <div className="relative inline-flex items-center">
                  <span className="text-3xl font-bold text-foreground/80 blur-sm select-none tracking-wide">
                    180&nbsp;zł/h
                  </span>
                  <span className="absolute inset-0 bg-background/60 rounded-sm" aria-hidden="true" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Dokładna stawka dostępna po zalogowaniu.
              </p>
            </CardContent>
          </Card>

          {/* Details card */}
          <Card className="border-2 shadow-sm">
            <CardContent className="pt-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Języki</span>
                  <span className="font-medium text-right min-w-0 break-words leading-snug">
                    {candidate.languages || empty}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground">Technologie</div>
                  {visibleTechnologies && visibleTechnologies.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleTechnologies.map((t) => (
                          <Badge
                            key={t}
                            className="text-[11px] px-2 py-0.5 bg-primary/15 text-primary ring-1 ring-inset ring-primary/20"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                      {(technologies?.length ?? 0) > technologyLimit && (
                        <div className="flex justify-start">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setShowAllTechnologies((v) => !v)}
                          >
                            {showAllTechnologies
                              ? "Zwiń"
                              : `Rozwiń więcej (${(technologies?.length ?? 0) - technologyLimit})`}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="font-medium break-words leading-snug">{empty}</div>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={`/app/login?redirect=/app/kandydat/${candidate.id}`}>
                    <Lock className="w-4 h-4 mr-2" />
                    Odblokuj kontakt
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Zapisz profil
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  Dołącz do <span className="font-semibold text-foreground">440 firm</span>, które już rekrutują
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Views */}
          <Card className="border-2 shadow-sm">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                Wyświetlenia (7 dni)
              </div>
              <div className="text-2xl font-bold">{empty}</div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card className="border-2 shadow-sm">
            <CardContent className="py-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="w-4 h-4" />
                Profil aktywny:
                <span className="ml-auto font-medium text-foreground">{empty}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-4 h-4" />
                Ostatnia aktualizacja:
                <span className="ml-auto font-medium text-foreground">{empty}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                Odpowiada w:
                <span className="ml-auto font-medium text-foreground">{empty}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SimilarCandidates
        title="Podobne kandydatury"
        description="Na podstawie wspólnych technologii"
        items={similarCandidates.map((c) => ({
          key: c.slug,
          href: `/kandydat/${c.slug}`,
          heading: c.role || "Profil kandydata",
          seniority: c.seniority || undefined,
          location: c.location || null,
          technologies: c.technologies || undefined,
        }))}
      />
    </div>
  )
}
