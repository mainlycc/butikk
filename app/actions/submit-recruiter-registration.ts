"use server"

import { getSupabaseServerClient } from "@/lib/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type SubmitRecruiterRegistrationResult = {
  success: boolean
  error?: string
}

export async function submitRecruiterRegistration(
  formData: FormData
): Promise<SubmitRecruiterRegistrationResult> {
  try {
    // Pobierz dane z formularza
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const company = formData.get("company") as string
    const companyUrl = formData.get("companyUrl") as string | null
    const linkedinUrl = formData.get("linkedinUrl") as string | null
    const source = formData.get("source") as string | null
    const message = formData.get("message") as string | null

    // Walidacja podstawowych pól
    if (!fullName || !email || !company || !companyUrl || !linkedinUrl) {
      return { success: false, error: "Wypełnij wszystkie wymagane pola" }
    }

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Nieprawidłowy adres email" }
    }

    // Walidacja URL-i
    try {
      if (companyUrl) new URL(companyUrl)
      if (linkedinUrl) new URL(linkedinUrl)
    } catch {
      return { success: false, error: "Nieprawidłowy format URL" }
    }

    // Sprawdź czy nie ma już pending zgłoszenia z tym emailem
    const supabase = await getSupabaseServerClient()
    const { data: existingRegistration } = await supabase
      .from("recruiter_registrations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .maybeSingle()

    if (existingRegistration) {
      return { success: false, error: "Masz już oczekujące zgłoszenie z tym adresem email" }
    }

    // Zapisanie do bazy danych (używamy admin client, aby ominąć RLS dla INSERT)
    const adminClient = createAdminClient()
    const { error: insertError } = await adminClient
      .from("recruiter_registrations")
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        company: company.trim(),
        company_url: companyUrl?.trim() || null,
        linkedin_url: linkedinUrl?.trim() || null,
        source: source || null,
        message: message?.trim() || null,
        status: "pending",
      })

    if (insertError) {
      console.error("Error inserting recruiter registration:", insertError)
      return { success: false, error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }
    }

    revalidatePath("/dashboard/registrations")
    
    return { success: true }
  } catch (error) {
    console.error("Error in submitRecruiterRegistration:", error)
    return { success: false, error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie." }
  }
}

