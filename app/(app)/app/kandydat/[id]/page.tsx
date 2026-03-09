import { getSupabaseServerClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import CandidateView from "@/components/candidate-view"
import { Skeleton } from "@/components/ui/skeleton"
import type { PrivateCandidate } from "@/lib/types/candidate"

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

  return (
    <div className="w-full space-y-6">
      <Suspense fallback={<CandidateSkeleton />}>
        <CandidateView
          candidate={currentCandidate}
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
