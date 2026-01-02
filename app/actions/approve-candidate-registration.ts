"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type ApproveCandidateRegistrationResult = {
  success: boolean
  error?: string
}

/**
 * Konwertuje lata doświadczenia na poziom seniority
 */
function experienceToSeniority(experience: number | null): string {
  if (!experience) return "Junior"
  if (experience <= 2) return "Junior"
  if (experience <= 4) return "Mid"
  if (experience <= 7) return "Senior"
  return "Lead/Expert"
}

export async function approveCandidateRegistration(
  registrationId: string
): Promise<ApproveCandidateRegistrationResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nie jesteś zalogowany" }
    }

    // Check admin status
    const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Brak uprawnień administratora" }
    }

    // Pobierz zgłoszenie (używamy admin client dla RLS)
    const adminClient = createAdminClient()
    const { data: registration, error: fetchError } = await adminClient
      .from("candidate_registrations")
      .select("*")
      .eq("id", registrationId)
      .single()

    if (fetchError || !registration) {
      return { success: false, error: "Nie znaleziono zgłoszenia" }
    }

    if (registration.status !== "pending") {
      return { success: false, error: "Zgłoszenie zostało już przetworzone" }
    }

    // Znajdź największy sheet_row_number i dodaj 1
    const { data: maxRow, error: maxRowError } = await adminClient
      .from("candidates")
      .select("sheet_row_number")
      .order("sheet_row_number", { ascending: false })
      .limit(1)
      .single()

    const nextSheetRowNumber = maxRow?.sheet_row_number
      ? maxRow.sheet_row_number + 1
      : 1

    // Rozdziel pełne imię i nazwisko (prosta logika - bierzemy pierwsze słowo jako imię, reszta jako nazwisko)
    const nameParts = registration.full_name.trim().split(/\s+/)
    const firstName = nameParts[0] || registration.full_name
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null

    // Mapowanie danych z formularza na strukturę candidates
    const candidateData = {
      sheet_row_number: nextSheetRowNumber,
      first_name: firstName,
      last_name: lastName,
      role: registration.specialization || null,
      seniority: experienceToSeniority(registration.experience),
      candidate_email: registration.email,
      cv_pdf_url: registration.cv_file_path,
      previous_contact: registration.linkedin_url || null,
      project_description: registration.message || null,
      // Pozostałe pola pozostawiamy jako null
      rate: null,
      technologies: null,
      cv: null,
      guardian: null,
    }

    // Dodaj kandydata do tabeli candidates (używamy admin client)
    const { error: insertError } = await adminClient.from("candidates").insert(candidateData)

    if (insertError) {
      console.error("Error inserting candidate:", insertError)
      return { success: false, error: "Nie udało się dodać kandydata do bazy" }
    }

    // Aktualizuj status zgłoszenia
    const { error: updateError } = await adminClient
      .from("candidate_registrations")
      .update({
        status: "accepted",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Error updating registration status:", updateError)
      // Kandydat został dodany, więc to nie jest krytyczny błąd
    }

    revalidatePath("/dashboard/registrations")
    revalidatePath("/database")

    return { success: true }
  } catch (error) {
    console.error("Error in approveCandidateRegistration:", error)
    return { success: false, error: "Wystąpił nieoczekiwany błąd" }
  }
}

