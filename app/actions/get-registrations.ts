"use server"

import { createClient } from "@/lib/supabase/server"

export type CandidateRegistration = {
  id: string
  full_name: string
  email: string
  specialization: string | null
  experience: number | null
  linkedin_url: string | null
  source: string | null
  message: string | null
  cv_file_path: string | null
  status: 'pending' | 'accepted' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export type RecruiterRegistration = {
  id: string
  full_name: string
  email: string
  company: string
  company_url: string | null
  linkedin_url: string | null
  source: string | null
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export async function getRegistrations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false as const, error: "Nie jesteś zalogowany" }
  }

  // Check admin status
  const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "admin") {
    return { success: false as const, error: "Brak uprawnień administratora" }
  }

  // Pobierz zgłoszenia kandydatów
  const { data: candidateRegistrations, error: candidateError } = await supabase
    .from("candidate_registrations")
    .select("*")
    .order("created_at", { ascending: false })

  if (candidateError) {
    console.error("Error fetching candidate registrations:", candidateError)
    return { success: false as const, error: "Błąd podczas pobierania zgłoszeń kandydatów" }
  }

  // Pobierz zgłoszenia rekruterów
  const { data: recruiterRegistrations, error: recruiterError } = await supabase
    .from("recruiter_registrations")
    .select("*")
    .order("created_at", { ascending: false })

  if (recruiterError) {
    console.error("Error fetching recruiter registrations:", recruiterError)
    return { success: false as const, error: "Błąd podczas pobierania zgłoszeń rekruterów" }
  }

  return {
    success: true as const,
    candidateRegistrations: (candidateRegistrations || []) as CandidateRegistration[],
    recruiterRegistrations: (recruiterRegistrations || []) as RecruiterRegistration[],
  }
}

