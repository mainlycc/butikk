"use server"

import { BRAND_NAME, DEFAULT_APP_URL } from "@/lib/branding"
import { FROM_EMAIL } from "@/lib/email/client"
import { Resend } from "resend"
import type { PrivateCandidate } from "@/lib/types/candidate"

type Candidate = PrivateCandidate

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendContactEmail(candidates: Candidate[], projectDescription: string, recruiterEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[v0] DEMO MODE - Email would be sent:")
    console.log(
      "[v0] Candidates:",
      candidates.map((c) => c.first_name),
    )
    console.log("[v0] Project:", projectDescription)
    console.log("[v0] Recruiter:", recruiterEmail)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const groupedByCandidate = candidates.reduce(
      (acc, candidate) => {
        const email = candidate.candidate_email || ""
        if (!email) return acc
        if (!acc[email]) {
          acc[email] = []
        }
        acc[email].push(candidate)
        return acc
      },
      {} as Record<string, Candidate[]>,
    )

    return {
      success: true,
      sentTo: Object.keys(groupedByCandidate),
      demoMode: true,
    }
  }

  if (candidates.length === 0) {
    throw new Error("Nie wybrano żadnych kandydatów")
  }

  const groupedByCandidate = candidates.reduce(
    (acc, candidate) => {
      const email = candidate.candidate_email || ""
      if (!email) return acc
      if (!acc[email]) {
        acc[email] = []
      }
      acc[email].push(candidate)
      return acc
    },
    {} as Record<string, Candidate[]>,
  )

  if (Object.keys(groupedByCandidate).length === 0) {
    throw new Error("Żaden z wybranych kandydatów nie ma przypisanego adresu email kandydata")
  }

  const results = await Promise.all(
    Object.entries(groupedByCandidate).map(async ([candidateEmail, candidateList]) => {
      const candidatesInfo = candidateList
        .map(
          (c) =>
            `Imię: ${c.first_name}\nRola: ${c.role}\nSeniority: ${c.seniority}\nStawka: ${c.rate}\nTechnologie: ${c.technologies}\n`,
        )
        .join("\n")

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${BRAND_NAME} — zapytanie od rekrutera</h2>
          <p>Cześć,</p>
          <p>kontaktuje się z Tobą rekruter <strong>${recruiterEmail}</strong> z propozycją współpracy.</p>
          <p><strong>Opis projektu:</strong></p>
          <p style="background: #f3f4f6; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${projectDescription}</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <h3 style="color: #1f2937;">Twoje dane w kontekście propozycji:</h3>
          <pre style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">${candidatesInfo}</pre>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
            <a href="${DEFAULT_APP_URL}" style="color: #2563eb; text-decoration: none;">${DEFAULT_APP_URL}</a>
          </p>
        </div>
      `

      try {
        await resend!.emails.send({
          from: FROM_EMAIL,
          to: candidateEmail,
          subject: `Nowe zapytanie od rekrutera — ${BRAND_NAME}`,
          html,
        })
        return { success: true, email: candidateEmail }
      } catch (error) {
        console.error(`[v0] Error sending email to ${candidateEmail}:`, error)
        return { success: false, email: candidateEmail, error }
      }
    }),
  )

  const failed = results.filter((r) => !r.success)
  if (failed.length > 0) {
    throw new Error(`Nie udało się wysłać e-maili do: ${failed.map((f) => f.email).join(", ")}`)
  }

  return { success: true, sentTo: Object.keys(groupedByCandidate) }
}
