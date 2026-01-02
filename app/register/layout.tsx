import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "Rejestracja",
  description: "Utwórz konto w QualiBase. Rejestracja poprzez zaproszenie. Dołącz do platformy rekrutacyjnej dla branży IT.",
  alternates: {
    canonical: `${baseUrl}/register`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Rejestracja | QualiBase",
    description: "Utwórz konto w QualiBase. Rejestracja poprzez zaproszenie. Dołącz do platformy rekrutacyjnej dla branży IT.",
    url: `${baseUrl}/register`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rejestracja - QualiBase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rejestracja | QualiBase",
    description: "Utwórz konto w QualiBase. Rejestracja poprzez zaproszenie.",
    images: ["/og-image.jpg"],
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

