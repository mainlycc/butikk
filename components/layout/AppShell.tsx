'use client'

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './sidebar'

type UserProfile = {
  id: string
  email: string
  role: 'admin' | 'user'
}

export default function AppShell({
  user,
  children,
}: {
  user: UserProfile | null
  children: React.ReactNode
}) {
  // Jeśli brak użytkownika (np. strony publiczne), renderuj bez shell'a
  if (!user) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

