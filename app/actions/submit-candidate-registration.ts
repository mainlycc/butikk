"use server"

import { getSupabaseServerClient } from "@/lib/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

const BUCKET_NAME = "candidate-cvs"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export type SubmitCandidateRegistrationResult = {
  success: boolean
  error?: string
}

/**
 * Uploaduje plik CV do Supabase Storage
 */
async function uploadCVFile(file: File): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    // Sprawdź czy bucket istnieje
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error("Error listing buckets:", listError)
      return null
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      // Spróbuj utworzyć bucket
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        return null
      }
    }

    // Generuj unikalną nazwę pliku
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `registration_${timestamp}_${sanitizedName}`

    // Konwertuj File na ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload pliku
    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading CV to storage:", uploadError)
      return null
    }

    // Pobierz publiczny URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error in uploadCVFile:", error)
    return null
  }
}

export async function submitCandidateRegistration(
  formData: FormData
): Promise<SubmitCandidateRegistrationResult> {
  try {
    // Pobierz dane z formularza
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const specialization = formData.get("specialization") as string
    const experience = formData.get("experience") as string
    const linkedinUrl = formData.get("linkedinUrl") as string | null
    const source = formData.get("source") as string | null
    const message = formData.get("message") as string | null
    const cvFile = formData.get("cvFile") as File | null

    // Walidacja podstawowych pól
    if (!fullName || !email || !phone || !cvFile) {
      return { success: false, error: "Wypełnij wszystkie wymagane pola" }
    }

    // Walidacja emaila
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Nieprawidłowy adres email" }
    }

    // Walidacja rozmiaru pliku
    if (cvFile.size > MAX_FILE_SIZE) {
      return { success: false, error: `Plik CV jest zbyt duży. Maksymalny rozmiar: ${MAX_FILE_SIZE / 1024 / 1024}MB` }
    }

    // Walidacja typu pliku
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowedTypes.includes(cvFile.type)) {
      return { success: false, error: "Nieprawidłowy typ pliku. Dozwolone: PDF, DOC, DOCX" }
    }

    // Sprawdź czy nie ma już pending zgłoszenia z tym emailem
    const supabase = await getSupabaseServerClient()
    const { data: existingRegistration } = await supabase
      .from("candidate_registrations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .maybeSingle()

    if (existingRegistration) {
      return { success: false, error: "Masz już oczekujące zgłoszenie z tym adresem email" }
    }

    // Upload CV
    const cvFileUrl = await uploadCVFile(cvFile)
    if (!cvFileUrl) {
      return { success: false, error: "Nie udało się przesłać pliku CV. Spróbuj ponownie." }
    }

    // Zapisanie do bazy danych (używamy admin client, aby ominąć RLS dla INSERT)
    const adminClient = createAdminClient()
    const { error: insertError } = await adminClient
      .from("candidate_registrations")
      .insert({
        full_name: fullName.trim(),
        email: email.toLowerCase().trim(),
        specialization: specialization.trim(),
        experience: parseInt(experience, 10) || null,
        linkedin_url: linkedinUrl?.trim() || null,
        source: source || null,
        message: message?.trim() || null,
        cv_file_path: cvFileUrl,
        status: "pending",
      })

    if (insertError) {
      console.error("Error inserting candidate registration:", insertError)
      return { success: false, error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }
    }

    revalidatePath("/dashboard/registrations")
    
    return { success: true }
  } catch (error) {
    console.error("Error in submitCandidateRegistration:", error)
    return { success: false, error: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie." }
  }
}

