import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
