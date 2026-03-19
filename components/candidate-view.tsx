 "use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Mail,
  MapPin,
  User,
} from "lucide-react"
import { useState } from "react"
import ContactDialog from "@/components/contact-dialog"
import SimilarCandidates from "@/components/similar-candidates"
import type { PrivateCandidate } from "@/lib/types/candidate"
import { getCandidateAutoDescription } from "@/lib/seo/candidate-content"

// Dynamic import z wyłączonym SSR, aby uniknąć problemu z DOMMatrix
const PDFViewer = dynamic(() => import("@/components/pdf-viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Ładowanie PDF...</p>
      </div>
    </div>
  ),
})

type Candidate = PrivateCandidate

interface CandidateViewProps {
  candidate: Candidate
  similarCandidates: Array<Pick<Candidate, "id" | "role" | "seniority" | "technologies" | "location">>
  previousCandidate: Candidate | null
  nextCandidate: Candidate | null
  currentIndex: number
  totalCount: number
  userEmail: string
  selectedIds: string[]
}

export default function CandidateView({
  candidate,
  similarCandidates,
  previousCandidate,
  nextCandidate,
  currentIndex,
  totalCount,
  userEmail,
  selectedIds,
}: CandidateViewProps) {
  const router = useRouter()
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [showAllTechnologies, setShowAllTechnologies] = useState(false)

  const technologies = candidate.technologies
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const empty = "—"
  const autoDescription = getCandidateAutoDescription(candidate)
  const technologyLimit = 20

  const handlePrevious = useCallback(() => {
    if (!previousCandidate) return

    const params = new URLSearchParams()
    if (selectedIds.length > 0) {
      params.set("selected", selectedIds.join(","))
    }
    const queryString = params.toString()
    router.push(`/app/kandydat/${previousCandidate.id}${queryString ? `?${queryString}` : ""}`)
  }, [previousCandidate, router, selectedIds])

  const handleNext = useCallback(() => {
    if (!nextCandidate) return

    const params = new URLSearchParams()
    if (selectedIds.length > 0) {
      params.set("selected", selectedIds.join(","))
    }
    const queryString = params.toString()
    router.push(`/app/kandydat/${nextCandidate.id}${queryString ? `?${queryString}` : ""}`)
  }, [nextCandidate, router, selectedIds])

  const handleBackToList = useCallback(() => {
    router.push("/app/kandydaci")
  }, [router])

  return (
    <>
      <div className="space-y-6">
        {/* Pasek nawigacji jak w widoku publicznym */}
        <Card className="border-2 shadow-sm">
          <CardContent className="py-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToList}
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
                  disabled={!previousCandidate}
                  onClick={handlePrevious}
                  className="text-xs px-2"
                  aria-label="Poprzedni kandydat"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextCandidate}
                  onClick={handleNext}
                  className="text-xs px-2"
                  aria-label="Następny kandydat"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout jak na stronie publicznej, ale z pełnymi danymi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lewa kolumna */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tytuł + badże */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
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

            {/* OPIS (jak w widoku publicznym) */}
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

            {/* Główna karta z pełnymi danymi */}
            <Card className="border-2 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      Pełne dane tego kandydata
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Imię, nazwisko i pełne CV są widoczne, a dane kontaktowe udostępniamy po zapytaniu o kandydata.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    className="gap-2 px-5"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Mail className="w-4 h-4" />
                    Zapytaj o kandydata
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dane osobowe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-base sm:text-lg font-bold uppercase tracking-wide">
                      {[candidate.first_name, candidate.last_name].filter(Boolean).join(" ") || empty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Adres e-mail dostępny po wysłaniu zapytania
                    </span>
                  </div>
                </div>

                {/* CV */}
                <div className="mt-4">
                  <PDFViewer
                    pdfUrl={candidate.cv_pdf_url || "/default-cv.pdf"}
                    candidateName={`${candidate.first_name || ""} ${candidate.last_name || ""}`.trim() || "CV kandydata"}
                    fallbackText={candidate.cv}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prawa kolumna (sidebar) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Stawka */}
            <Card className="border-2 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Stawka B2B (netto)</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-12 flex items-center">
                  <span className="text-3xl font-bold tracking-wide">
                    {candidate.rate || empty}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Stawka na podstawie danych kandydata.
                </p>
              </CardContent>
            </Card>

            {/* Szczegóły jak w widoku publicznym */}
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
                    {technologies && technologies.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          {(showAllTechnologies ? technologies : technologies.slice(0, technologyLimit)).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[11px] px-2 py-0.5">
                              {t}
                            </Badge>
                          ))}
                        </div>
                        {technologies.length > technologyLimit && (
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
                                : `Rozwiń więcej (${technologies.length - technologyLimit})`}
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="font-medium break-words leading-snug">{empty}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statystyki / aktywność jak w widoku publicznym – na razie placeholdery */}
            <Card className="border-2 shadow-sm">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  Wyświetlenia (7 dni)
                </div>
                <div className="text-2xl font-bold">{empty}</div>
              </CardContent>
            </Card>

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

        {/* Podobni kandydaci pod layoutem – jak wcześniej */}
        <SimilarCandidates
          title="Podobne kandydatury"
          description="Na podstawie wspólnych technologii"
          items={similarCandidates.map((c) => ({
            key: c.id,
            href: `/app/kandydat/${c.id}`,
            heading: c.role || "Profil kandydata",
            seniority: c.seniority || undefined,
            location: c.location || null,
            technologies: c.technologies || undefined,
          }))}
        />
      </div>

      {/* Contact Dialog */}
      {showContactDialog && (
        <ContactDialog
          candidates={[candidate]}
          recruiterEmail={userEmail}
          onClose={() => setShowContactDialog(false)}
        />
      )}
    </>
  )
}

