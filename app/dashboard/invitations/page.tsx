import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getInvitations } from '@/lib/actions/invitations'
import { InvitationsManagement } from './invitations-management'

export default async function InvitationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Sprawdź uprawnienia - użyj zwykłego klienta, policy powinna pozwalać na odczyt
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
    } catch (adminError) {
      return (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <p className="text-sm text-destructive font-medium">
            Błąd podczas sprawdzania uprawnień. Uruchom skrypt SQL: scripts/012-fix-users-rls-no-recursion.sql
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            User ID: {user.id}
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
        <p className="text-xs text-muted-foreground mt-2">
          User ID: {user.id}, Email: {user.email}
        </p>
        <p className="text-xs text-muted-foreground">
          Upewnij się, że masz rekord w tabeli users z odpowiednią rolą.
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

  const invitations = await getInvitations()

  return (
    <div className="space-y-4">
      <InvitationsManagement invitations={invitations} />
    </div>
  )
}

