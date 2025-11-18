"use client"

import { useState } from "react"
import { sendContactEmail } from "@/app/actions/send-contact-email"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Loader2, CheckCircle2, User } from "lucide-react"
import { toast } from "sonner"

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

interface ContactDialogProps {
  candidates: Candidate[]
  recruiterEmail: string
  onClose: () => void
}

export default function ContactDialog({ candidates, recruiterEmail, onClose }: ContactDialogProps) {
  const [projectDescription, setProjectDescription] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSend = async () => {
    if (!projectDescription.trim()) {
      toast.error("Proszę wprowadzić opis projektu")
      return
    }

    setIsSending(true)

    try {
      const result = await sendContactEmail(candidates, projectDescription, recruiterEmail)

      setIsSent(true)
      toast.success(`E-mail został wysłany do ${result.sentTo?.length || 0} opiekunów`)

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("[v0] Error sending contact email:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać wiadomości")
      setIsSending(false)
    }
  }

  // Grupujemy kandydatów według opiekuna
  const caretakers = candidates.reduce(
    (acc, candidate) => {
      const key = candidate.guardian || "unknown"
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(candidate)
      return acc
    },
    {} as Record<string, Candidate[]>,
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Wyślij zapytanie o kontakt
          </DialogTitle>
          <DialogDescription className="text-base">
            Wyślij prośbę o kontakt do opiekunów wybranych kandydatów
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Summary */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Liczba kandydatów</p>
                  <p className="text-2xl font-bold">{candidates.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Liczba opiekunów</p>
                  <p className="text-2xl font-bold">{Object.keys(caretakers).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Candidates by Caretaker */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Wybrani kandydaci:</h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {Object.entries(caretakers).map(([caretaker, candidateList]) => (
                <Card key={caretaker} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{caretaker}</p>
                        <p className="text-sm text-muted-foreground">{candidateList.length} kandydatów</p>
                      </div>
                    </div>
                    <div className="space-y-2 pl-11">
                      {candidateList.map((candidate) => (
                        <div key={candidate.id} className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{candidate.first_name} {candidate.last_name || ""}</span>
                          <span className="text-muted-foreground">•</span>
                          <Badge variant="secondary">{candidate.role}</Badge>
                          <Badge>{candidate.seniority}</Badge>
                          {candidate.rate && <span className="text-muted-foreground text-xs">({candidate.rate})</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label htmlFor="project-description" className="font-semibold text-lg">
              Opis projektu:
            </label>
            <Textarea
              id="project-description"
              placeholder="Opisz projekt, dla którego szukasz kandydatów..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={6}
              className="resize-none text-base"
              disabled={isSending || isSent}
            />
            <p className="text-sm text-muted-foreground">
              Ten opis zostanie wysłany do opiekunów wraz z listą kandydatów
            </p>
          </div>

          {/* Success Message */}
          {isSent && (
            <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Wiadomość została wysłana!</p>
                    <p className="text-sm">Opiekunowie otrzymali prośbę o kontakt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Anuluj
          </Button>
          <Button onClick={handleSend} disabled={isSending || isSent} size="lg">
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : isSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Wysłano
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Wyślij zapytanie
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
