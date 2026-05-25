import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.qualibase.pl'

export const metadata: Metadata = {
  title: "Rejestracja rekrutera",
  description: "Zgłoś swoją firmę do bazy Qualibase. Znajdź najlepszych specjalistów IT dla swojej organizacji. Platforma rekrutacyjna dla firm technologicznych.",
  alternates: {
    canonical: `${baseUrl}/rekruter`,
  },
  openGraph: {
    title: "Rejestracja rekrutera | Qualibase",
    description: "Zgłoś swoją firmę do bazy Qualibase. Znajdź najlepszych specjalistów IT dla swojej organizacji. Platforma rekrutacyjna dla firm technologicznych.",
    url: `${baseUrl}/rekruter`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rejestracja rekrutera - Qualibase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejestracja rekrutera | Qualibase",
    description: "Zgłoś swoją firmę do bazy Qualibase. Znajdź najlepszych specjalistów IT dla swojej organizacji.",
    images: ["/og-image.jpg"],
  },
}

export default function RekruterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
