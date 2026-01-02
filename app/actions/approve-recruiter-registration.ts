"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendInvitationEmail } from "@/lib/email/send"

export type ApproveRecruiterRegistrationResult = {
  success: boolean
  error?: string
}

export async function approveRecruiterRegistration(
  registrationId: string
): Promise<ApproveRecruiterRegistrationResult> {
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

    // Sprawdź czy użytkownik z tym emailem już istnieje
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id")
      .eq("email", registration.email)
      .single()

    if (existingUser) {
      return { success: false, error: "Użytkownik z tym adresem email już istnieje" }
    }

    // Sprawdź czy istnieje aktywne zaproszenie dla tego emaila
    const { data: existingInvitation } = await adminClient
      .from("invitations")
      .select("id")
      .eq("email", registration.email)
      .eq("status", "pending")
      .maybeSingle()

    if (existingInvitation) {
      return { success: false, error: "Aktywne zaproszenie dla tego emaila już istnieje" }
    }

    // Ustaw datę wygaśnięcia na 7 dni od teraz
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Generuj unikalny token
    const token = crypto.randomUUID()

    // Utwórz zaproszenie (używamy admin client)
    const { error: inviteError } = await adminClient.from("invitations").insert({
      email: registration.email,
      token,
      role: "user",
      created_by: user.id,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })

    if (inviteError) {
      console.error("Error creating invitation:", inviteError)
      return { success: false, error: "Nie udało się utworzyć zaproszenia" }
    }

    // Wyślij email z zaproszeniem
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const invitationLink = `${baseUrl}/register?token=${token}`

    const emailResult = await sendInvitationEmail({
      to: registration.email,
      invitationLink,
      expiryDays: 7,
    })

    if (!emailResult.success) {
      console.error("Error sending invitation email:", emailResult.error)
      // Zaproszenie zostało utworzone, więc kontynuujemy mimo błędu emaila
    }

    // Aktualizuj status zgłoszenia
    const { error: updateError } = await adminClient
      .from("recruiter_registrations")
      .update({
        status: "accepted",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", registrationId)

    if (updateError) {
      console.error("Error updating registration status:", updateError)
      // Zaproszenie zostało wysłane, więc to nie jest krytyczny błąd
    }

    revalidatePath("/dashboard/registrations")
    revalidatePath("/dashboard/invitations")

    return { success: true }
  } catch (error) {
    console.error("Error in approveRecruiterRegistration:", error)
    return { success: false, error: "Wystąpił nieoczekiwany błąd" }
  }
}

