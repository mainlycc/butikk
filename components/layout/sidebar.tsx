'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  Database,
  Mail,
  LogOut,
  User,
  Network,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarProps {
  user: {
    id: string
    email: string
    role: 'admin' | 'user'
  }
}

export function AppSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const navigation = [
    {
      name: 'Baza kandydatów',
      href: '/database',
      icon: Database,
      roles: ['admin', 'user']
    },
    {
      name: 'Zgłoszenia',
      href: '/dashboard/registrations',
      icon: Mail,
      roles: ['admin']
    },
    {
      name: 'Zaproszenia',
      href: '/dashboard/invitations',
      icon: Mail,
      roles: ['admin']
    },
    {
      name: 'Użytkownicy',
      href: '/dashboard/users',
      icon: User,
      roles: ['admin']
    },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="text-xs">Admin</Badge>
      case 'user':
        return <Badge variant="secondary" className="text-xs">Użytkownik</Badge>
      default:
        return null
    }
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="p-4">
        <Link href="/main" className="flex items-center gap-2 text-foreground">
          <Network className="text-primary text-3xl" />
          <h2 className="text-foreground text-xl font-bold tracking-tight">Qualibase</h2>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarMenu>
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user.email}
                    </span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <div className="ml-auto">
                    {getRoleBadge(user.role)}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Wyloguj
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

