'use client'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './sidebar'
import { usePathname } from 'next/navigation'

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
  const pathname = usePathname()

  // Jeśli brak zalogowanego użytkownika (np. strony publiczne), renderuj bez shell'a
  if (!authUser) {
    return <>{children}</>
  }

  // Na stronach /main* nie pokazujemy sidebaru nawet po zalogowaniu
  if (pathname.startsWith('/main')) {
    return <>{children}</>
  }

  // Użyj userProfile jeśli istnieje, w przeciwnym razie użyj danych z authUser z domyślną rolą
  const user: UserProfile = userProfile || {
    id: authUser.id,
    email: authUser.email || '',
    role: 'user', // Domyślna rola jeśli brak profilu w bazie
  }

  return (
    <SidebarProvider className="!min-h-screen w-full overflow-hidden">
      <AppSidebar user={user} />
      <SidebarInset className="min-h-screen overflow-x-hidden">
        <div className="min-h-screen w-full max-w-full px-3 py-4 sm:px-6 sm:py-6 overflow-x-hidden">
          <div className="mb-4 flex items-center justify-between md:hidden">
            <SidebarTrigger />
          </div>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

