"use server"

import { getSupabaseServerClient } from "@/lib/server"
import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function inviteUser(email: string, role: "user" | "admin") {
  const supabase = await getSupabaseServerClient()

  // Check if current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Nie jesteś zalogowany" }
  }

  // Check admin status
  const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!currentUser || currentUser.role !== "admin") {
    return { success: false, error: "Brak uprawnień administratora" }
  }

  // Generate unique token
  const token = crypto.randomUUID()

  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Create invitation
  const { error: inviteError } = await supabase.from("invitations").insert({
    email,
    token,
    role,
    created_by: user.id,
    expires_at: expiresAt.toISOString(),
    status: "pending",
  })

  if (inviteError) {
    return { success: false, error: "Błąd podczas tworzenia zaproszenia" }
  }

  // Send invitation email
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/accept-invite?token=${token}`

  // Jeśli nie ma klucza API, zwróć informację o trybie demo
  if (!process.env.RESEND_API_KEY || !resend) {
    console.log("[v0] DEMO MODE - Invitation email would be sent:")
    console.log("[v0] To:", email)
    console.log("[v0] Role:", role)
    console.log("[v0] Invite URL:", inviteUrl)
    
    return { 
      success: true, 
      demoMode: true,
      message: "Zaproszenie utworzone (tryb demo - email nie został wysłany). Ustaw RESEND_API_KEY aby wysyłać emaile."
    }
  }

  try {
    await resend.emails.send({
      from: "Butik Kandydatów <onboarding@resend.dev>",
      to: email,
      subject: "Zaproszenie do Butik Kandydatów",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Witaj w Butik Kandydatów!</h2>
          <p>Zostałeś zaproszony jako <strong>${role === "admin" ? "Administrator" : "Użytkownik"}</strong>.</p>
          <p>Kliknij poniższy przycisk, aby zaakceptować zaproszenie i utworzyć konto:</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Akceptuj zaproszenie
          </a>
          <p style="color: #666; font-size: 14px;">Link wygasa za 7 dni.</p>
          <p style="color: #666; font-size: 14px;">Jeśli nie oczekiwałeś tego zaproszenia, zignoruj tę wiadomość.</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Error sending invitation email:", error)
    return { success: false, error: "Błąd podczas wysyłania emaila" }
  }
}
