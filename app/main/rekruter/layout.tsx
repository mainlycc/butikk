import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "Rejestracja rekrutera",
  description: "Zgłoś swoją firmę do bazy QualiBase. Znajdź najlepszych specjalistów IT dla swojej organizacji. Platforma rekrutacyjna dla firm technologicznych.",
  alternates: {
    canonical: `${baseUrl}/main/rekruter`,
  },
  openGraph: {
    title: "Rejestracja rekrutera | QualiBase",
    description: "Zgłoś swoją firmę do bazy QualiBase. Znajdź najlepszych specjalistów IT dla swojej organizacji. Platforma rekrutacyjna dla firm technologicznych.",
    url: `${baseUrl}/main/rekruter`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rejestracja rekrutera - QualiBase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejestracja rekrutera | QualiBase",
    description: "Zgłoś swoją firmę do bazy QualiBase. Znajdź najlepszych specjalistów IT dla swojej organizacji.",
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

