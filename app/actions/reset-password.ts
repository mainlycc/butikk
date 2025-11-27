"use server"

import { getSupabaseServerClient } from "@/lib/server"
import { sendPasswordResetEmail } from "@/lib/email/send"

export type RequestPasswordResetResult = {
  success: boolean
  error?: string
  message?: string
}

export async function requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
  const supabase = await getSupabaseServerClient()

  // Walidacja emaila
  if (!email || !email.trim() || !email.includes("@")) {
    return { success: false, error: "Proszę wprowadzić poprawny adres e-mail" }
  }

  const emailLower = email.trim().toLowerCase()

  // Sprawdź czy użytkownik z tym emailem istnieje w systemie
  // Używamy Admin API żeby sprawdzić czy użytkownik istnieje w auth
  const { createAdminClient } = await import("@/lib/supabase/admin")
  const adminClient = createAdminClient()

  const { data: usersList } = await adminClient.auth.admin.listUsers()
  const existingUser = usersList?.users?.find(
    (u) => u.email?.toLowerCase() === emailLower
  )

  if (!existingUser) {
    // Nie ujawniamy, że użytkownik nie istnieje (bezpieczeństwo)
    // Zawsze zwracamy sukces, aby nie pomagać potencjalnym atakującym
    return {
      success: true,
      message: "Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła.",
    }
  }

  // Sprawdź czy istnieje już aktywny token resetu (nieużyty i niewygasły)
  const { data: existingReset } = await supabase
    .from("password_resets")
    .select("*")
    .eq("email", emailLower)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (existingReset) {
    // Nie tworzymy nowego tokenu, ale też nie ujawniamy że już istnieje
    return {
      success: true,
      message: "Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła.",
    }
  }

  // Generuj unikalny token UUID
  const token = crypto.randomUUID()

  // Ustaw datę wygaśnięcia na 1 godzinę od teraz
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)

  // Utwórz rekord resetu hasła
  const { data: passwordReset, error: insertError } = await supabase
    .from("password_resets")
    .insert({
      email: emailLower,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (insertError || !passwordReset) {
    console.error("Error creating password reset:", insertError)
    return { success: false, error: "Nie udało się utworzyć żądania resetu hasła" }
  }

  // Wyślij email z linkiem resetu
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetLink = `${baseUrl}/update-password?token=${token}`

  const emailResult = await sendPasswordResetEmail({
    to: emailLower,
    resetLink,
    expiryHours: 1,
  })

  if (!emailResult.success) {
    console.error("Failed to send password reset email:", emailResult.error)
    // Usuń token jeśli email nie został wysłany
    await supabase.from("password_resets").delete().eq("id", passwordReset.id)
    
    // Jeśli brak RESEND_API_KEY, zwróć informację o trybie demo
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error:
          "Brak skonfigurowanego klucza RESEND_API_KEY. Email nie został wysłany. Link do resetu: " +
          resetLink,
      }
    }
    
    return {
      success: false,
      error: "Nie udało się wysłać emaila. Spróbuj ponownie później.",
    }
  }

  console.log("Password reset email sent successfully to:", emailLower)

  return {
    success: true,
    message: "Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła.",
  }
}

