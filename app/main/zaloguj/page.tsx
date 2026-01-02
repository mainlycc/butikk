import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { TopNav } from "@/components/layout/top-nav"
import LandingContent from "@/components/landing-content"
import { Skeleton } from "@/components/ui/skeleton"
import { getSupabaseServerClient } from "@/lib/server"
import { Network, Globe, Mail, Share2 } from "lucide-react"

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
      <footer className="bg-white border-t pt-16 pb-8 px-4 sm:px-10">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-foreground">
              <Network className="text-primary w-6 h-6" />
              <h3 className="text-lg font-bold">Qualibase</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Nowoczesna platforma rekrutacyjna dla branży IT.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Platforma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Przeglądaj oferty
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Baza kandydatów
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Firma</h4>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              O nas
            </Link>
            <Link href="#" className="text-muted-foreground text-sm hover:text-primary">
              Kontakt
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-foreground text-sm font-bold uppercase tracking-wide">Social</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© 2024 Qualibase Inc. Wszelkie prawa zastrzeżone.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Polityka Prywatności
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Regulamin
            </Link>
          </div>
        </div>
      </footer>
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
