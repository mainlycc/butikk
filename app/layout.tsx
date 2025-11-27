import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import { createClient } from "@/lib/supabase/server"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Butik Kandydatów",
  description: "Baza kandydatów dla rekruterów",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Pobierz użytkownika, aby zdecydować czy renderować AppShell (sidebar)
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let userProfile: {
    id: string
    email: string
    role: 'admin' | 'user'
  } | null = null

  if (authUser) {
    try {
      const { data: currentUser, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
      }

      if (currentUser) {
        userProfile = {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role as 'admin' | 'user',
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error)
    }
  }

  return (
    <html lang="pl" className="h-full overflow-hidden">
      <body className={`${geist.className} antialiased h-full overflow-hidden`}>
        <AppShell authUser={authUser} userProfile={userProfile}>{children}</AppShell>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
