'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
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
    <SidebarProvider className="!h-full !min-h-0">
      <AppSidebar user={user} />
      <SidebarInset className="min-h-screen">
        <div className="min-h-screen p-6 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}

