import type { Metadata } from "next"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import { TopNav } from "@/components/layout/top-nav"
import { Footer } from "@/components/layout/footer"
import LandingContent from "@/components/landing-content"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseServerClient } from "@/lib/server"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export const metadata: Metadata = {
  title: "Logowanie",
  description: "Zaloguj się do QualiBase. Dostęp do bazy kandydatów IT i narzędzi rekrutacyjnych dla rekruterów i firm technologicznych.",
  alternates: {
    canonical: `${baseUrl}/main/zaloguj`,
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Logowanie | QualiBase",
    description: "Zaloguj się do QualiBase. Dostęp do bazy kandydatów IT i narzędzi rekrutacyjnych.",
    url: `${baseUrl}/main/zaloguj`,
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Logowanie - QualiBase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Logowanie | QualiBase",
    description: "Zaloguj się do QualiBase. Dostęp do bazy kandydatów IT i narzędzi rekrutacyjnych.",
    images: ["/og-image.jpg"],
  },
}

export default async function ZalogujPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/database")
  }

  const infoData = {
    title: "",
    description: "Nowoczesna platforma rekrutacyjna dla efektywnego zarządzania bazą kandydatów",
    instructions: [],
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">
        <Suspense fallback={<LandingSkeleton />}>
          <LandingContent infoData={infoData} hideGuide />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

function LandingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <Skeleton className="h-16 w-3/4 mx-auto" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  )
}
