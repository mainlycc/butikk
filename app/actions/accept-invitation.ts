"use server"

import { getSupabaseServerClient } from "@/lib/server"

export async function getInvitation(token: string) {
  const supabase = await getSupabaseServerClient()

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (error || !invitation) {
    return { success: false, error: "Nieprawidłowy lub wykorzystany token" }
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false, error: "Zaproszenie wygasło" }
  }

  return { success: true, invitation }
}

export async function acceptInvitation(token: string, email: string, password: string) {
  const supabase = await getSupabaseServerClient()

  // Verify invitation
  const invitationResult = await getInvitation(token)
  if (!invitationResult.success) {
    return invitationResult
  }

  const invitation = invitationResult.invitation

  // Check if email matches
  if (invitation.email !== email) {
    return { success: false, error: "Email nie zgadza się z zaproszeniem" }
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { success: false, error: "Błąd podczas tworzenia konta" }
  }

  // Create user record with role
  const { error: userError } = await supabase.from("users").insert({
    id: authData.user.id,
    email,
    role: invitation.role,
    invited_by: invitation.created_by || invitation.invited_by,
    invited_at: new Date().toISOString(),
  })

  if (userError) {
    return { success: false, error: "Błąd podczas tworzenia profilu użytkownika" }
  }

  // Mark invitation as accepted
  await supabase.from("invitations").update({ status: "accepted" }).eq("token", token)

  return { success: true }
}
