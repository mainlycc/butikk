"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, User, Briefcase, Mail, Calendar, MapPin } from "lucide-react"

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

interface CVSlideshowProps {
  candidates: Candidate[]
  onClose: () => void
  onOpenContact: (candidate: Candidate) => void
}

export default function CVSlideshow({ candidates, onClose, onOpenContact }: CVSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  const currentCandidate = candidates[currentIndex]

  useEffect(() => {
    setMounted(true)
    // Blokuj scroll na body gdy slideshow jest otwarty
    document.body.style.overflow = "hidden"
    // Ukryj sidebar gdy slideshow jest otwarty
    const sidebarWrapper = document.querySelector('[data-slot="sidebar-wrapper"]')
    const sidebarContainer = document.querySelector('[data-slot="sidebar-container"]')
    if (sidebarWrapper) {
      sidebarWrapper.classList.add('slideshow-open')
    }
    if (sidebarContainer) {
      sidebarContainer.classList.add('slideshow-open')
    }
    
    return () => {
      document.body.style.overflow = "unset"
      if (sidebarWrapper) {
        sidebarWrapper.classList.remove('slideshow-open')
      }
      if (sidebarContainer) {
        sidebarContainer.classList.remove('slideshow-open')
      }
    }
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % candidates.length)
  }, [candidates.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length)
  }, [candidates.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrevious, onClose])

  if (!mounted) return null

  const slideshowContent = (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Podgląd CV</h2>
                <Badge variant="secondary" className="text-base px-4 py-1">
                  {currentIndex + 1} / {candidates.length}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-col px-3 sm:px-6 py-4">
            {/* Header z informacjami o kandydacie */}
            <Card className="border-2 shadow-xl mb-4">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-xl sm:text-2xl">
                        {currentCandidate.first_name} {currentCandidate.last_name || ""}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-sm px-2 py-1">
                          {currentCandidate.role}
                        </Badge>
                        <Badge className="text-sm px-2 py-1">{currentCandidate.seniority}</Badge>
                        {currentCandidate.rate && (
                          <span className="text-muted-foreground text-sm">• {currentCandidate.rate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 min-w-0">
                    <Button
                      onClick={() => onOpenContact(currentCandidate)}
                      size="lg"
                      className="gap-2 px-4 sm:px-6 w-full sm:w-auto"
                    >
                      <Mail className="w-4 h-4" />
                      Wyślij zapytanie
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 pb-6 flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 text-base max-w-5xl w-full mx-auto">
                  {/* Technologie/Skills */}
                  {(currentCandidate.technologies || currentCandidate.skills) && (
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-base md:text-lg">Technologie</h4>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">
                        {currentCandidate.technologies || currentCandidate.skills}
                      </p>
                    </div>
                  )}

                  {/* Języki */}
                  {currentCandidate.languages && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-base md:text-lg">Języki</h4>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">{currentCandidate.languages}</p>
                    </div>
                  )}

                  {/* Dostępność */}
                  {currentCandidate.availability && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-base md:text-lg">Dostępność</h4>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">
                        {currentCandidate.availability}
                      </p>
                    </div>
                  )}

                  {/* Lokalizacja */}
                  {currentCandidate.location && (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-base md:text-lg">Lokalizacja</h4>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground font-medium text-foreground">
                        {currentCandidate.location}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PDF Viewer */}
            <div className="flex flex-col">
              <PDFViewer
                pdfUrl={currentCandidate.cv_pdf_url || "/default-cv.pdf"}
                candidateName={`${currentCandidate.first_name} ${currentCandidate.last_name || ""}`}
                fallbackText={currentCandidate.cv}
              />
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="border-t bg-card shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevious}
                disabled={candidates.length === 1}
                className="min-w-32 bg-transparent"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Poprzedni
              </Button>

              <div className="flex items-center gap-2">
                {candidates.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      idx === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Przejdź do kandydata ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleNext}
                disabled={candidates.length === 1}
                className="min-w-32 bg-transparent"
              >
                Następny
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-3">
              Użyj strzałek na klawiaturze do nawigacji • ESC aby zamknąć
            </p>
          </div>
        </div>
      </div>

    </div>
  )

  return createPortal(slideshowContent, document.body)
}
