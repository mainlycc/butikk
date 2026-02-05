'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { CheckCircle2, XCircle, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import type { CandidateRegistration, RecruiterRegistration } from '@/app/actions/get-registrations'
import { approveCandidateRegistration } from '@/app/actions/approve-candidate-registration'
import { rejectCandidateRegistration } from '@/app/actions/reject-candidate-registration'
import { approveRecruiterRegistration } from '@/app/actions/approve-recruiter-registration'
import { rejectRecruiterRegistration } from '@/app/actions/reject-recruiter-registration'

interface RegistrationDetailDialogProps {
  registration: { type: 'candidate'; data: CandidateRegistration } | { type: 'recruiter'; data: RecruiterRegistration }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegistrationDetailDialog({
  registration,
  open,
  onOpenChange,
}: RegistrationDetailDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      let result
      if (registration.type === 'candidate') {
        result = await approveCandidateRegistration(registration.data.id)
      } else {
        result = await approveRecruiterRegistration(registration.data.id)
      }

      if (result.success) {
        toast.success('Zgłoszenie zostało zaakceptowane')
        onOpenChange(false)
        window.location.reload()
      } else {
        toast.error(result.error || 'Nie udało się zaakceptować zgłoszenia')
      }
    } catch (error) {
      console.error('Error approving registration:', error)
      toast.error('Wystąpił błąd podczas akceptacji')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      let result
      if (registration.type === 'candidate') {
        result = await rejectCandidateRegistration(registration.data.id, rejectionReason || undefined)
      } else {
        result = await rejectRecruiterRegistration(registration.data.id, rejectionReason || undefined)
      }

      if (result.success) {
        toast.success('Zgłoszenie zostało odrzucone')
        onOpenChange(false)
        setRejectionReason('')
        setShowRejectDialog(false)
        window.location.reload()
      } else {
        toast.error(result.error || 'Nie udało się odrzucić zgłoszenia')
      }
    } catch (error) {
      console.error('Error rejecting registration:', error)
      toast.error('Wystąpił błąd podczas odrzucania')
    } finally {
      setIsProcessing(false)
    }
  }

  if (registration.type === 'candidate') {
    const data = registration.data
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Szczegóły zgłoszenia kandydata</DialogTitle>
            <DialogDescription>
              Zgłoszenie z {format(new Date(data.created_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Imię i nazwisko</p>
                <p className="text-base font-semibold">{data.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{data.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Specjalizacja</p>
                <p className="text-base">{data.specialization || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lata doświadczenia</p>
                <p className="text-base">{data.experience ? `${data.experience} lat` : '-'}</p>
              </div>
              {data.linkedin_url && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                  <a
                    href={data.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-primary hover:underline flex items-center gap-1"
                  >
                    Link
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {data.source && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Skąd wie o nas</p>
                  <p className="text-base">{data.source}</p>
                </div>
              )}
            </div>

            {data.cv_file_path && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">CV</p>
                <a
                  href={data.cv_file_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Pobierz CV
                </a>
              </div>
            )}

            {data.message && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dodatkowe informacje</p>
                <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md">{data.message}</p>
              </div>
            )}

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
              <Badge
                variant={
                  data.status === 'pending'
                    ? 'outline'
                    : data.status === 'accepted'
                      ? 'default'
                      : 'destructive'
                }
                className={
                  data.status === 'accepted' ? 'bg-green-600' : data.status === 'rejected' ? '' : ''
                }
              >
                {data.status === 'pending'
                  ? 'Oczekujące'
                  : data.status === 'accepted'
                    ? 'Zaakceptowane'
                    : 'Odrzucone'}
              </Badge>
              {data.rejection_reason && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Powód odrzucenia:</span> {data.rejection_reason}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Zamknij
            </Button>
            {data.status === 'pending' && !showRejectDialog && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Odrzuć
                </Button>
                <Button onClick={handleApprove} disabled={isProcessing}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Akceptuj
                </Button>
              </div>
            )}
            {data.status === 'pending' && showRejectDialog && (
              <div className="flex flex-col gap-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Powód odrzucenia (opcjonalnie)</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Wpisz powód odrzucenia zgłoszenia..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false)
                      setRejectionReason('')
                    }}
                    disabled={isProcessing}
                  >
                    Anuluj
                  </Button>
                  <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Potwierdź odrzucenie
                  </Button>
                </div>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Recruiter registration
  const data = registration.data
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>Szczegóły zgłoszenia rekrutera</DialogTitle>
          <DialogDescription>
            Zgłoszenie z {format(new Date(data.created_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Imię i nazwisko</p>
              <p className="text-base font-semibold">{data.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{data.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Firma</p>
              <p className="text-base">{data.company}</p>
            </div>
            {data.company_url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Strona firmy</p>
                <a
                  href={data.company_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline flex items-center gap-1"
                >
                  Link
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {data.linkedin_url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
                <a
                  href={data.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline flex items-center gap-1"
                >
                  Link
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {data.source && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Skąd wie o nas</p>
                <p className="text-base">{data.source}</p>
              </div>
            )}
          </div>

          {data.message && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Dodatkowe informacje</p>
              <p className="text-base whitespace-pre-wrap bg-muted p-3 rounded-md">{data.message}</p>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Status</p>
            <Badge
              variant={
                data.status === 'pending'
                  ? 'outline'
                  : data.status === 'accepted'
                    ? 'default'
                    : 'destructive'
              }
              className={
                data.status === 'accepted' ? 'bg-green-600' : data.status === 'rejected' ? '' : ''
              }
            >
              {data.status === 'pending'
                ? 'Oczekujące'
                : data.status === 'accepted'
                  ? 'Zaakceptowane'
                  : 'Odrzucone'}
            </Badge>
            {data.rejection_reason && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-medium">Powód odrzucenia:</span> {data.rejection_reason}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
            Zamknij
          </Button>
          {data.status === 'pending' && !showRejectDialog && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Odrzuć
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Akceptuj
              </Button>
            </div>
          )}
          {data.status === 'pending' && showRejectDialog && (
            <div className="flex flex-col gap-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason-recruiter">Powód odrzucenia (opcjonalnie)</Label>
                <Textarea
                  id="rejection-reason-recruiter"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Wpisz powód odrzucenia zgłoszenia..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(false)
                    setRejectionReason('')
                  }}
                  disabled={isProcessing}
                >
                  Anuluj
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Potwierdź odrzucenie
                </Button>
              </div>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

