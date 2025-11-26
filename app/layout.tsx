import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import { createClient } from "@/lib/supabase/server"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

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
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile: {
    id: string
    email: string
    role: 'admin' | 'user'
  } | null = null

  if (user) {
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', user.id)
      .single()

    if (currentUser) {
      userProfile = {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role as 'admin' | 'user',
      }
    }
  }

  return (
    <html lang="pl">
      <body className={`${geist.className} antialiased`}>
        <AppShell user={userProfile}>{children}</AppShell>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
