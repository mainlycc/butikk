"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ArrowLeft, User, Briefcase, Mail, Calendar, MapPin } from "lucide-react"
import ContactDialog from "@/components/contact-dialog"
import { useState } from "react"

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

interface Candidate {
  id: string
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  technologies: string | null
  cv: string | null
  cv_pdf_url?: string | null
  location?: string | null
  candidate_email?: string | null
  guardian: string | null
  guardian_email?: string | null
  previous_contact: string | null
  project_description: string | null
  languages?: string | null
  availability?: string | null
  skills?: string | null
}

interface CandidateViewProps {
  candidate: Candidate
  previousCandidate: Candidate | null
  nextCandidate: Candidate | null
  currentIndex: number
  totalCount: number
  userEmail: string
  selectedIds: string[]
}

export default function CandidateView({
  candidate,
  previousCandidate,
  nextCandidate,
  currentIndex,
  totalCount,
  userEmail,
  selectedIds,
}: CandidateViewProps) {
  const router = useRouter()
  const [showContactDialog, setShowContactDialog] = useState(false)

  const handlePrevious = useCallback(() => {
    if (!previousCandidate) return
    
    const params = new URLSearchParams()
    if (selectedIds.length > 0) {
      params.set("selected", selectedIds.join(","))
    }
    const queryString = params.toString()
    router.push(`/database/candidate/${previousCandidate.id}${queryString ? `?${queryString}` : ""}`)
  }, [previousCandidate, router, selectedIds])

  const handleNext = useCallback(() => {
    if (!nextCandidate) return
    
    const params = new URLSearchParams()
    if (selectedIds.length > 0) {
      params.set("selected", selectedIds.join(","))
    }
    const queryString = params.toString()
    router.push(`/database/candidate/${nextCandidate.id}${queryString ? `?${queryString}` : ""}`)
  }, [nextCandidate, router, selectedIds])

  const handleBackToList = useCallback(() => {
    router.push("/database")
  }, [router])

  return (
    <>
      <div className="space-y-6">
        {/* Header z przyciskiem powrotu i nawigacją */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" onClick={handleBackToList} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Powrót do listy
              </Button>
              {totalCount > 1 && (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-4 py-1">
                      {currentIndex + 1} / {totalCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handlePrevious}
                      disabled={!previousCandidate}
                      className="min-w-32"
                    >
                      <ChevronLeft className="w-5 h-5 mr-2" />
                      Poprzedni
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleNext}
                      disabled={!nextCandidate}
                      className="min-w-32"
                    >
                      Następny
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informacje o kandydacie */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">
                    {candidate.first_name} {candidate.last_name || ""}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-sm px-2 py-1">
                      {candidate.role}
                    </Badge>
                    <Badge className="text-sm px-2 py-1">{candidate.seniority}</Badge>
                    {candidate.rate && (
                      <span className="text-muted-foreground text-sm">• {candidate.rate}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 min-w-0">
                <Button
                  onClick={() => setShowContactDialog(true)}
                  size="lg"
                  className="gap-2 px-6"
                >
                  <Mail className="w-4 h-4" />
                  Wyślij zapytanie
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-6 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-base max-w-5xl w-full mx-auto">
              {/* Technologie/Skills */}
              {(candidate.technologies || candidate.skills) && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Technologie</h4>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">
                    {candidate.technologies || candidate.skills}
                  </p>
                </div>
              )}

              {/* Języki */}
              {candidate.languages && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Języki</h4>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">{candidate.languages}</p>
                </div>
              )}

              {/* Dostępność */}
              {candidate.availability && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Dostępność</h4>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {candidate.availability}
                  </p>
                </div>
              )}

              {/* Lokalizacja */}
              {candidate.location && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-base md:text-lg">Lokalizacja</h4>
                  </div>
                  <p className="text-sm md:text-base text-muted-foreground font-medium text-foreground">
                    {candidate.location}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PDF Viewer */}
        <div className="flex flex-col">
          <PDFViewer
            pdfUrl={candidate.cv_pdf_url || "/default-cv.pdf"}
            candidateName={`${candidate.first_name} ${candidate.last_name || ""}`}
            fallbackText={candidate.cv}
          />
        </div>

        {/* Navigation Footer */}
        {totalCount > 1 && (
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePrevious}
                  disabled={!previousCandidate}
                  className="min-w-32"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Poprzedni
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {totalCount}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNext}
                  disabled={!nextCandidate}
                  className="min-w-32"
                >
                  Następny
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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

