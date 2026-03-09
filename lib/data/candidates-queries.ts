import { createClient } from "@/lib/supabase/server"
import type {
  PublicCandidate,
  CandidateFilters,
  PaginatedCandidates,
} from "@/lib/types/candidate"
import { slugify } from "@/lib/utils/slug"

const PAGE_SIZE = 20

/**
 * Pobiera publicznych kandydatów z opcjonalnymi filtrami i paginacją.
 */
export async function getPublicCandidates(
  filters: CandidateFilters = {},
  page = 1
): Promise<PaginatedCandidates<PublicCandidate>> {
  const supabase = await createClient()
  const offset = (page - 1) * PAGE_SIZE

  let query = supabase.from("public_candidates").select("*", { count: "exact" })

  if (filters.role) {
    query = query.ilike("role", `%${filters.role}%`)
  }
  if (filters.technology) {
    query = query.ilike("technologies", `%${filters.technology}%`)
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  const { data, count, error } = await query
    .range(offset, offset + PAGE_SIZE - 1)
    .order("seniority", { ascending: true })

  if (error) {
    console.error("getPublicCandidates error:", error)
    return { data: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 0 }
  }

  const total = count ?? 0

  return {
    data: (data ?? []) as PublicCandidate[],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

/**
 * Pobiera wszystkich publicznych kandydatów (bez paginacji) -- do tabeli client-side.
 */
export async function getAllPublicCandidates(
  filters: CandidateFilters = {}
): Promise<PublicCandidate[]> {
  const supabase = await createClient()

  let query = supabase.from("public_candidates").select("*")

  if (filters.role) {
    query = query.ilike("role", `%${filters.role}%`)
  }
  if (filters.technology) {
    query = query.ilike("technologies", `%${filters.technology}%`)
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  const { data, error } = await query.order("seniority", { ascending: true })

  if (error) {
    console.error("getAllPublicCandidates error:", error)
    return []
  }

  return (data ?? []) as PublicCandidate[]
}

/**
 * Pobiera liczbę kandydatów dla danego zestawu filtrów (do kontroli noindex).
 */
export async function getPublicCandidatesCount(
  filters: CandidateFilters = {}
): Promise<number> {
  const supabase = await createClient()

  let query = supabase
    .from("public_candidates")
    .select("*", { count: "exact", head: true })

  if (filters.role) {
    query = query.ilike("role", `%${filters.role}%`)
  }
  if (filters.technology) {
    query = query.ilike("technologies", `%${filters.technology}%`)
  }
  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  const { count, error } = await query

  if (error) {
    console.error("getPublicCandidatesCount error:", error)
    return 0
  }

  return count ?? 0
}

/**
 * Pobiera unikalne role dostępne w bazie (do nawigacji/filtrów).
 */
export async function getAvailableRoles(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("public_candidates")
    .select("role")
    .not("role", "is", null)

  if (error || !data) return []

  const unique = [...new Set(data.map((r) => r.role as string).filter(Boolean))]
  return unique.sort()
}

/**
 * Pobiera unikalne technologie dla danej roli.
 */
export async function getAvailableTechnologies(role?: string): Promise<string[]> {
  const supabase = await createClient()

  let query = supabase
    .from("public_candidates")
    .select("technologies")
    .not("technologies", "is", null)

  if (role) {
    query = query.ilike("role", `%${role}%`)
  }

  const { data, error } = await query

  if (error || !data) return []

  const techSet = new Set<string>()
  for (const row of data) {
    const techs = (row.technologies as string)?.split(",") ?? []
    for (const t of techs) {
      const trimmed = t.trim()
      if (trimmed) techSet.add(trimmed)
    }
  }

  return [...techSet].sort()
}

/**
 * Pobiera unikalne lokalizacje dla danej roli i technologii.
 */
export async function getAvailableLocations(
  role?: string,
  technology?: string
): Promise<string[]> {
  const supabase = await createClient()

  let query = supabase
    .from("public_candidates")
    .select("location")
    .not("location", "is", null)

  if (role) {
    query = query.ilike("role", `%${role}%`)
  }
  if (technology) {
    query = query.ilike("technologies", `%${technology}%`)
  }

  const { data, error } = await query

  if (error || !data) return []

  const unique = [...new Set(data.map((r) => r.location as string).filter(Boolean))]
  return unique.sort()
}

/**
 * Pobiera publicznego kandydata po slugu.
 */
export async function getCandidateBySlug(
  slug: string
): Promise<PublicCandidate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("public_candidates")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) return null
  return data as PublicCandidate
}

/**
 * Pobiera wszystkie slugi, role, technologie i lokalizacje do generowania statycznych ścieżek.
 */
export async function getAllPublicSlugs(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("public_candidates")
    .select("slug")

  if (error || !data) return []
  return data.map((r) => r.slug as string).filter(Boolean)
}

/**
 * Pobiera wszystkie kombinacje rola/technologia/lokalizacja do sitemapy.
 * Zwraca tylko kombinacje z >= minCount kandydatów.
 */
export async function getIndexableListingPaths(minCount = 5): Promise<{
  roles: string[]
  roleTech: { role: string; technology: string }[]
  roleTechLocation: { role: string; technology: string; location: string }[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("public_candidates")
    .select("role, technologies, location")

  if (error || !data) {
    return { roles: [], roleTech: [], roleTechLocation: [] }
  }

  const roleCounts = new Map<string, number>()
  const roleTechCounts = new Map<string, number>()
  const roleTechLocCounts = new Map<string, number>()

  for (const row of data) {
    const role = row.role as string | null
    const location = row.location as string | null
    const techs = ((row.technologies as string) ?? "")
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean)

    if (!role) continue

    const roleSlug = slugify(role)
    roleCounts.set(roleSlug, (roleCounts.get(roleSlug) ?? 0) + 1)

    for (const tech of techs) {
      const techSlug = slugify(tech)
      const rtKey = `${roleSlug}|${techSlug}`
      roleTechCounts.set(rtKey, (roleTechCounts.get(rtKey) ?? 0) + 1)

      if (location) {
        const locSlug = slugify(location)
        const rtlKey = `${roleSlug}|${techSlug}|${locSlug}`
        roleTechLocCounts.set(rtlKey, (roleTechLocCounts.get(rtlKey) ?? 0) + 1)
      }
    }
  }

  const roles = [...roleCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([role]) => role)

  const roleTech = [...roleTechCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([key]) => {
      const [role, technology] = key.split("|")
      return { role, technology }
    })

  const roleTechLocation = [...roleTechLocCounts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([key]) => {
      const [role, technology, location] = key.split("|")
      return { role, technology, location }
    })

  return { roles, roleTech, roleTechLocation }
}
