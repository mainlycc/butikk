import { getSupabaseServerClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import DatabaseContent from "@/components/database-content"
import { Skeleton } from "@/components/ui/skeleton"
import { shouldSync, syncGoogleSheetsToSupabase } from "@/app/actions/sync-google-sheets"

export const dynamic = "force-dynamic" // Wymuś dynamiczne renderowanie

export default async function DatabasePage() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  const isAdmin = userData?.role === "admin"

  // Automatyczna synchronizacja w tle jeśli minęło wystarczająco czasu
  // Uruchamiamy w tle, nie blokujemy renderowania strony
  const needsSync = await shouldSync(5) // Sprawdzaj co 5 minut
  if (needsSync) {
    // Uruchom synchronizację w tle (nie czekamy na wynik)
    syncGoogleSheetsToSupabase(true).catch((error) => {
      console.error("Background sync error:", error)
    })
  }

  const { data: candidates } = await supabase
    .from("candidates")
    .select("*")
    .order("sheet_row_number", { ascending: true })

  return (
    <Suspense fallback={<DatabaseSkeleton />}>
      <DatabaseContent initialCandidates={candidates || []} userEmail={user.email || ""} isAdmin={isAdmin} />
    </Suspense>
  )
}

function DatabaseSkeleton() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
