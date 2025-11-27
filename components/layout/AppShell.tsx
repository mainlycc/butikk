'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './sidebar'

type UserProfile = {
  id: string
  email: string
  role: 'admin' | 'user'
}

type AuthUser = {
  id: string
  email?: string
}

export default function AppShell({
  authUser,
  userProfile,
  children,
}: {
  authUser: AuthUser | null
  userProfile: UserProfile | null
  children: React.ReactNode
}) {
  // Jeśli brak zalogowanego użytkownika (np. strony publiczne), renderuj bez shell'a
  if (!authUser) {
    return <>{children}</>
  }

  // Użyj userProfile jeśli istnieje, w przeciwnym razie użyj danych z authUser z domyślną rolą
  const user: UserProfile = userProfile || {
    id: authUser.id,
    email: authUser.email || '',
    role: 'user', // Domyślna rola jeśli brak profilu w bazie
  }

  return (
    <SidebarProvider className="!h-full !min-h-0">
      <AppSidebar user={user} />
      <SidebarInset className="h-full overflow-hidden">
        <div className="h-full overflow-y-auto p-6 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

