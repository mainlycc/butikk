'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { Clock, CheckCircle2, XCircle, User, Building2 } from 'lucide-react'
import type { CandidateRegistration, RecruiterRegistration } from '@/app/actions/get-registrations'
import { RegistrationDetailDialog } from './registration-detail-dialog'

interface RegistrationsManagementProps {
  candidateRegistrations: CandidateRegistration[]
  recruiterRegistrations: RecruiterRegistration[]
}

export function RegistrationsManagement({
  candidateRegistrations,
  recruiterRegistrations,
}: RegistrationsManagementProps) {
  const [selectedRegistration, setSelectedRegistration] = useState<
    | { type: 'candidate'; data: CandidateRegistration }
    | { type: 'recruiter'; data: RecruiterRegistration }
    | null
  >(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Oczekujące
          </Badge>
        )
      case 'accepted':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Zaakceptowane
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Odrzucone
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const pendingCandidates = candidateRegistrations.filter((r) => r.status === 'pending').length
  const pendingRecruiters = recruiterRegistrations.filter((r) => r.status === 'pending').length

  return (
    <>
      <Tabs defaultValue="candidates" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Kandydaci
            {pendingCandidates > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingCandidates}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="recruiters" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Rekruterzy
            {pendingRecruiters > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pendingRecruiters}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zgłoszenia kandydatów</CardTitle>
              <CardDescription>
                Lista wszystkich zgłoszeń od kandydatów ({candidateRegistrations.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {candidateRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Brak zgłoszeń kandydatów</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specjalizacja</TableHead>
                      <TableHead>Doświadczenie</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data utworzenia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() =>
                            setSelectedRegistration({ type: 'candidate', data: registration })
                          }
                        >
                          {registration.full_name}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.specialization || '-'}</TableCell>
                        <TableCell>
                          {registration.experience ? `${registration.experience} lat` : '-'}
                        </TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>
                          {format(new Date(registration.created_at), 'dd MMM yyyy, HH:mm', {
                            locale: pl,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zgłoszenia rekruterów</CardTitle>
              <CardDescription>
                Lista wszystkich zgłoszeń od rekruterów ({recruiterRegistrations.length})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recruiterRegistrations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Brak zgłoszeń rekruterów</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Imię i nazwisko</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data utworzenia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recruiterRegistrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell
                          className="font-medium cursor-pointer hover:underline"
                          onClick={() =>
                            setSelectedRegistration({ type: 'recruiter', data: registration })
                          }
                        >
                          {registration.full_name}
                        </TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.company}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>
                          {format(new Date(registration.created_at), 'dd MMM yyyy, HH:mm', {
                            locale: pl,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedRegistration && (
        <RegistrationDetailDialog
          registration={selectedRegistration}
          open={!!selectedRegistration}
          onOpenChange={(open) => {
            if (!open) setSelectedRegistration(null)
          }}
        />
      )}
    </>
  )
}

