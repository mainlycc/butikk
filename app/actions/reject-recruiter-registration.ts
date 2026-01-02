"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendRejectionEmail } from "@/lib/email/send"

export type RejectRecruiterRegistrationResult = {
  success: boolean
  error?: string
}

export async function rejectRecruiterRegistration(
  registrationId: string,
  reason?: string
): Promise<RejectRecruiterRegistrationResult> {
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
      .from("recruiter_registrations")
      .select("*")
      .eq("id", registrationId)
      .single()

    if (fetchError || !registration) {
      return { success: false, error: "Nie znaleziono zgłoszenia" }
    }

    if (registration.status !== "pending") {
      return { success: false, error: "Zgłoszenie zostało już przetworzone" }
    }

    // Aktualizuj status zgłoszenia
    const { error: updateError } = await adminClient
      .from("recruiter_registrations")
      .update({
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason || null,
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Error updating registration status:", updateError)
      return { success: false, error: "Nie udało się zaktualizować statusu zgłoszenia" }
    }

    // Wyślij email z odmową
    await sendRejectionEmail({
      to: registration.email,
      fullName: registration.full_name,
      reason: reason,
    })

    revalidatePath("/dashboard/registrations")

    return { success: true }
  } catch (error) {
    console.error("Error in rejectRecruiterRegistration:", error)
    return { success: false, error: "Wystąpił nieoczekiwany błąd" }
  }
}

