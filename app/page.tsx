import { getSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import LandingContent from "@/components/landing-content"
import { Skeleton } from "@/components/ui/skeleton"

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/database")
  }

  const infoData = {
    title: "Butik Kandydatów",
    description: "Nowoczesna platforma rekrutacyjna dla efektywnego zarządzania bazą kandydatów",
    instructions: [
      "Zaloguj się swoim adresem email i hasłem",
      "Użyj wyszukiwarki, aby filtrować kandydatów według słów kluczowych (oddziel przecinkami)",
      "Zaznacz interesujących kandydatów i przeglądaj ich CV w formie slajdów",
      "Wyślij zapytanie kontaktowe do opiekunów wybranych kandydatów",
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LandingSkeleton />}>
        <LandingContent infoData={infoData} />
      </Suspense>
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
