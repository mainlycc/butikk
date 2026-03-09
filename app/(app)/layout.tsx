import { createClient } from '@/lib/supabase/server'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/sidebar'

type UserProfile = {
  id: string
  email: string
  role: 'admin' | 'user'
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return <>{children}</>
  }

  let userProfile: UserProfile | null = null

  try {
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', authUser.id)
      .single()

    if (currentUser) {
      userProfile = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role as 'admin' | 'user',
      }
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }

  const user: UserProfile = userProfile || {
    id: authUser.id,
    email: authUser.email || '',
    role: 'user',
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
