"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, X, User, Briefcase, Mail, Calendar } from "lucide-react"

interface Candidate {
  id: string
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  technologies: string | null
  cv: string | null
  guardian: string | null
  previous_contact: string | null
  project_description: string | null
  languages?: string | null
  availability?: string | null
  skills?: string | null
}

interface CVSlideshowProps {
  candidates: Candidate[]
  onClose: () => void
}

export default function CVSlideshow({ candidates, onClose }: CVSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentCandidate = candidates[currentIndex]

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
  }, [currentIndex, candidates.length])

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % candidates.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length)
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-card shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
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
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <Card className="border-2 shadow-xl">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl mb-2">
                        {currentCandidate.first_name} {currentCandidate.last_name || ""}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {currentCandidate.role}
                        </Badge>
                        <Badge className="text-base px-3 py-1">{currentCandidate.seniority}</Badge>
                        {currentCandidate.rate && (
                          <span className="text-muted-foreground text-sm">• {currentCandidate.rate}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8 space-y-8">
                {/* CV Content */}
                <div className="space-y-6">
                  {/* Technologie/Skills */}
                  {(currentCandidate.technologies || currentCandidate.skills) && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">Technologie</h3>
                      </div>
                      <div className="pl-7">
                        <p className="text-base leading-relaxed whitespace-pre-wrap">{currentCandidate.technologies || currentCandidate.skills}</p>
                      </div>
                    </div>
                  )}

                  {/* Języki */}
                  {currentCandidate.languages && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">Języki</h3>
                      </div>
                      <div className="pl-7">
                        <p className="text-base leading-relaxed">{currentCandidate.languages}</p>
                      </div>
                    </div>
                  )}

                  {/* Dostępność */}
                  {currentCandidate.availability && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-semibold">Dostępność</h3>
                      </div>
                      <div className="pl-7">
                        <p className="text-base leading-relaxed">{currentCandidate.availability}</p>
                      </div>
                    </div>
                  )}

                  {/* Full CV Text */}
                  {currentCandidate.cv && (
                    <div className="space-y-3 pt-6 border-t">
                      <h3 className="text-xl font-semibold">Pełne CV</h3>
                      <div className="bg-muted/30 rounded-lg p-6">
                        <p className="text-base leading-relaxed whitespace-pre-wrap font-mono text-sm">
                          {currentCandidate.cv}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caretaker Info */}
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-5 h-5" />
                    <div>
                      <p className="text-sm">Opiekun kandydata:</p>
                      <p className="font-medium text-foreground">{currentCandidate.guardian}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
}
