import { getSupabaseServerClient } from "@/lib/server"
import { redirect, notFound } from "next/navigation"
import { Suspense } from "react"
import CandidateView from "@/components/candidate-view"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"

interface Candidate {
  id: string
  sheet_row_number?: number
  nr?: string | null
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  location?: string | null
  candidate_email?: string | null
  guardian: string | null
  guardian_email?: string | null
  cv: string | null
  cv_pdf_url?: string | null
  technologies: string | null
  previous_contact: string | null
  project_description: string | null
  skills?: string | null
  languages?: string | null
  availability?: string | null
}

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
    redirect("/")
  }

  // Pobierz dane kandydata
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !candidate) {
    notFound()
  }

  // Pobierz listę zaznaczonych kandydatów jeśli są podane
  let selectedCandidates: Candidate[] = []
  if (selectedIds.length > 0) {
    const { data: candidates } = await supabase
      .from("candidates")
      .select("*")
      .in("id", selectedIds)
      .order("sheet_row_number", { ascending: true })
    
    selectedCandidates = (candidates || []) as Candidate[]
  } else {
    // Jeśli nie ma zaznaczonych, pobierz wszystkich kandydatów
    const { data: allCandidates } = await supabase
      .from("candidates")
      .select("*")
      .order("sheet_row_number", { ascending: true })
    
    selectedCandidates = (allCandidates || []) as Candidate[]
  }

  // Znajdź indeks aktualnego kandydata w liście
  const currentIndex = selectedCandidates.findIndex((c) => c.id === id)
  const currentCandidate = candidate as Candidate

  // Znajdź poprzedniego i następnego kandydata
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

