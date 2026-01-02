import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getRegistrations } from '@/app/actions/get-registrations'
import { RegistrationsManagement } from './registrations-management'

export default async function RegistrationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Sprawdź uprawnienia
  const { data: currentUser, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('Error fetching user:', userError)
    // Jeśli nadal jest problem z RLS, użyj admin client jako fallback
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin')
      const adminClient = createAdminClient()
      const { data: adminUserData } = await adminClient
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!adminUserData || adminUserData.role !== 'admin') {
        return (
          <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive font-medium">
              Brak dostępu. Ta strona jest dostępna tylko dla administratorów.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Twoja rola: {adminUserData?.role || 'nie ustawiona'}
            </p>
          </div>
        )
      }
    } catch {
      return (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive font-medium">
            Błąd podczas sprawdzania uprawnień.
          </p>
        </div>
      )
    }
  }

  if (!currentUser) {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive font-medium">
          Nie znaleziono rekordu użytkownika w bazie danych.
        </p>
      </div>
    )
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive font-medium">
          Brak dostępu. Ta strona jest dostępna tylko dla administratorów.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Twoja rola: {currentUser.role || 'nie ustawiona'}
        </p>
      </div>
    )
  }

  const registrationsResult = await getRegistrations()

  if (!registrationsResult.success) {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive font-medium">
          {registrationsResult.error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Zgłoszenia rejestracyjne</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Przeglądaj i zarządzaj zgłoszeniami kandydatów i rekruterów
        </p>
      </div>
      <RegistrationsManagement
        candidateRegistrations={registrationsResult.candidateRegistrations}
        recruiterRegistrations={registrationsResult.recruiterRegistrations}
      />
    </div>
  )
}

