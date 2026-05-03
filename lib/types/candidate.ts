/**
 * Wspólne pola publiczne kandydata (bez danych osobowych).
 */
interface CandidatePublicFields {
  first_name: string | null
  role: string | null
  seniority: string | null
  technologies: string | null
  location: string | null
  experience_years: number | null
  summary: string | null
  availability: string | null
  languages: string | null
  skills: string | null
}

/**
 * Publiczny profil kandydata -- dane widoczne bez autoryzacji.
 * Odpowiada VIEW `public_candidates` w Supabase.
 * Slug jest zawsze obecny (VIEW filtruje WHERE slug IS NOT NULL).
 */
export interface PublicCandidate extends CandidatePublicFields {
  id: string
  slug: string
}

/**
 * Pełny profil kandydata -- wymaga autoryzacji.
 * Odpowiada tabeli `candidates` w Supabase.
 */
export interface PrivateCandidate extends CandidatePublicFields {
  id: string
  sheet_row_number: number
  nr: string | null
  slug: string | null
  last_name: string | null
  candidate_email: string | null
  guardian: string | null
  guardian_email: string | null
  cv: string | null
  cv_pdf_url: string | null
  rate: string | null
  previous_contact: string | null
  project_description: string | null
  last_synced_at: string | null
  created_at: string | null
  updated_at: string | null
}

/**
 * Filtry dla zapytań listingowych kandydatów.
 */
export interface CandidateFilters {
  role?: string
  technology?: string
  location?: string
}

/**
 * Wynik paginowanego zapytania o kandydatów.
 */
export interface PaginatedCandidates<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
