"use server"

import { getSupabaseServerClient } from "@/lib/server"
import { createAdminClient } from "@/lib/supabase/admin"

export type UpdatePasswordResult = {
  success: boolean
  error?: string
}

export async function validatePasswordResetToken(token: string): Promise<{
  valid: boolean
  error?: string
  email?: string
}> {
  const supabase = await getSupabaseServerClient()

  // Pobierz token resetu
  const { data: passwordReset, error } = await supabase
    .from("password_resets")
    .select("*")
    .eq("token", token)
    .single()

  if (error || !passwordReset) {
    return { valid: false, error: "Nieprawidłowy token resetu hasła" }
  }

  // Sprawdź czy token został już użyty
  if (passwordReset.used_at) {
    return { valid: false, error: "Ten token resetu hasła został już wykorzystany" }
  }

  // Sprawdź czy token nie wygasł
  if (new Date(passwordReset.expires_at) < new Date()) {
    return { valid: false, error: "Token resetu hasła wygasł. Poproś o nowy link." }
  }

  return { valid: true, email: passwordReset.email }
}

export async function updatePassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<UpdatePasswordResult> {
  // Walidacja haseł
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Hasło musi mieć co najmniej 6 znaków" }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Hasła nie są identyczne" }
  }

  // Waliduj token
  const tokenValidation = await validatePasswordResetToken(token)
  if (!tokenValidation.valid || !tokenValidation.email) {
    return { success: false, error: tokenValidation.error || "Nieprawidłowy token" }
  }

  const email = tokenValidation.email

  // Znajdź użytkownika w Supabase Auth przez Admin API
  const adminClient = createAdminClient()

  const { data: usersList } = await adminClient.auth.admin.listUsers()
  const user = usersList?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

  if (!user) {
    return { success: false, error: "Użytkownik nie został znaleziony" }
  }

  // Aktualizuj hasło użytkownika
  const { error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (updateError) {
    console.error("Error updating password:", updateError)
    return { success: false, error: "Nie udało się zaktualizować hasła" }
  }

  // Oznacz token jako użyty
  const supabase = await getSupabaseServerClient()
  const { error: markUsedError } = await supabase
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)

  if (markUsedError) {
    console.error("Error marking token as used:", markUsedError)
    // Nie zwracamy błędu - hasło zostało zaktualizowane
  }

  return { success: true }
}

