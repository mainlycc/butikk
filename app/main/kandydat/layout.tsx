import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "Rejestracja kandydata",
  description: "Dołącz do naszej bazy talentów IT. Zarejestruj się jako kandydat i otrzymuj dopasowane oferty pracy od najlepszych firm technologicznych.",
  alternates: {
    canonical: `${baseUrl}/main/kandydat`,
  },
  openGraph: {
    title: "Rejestracja kandydata | QualiBase",
    description: "Dołącz do naszej bazy talentów IT. Zarejestruj się jako kandydat i otrzymuj dopasowane oferty pracy od najlepszych firm technologicznych.",
    url: `${baseUrl}/main/kandydat`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rejestracja kandydata - QualiBase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejestracja kandydata | QualiBase",
    description: "Dołącz do naszej bazy talentów IT. Zarejestruj się jako kandydat i otrzymuj dopasowane oferty pracy.",
    images: ["/og-image.jpg"],
  },
}

export default function KandydatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

