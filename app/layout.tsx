import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/seo/structured-data"
import { GoogleTagManagerBody, GoogleTagManagerHead } from "@/components/google-tag-manager"

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.qualibase.pl'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Qualibase - Platforma Rekrutacyjna IT",
    template: "%s | Qualibase"
  },
  description: "Znajdź topowe talenty IT szybciej niż kiedykolwiek. Qualibase łączy najlepsze firmy ze zweryfikowanymi specjalistami IT. Platforma rekrutacyjna dla branży IT.",
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
  authors: [{ name: "Qualibase" }],
  creator: "Qualibase",
  publisher: "Qualibase",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: baseUrl,
    siteName: "Qualibase",
    title: "Qualibase - Platforma Rekrutacyjna IT",
    description: "Znajdź topowe talenty IT szybciej niż kiedykolwiek. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT bezpośrednio.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Qualibase - Platforma Rekrutacyjna IT",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qualibase - Platforma Rekrutacyjna IT",
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
    <html lang="pl" className={`${inter.variable} h-full overflow-auto`}>
      <head>
        <GoogleTagManagerHead />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${inter.className} antialiased h-full overflow-auto`}>
        <GoogleTagManagerBody />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
