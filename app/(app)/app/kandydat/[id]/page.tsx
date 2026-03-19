import { getSupabaseServerClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import CandidateView from "@/components/candidate-view"
import { Skeleton } from "@/components/ui/skeleton"
import type { PrivateCandidate } from "@/lib/types/candidate"
import { normalizeTechnologies, techOverlapScore } from "@/lib/utils/similar-candidates"

export const dynamic = "force-dynamic"

type Candidate = PrivateCandidate

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ selected?: string }>
}

export default async function CandidatePage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { id } = params
  const selectedIds = searchParams.selected ? searchParams.selected.split(",") : []

  const supabase = await getSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/app/login")
  }

  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  let selectedCandidates: Candidate[] = []
  if (selectedIds.length > 0) {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("*")
      .in("id", selectedIds)
      .order("sheet_row_number", { ascending: true })
    
    selectedCandidates = (candidates || []) as Candidate[]
  } else {
    const { data: allCandidates } = await supabase
      .from("candidates")
      .select("*")
      .order("sheet_row_number", { ascending: true })
    
    selectedCandidates = (allCandidates || []) as Candidate[]
  }

  const currentIndex = selectedCandidates.findIndex((c) => c.id === id)
  const currentCandidate = candidate as Candidate

  const previousCandidate = currentIndex > 0 ? selectedCandidates[currentIndex - 1] : null
  const nextCandidate = currentIndex < selectedCandidates.length - 1 ? selectedCandidates[currentIndex + 1] : null

  // Podobne kandydatury (globalnie) wg wspólnych technologii
  const { data: allCandidatesMinimal } = await supabase
    .from("candidates")
    .select("id, role, seniority, technologies, location, sheet_row_number")
    .order("sheet_row_number", { ascending: true })

  const currentTech = normalizeTechnologies(currentCandidate.technologies)
  const similarCandidates =
    currentTech.length === 0 || !allCandidatesMinimal
      ? []
      : (allCandidatesMinimal as Array<Pick<Candidate, "id" | "role" | "seniority" | "technologies" | "location" | "sheet_row_number">>)
          .filter((c) => c.id !== currentCandidate.id)
          .map((c) => ({
            ...c,
            _score: techOverlapScore(currentTech, normalizeTechnologies(c.technologies)),
          }))
          .filter((c) => c._score > 0)
          .sort((a, b) => {
            if (b._score !== a._score) return b._score - a._score
            return (a.sheet_row_number ?? 0) - (b.sheet_row_number ?? 0)
          })
          .slice(0, 3)
          .map(({ _score, ...c }) => c)

  return (
    <div className="w-full space-y-6">
      <Suspense fallback={<CandidateSkeleton />}>
        <CandidateView
          candidate={currentCandidate}
          similarCandidates={similarCandidates}
          previousCandidate={previousCandidate}
          nextCandidate={nextCandidate}
          currentIndex={currentIndex}
          totalCount={selectedCandidates.length}
          userEmail={user.email || ""}
          selectedIds={selectedIds}
        />
      </Suspense>
    </div>
  )
}

function CandidateSkeleton() {
  return (
    <div className="w-full space-y-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}
