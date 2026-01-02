import type { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "O nas",
  description: "Poznaj QualiBase - platformę rekrutacyjną dla branży IT. Ułatwiamy procesy rekrutacyjne i wspieramy rozwój zawodowy specjalistów IT oraz rekruterów.",
  alternates: {
    canonical: `${baseUrl}/main/o-nas`,
  },
  openGraph: {
    title: "O nas | QualiBase",
    description: "Poznaj QualiBase - platformę rekrutacyjną dla branży IT. Ułatwiamy procesy rekrutacyjne i wspieramy rozwój zawodowy specjalistów IT oraz rekruterów.",
    url: `${baseUrl}/main/o-nas`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "O nas - QualiBase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "O nas | QualiBase",
    description: "Poznaj QualiBase - platformę rekrutacyjną dla branży IT. Ułatwiamy procesy rekrutacyjne i wspieramy rozwój zawodowy.",
    images: ["/og-image.jpg"],
  },
}

export default function ONasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

