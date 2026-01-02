import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import { createClient } from "@/lib/supabase/server"
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/structured-data"

const geist = Geist({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "QualiBase - Platforma Rekrutacyjna IT",
    template: "%s | QualiBase"
  },
  description: "Znajdź topowe talenty IT szybciej niż kiedykolwiek. QualiBase łączy najlepsze firmy ze zweryfikowanymi specjalistami IT. Platforma rekrutacyjna dla branży IT.",
  keywords: [
    "rekrutacja IT",
    "baza kandydatów IT",
    "rekrutacja programistów",
    "platforma rekrutacyjna",
    "zatrudnianie IT",
    "specjaliści IT",
    "kandydaci IT",
    "rekrutacja techniczna",
    "praca IT",
    "rekruter IT"
  ],
  authors: [{ name: "QualiBase" }],
  creator: "QualiBase",
  publisher: "QualiBase",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: baseUrl,
    siteName: "QualiBase",
    title: "QualiBase - Platforma Rekrutacyjna IT",
    description: "Znajdź topowe talenty IT szybciej niż kiedykolwiek. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "QualiBase - Platforma Rekrutacyjna IT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QualiBase - Platforma Rekrutacyjna IT",
    description: "Znajdź topowe talenty IT szybciej niż kiedykolwiek. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT.",
    images: ["/og-image.jpg"],
    creator: "@qualibase",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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

  const organizationSchema = getOrganizationSchema()
  const websiteSchema = getWebSiteSchema()

  return (
    <html lang="pl" className="h-full overflow-auto">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${geist.className} antialiased h-full overflow-auto`}>
        <AppShell authUser={authUser} userProfile={userProfile}>{children}</AppShell>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
