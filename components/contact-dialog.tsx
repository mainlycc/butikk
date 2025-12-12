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
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
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
      toast.success(`E-mail został wysłany do ${result.sentTo?.length || 0} kandydatów`)

      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("[v0] Error sending contact email:", error)
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać wiadomości")
      setIsSending(false)
    }
  }

  // Filtrujemy kandydatów bez adresu email kandydata
  const candidatesWithEmail = candidates.filter((c) => c.candidate_email)

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Wyślij zapytanie do kandydata
          </DialogTitle>
          <DialogDescription className="text-base">
            Wyślij zapytanie bezpośrednio do wybranych kandydatów
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary */}
          <div className="flex items-center gap-4 px-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Wybrano:</span>
              <span className="text-lg font-semibold">{candidates.length}</span>
              <span className="text-sm text-muted-foreground">kandydatów</span>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Z adresem email:</span>
              <span className="text-lg font-semibold text-primary">{candidatesWithEmail.length}</span>
            </div>
            {candidates.length !== candidatesWithEmail.length && (
              <>
                <div className="h-4 w-px bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  {candidates.length - candidatesWithEmail.length} bez email
                </span>
              </>
            )}
          </div>

          {/* Selected Candidates */}
          <div className="space-y-2">
            <h3 className="font-semibold text-base">Wybrani kandydaci:</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {candidatesWithEmail.length === 0 ? (
                <Card className="border border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                  <CardContent className="pt-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Żaden z wybranych kandydatów nie ma przypisanego adresu email. 
                      Nie można wysłać wiadomości.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border">
                  <CardContent className="p-3 space-y-2">
                    {candidatesWithEmail.map((candidate) => (
                      <div key={candidate.id} className="flex items-center justify-between gap-3 text-sm py-1.5 border-b last:border-b-0">
                        <span className="font-medium">
                          {candidate.first_name} {candidate.last_name || ""}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{candidate.role}</Badge>
                          <Badge className="text-xs">{candidate.seniority}</Badge>
                          {candidate.rate && (
                            <span className="text-muted-foreground text-xs">({candidate.rate})</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label htmlFor="project-description" className="font-semibold text-base">
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
              Ten opis zostanie wysłany do kandydatów wraz z informacjami o roli i warunkach współpracy
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
                    <p className="text-sm">Kandydaci otrzymali Twoje zapytanie</p>
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
          <Button
            onClick={handleSend}
            disabled={isSending || isSent || candidatesWithEmail.length === 0}
            size="lg"
          >
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
