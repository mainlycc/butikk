import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersManagement } from './users-management'
import { getUsersForAdmin } from '@/lib/actions/users'

export default async function UsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Sprawdzenie roli użytkownika (analogicznie do strony zaproszeń)
  const {
    data: currentUser,
    error: userError,
  } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError) {
    console.error('Error fetching user:', userError)

    // Fallback z admin clientem w razie problemów z RLS
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
            Błąd podczas sprawdzania uprawnień. Uruchom skrypt SQL: scripts/012-fix-users-rls-no-recursion.sql
          </p>
          <p className="text-xs text-muted-foreground mt-2">User ID: {user.id}</p>
        </div>
      )
    }
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10">
        <p className="text-sm text-destructive font-medium">
          Brak dostępu. Ta strona jest dostępna tylko dla administratorów.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Twoja rola: {currentUser?.role || 'nie ustawiona'}
        </p>
      </div>
    )
  }

  const users = await getUsersForAdmin()

  return (
    <div className="space-y-4">
      <UsersManagement users={users} />
    </div>
  )
}


