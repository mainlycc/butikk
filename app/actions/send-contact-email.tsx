"use server"

import { Resend } from "resend"

interface Candidate {
  id: string
  first_name: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  technologies: string | null
  cv: string | null
  guardian: string | null
  guardian_email?: string | null
  previous_contact: string | null
  project_description: string | null
}

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

    const groupedByCaretaker = candidates.reduce(
      (acc, candidate) => {
        const email = candidate.guardian_email || ""
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
      sentTo: Object.keys(groupedByCaretaker),
      demoMode: true,
    }
  }

  if (candidates.length === 0) {
    throw new Error("Nie wybrano żadnych kandydatów")
  }

  const groupedByCaretaker = candidates.reduce(
    (acc, candidate) => {
      const email = candidate.guardian_email || ""
      if (!email) return acc
      if (!acc[email]) {
        acc[email] = []
      }
      acc[email].push(candidate)
      return acc
    },
    {} as Record<string, Candidate[]>,
  )

  if (Object.keys(groupedByCaretaker).length === 0) {
    throw new Error("Żaden z wybranych kandydatów nie ma przypisanego adresu email opiekuna")
  }

  const results = await Promise.all(
    Object.entries(groupedByCaretaker).map(async ([caretakerEmail, candidateList]) => {
      const candidatesInfo = candidateList
        .map(
          (c) =>
            `Imię: ${c.first_name}\nRola: ${c.role}\nSeniority: ${c.seniority}\nStawka: ${c.rate}\nTechnologie: ${c.technologies}\n`,
        )
        .join("\n")

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Prośba o kontakt z kandydatami</h2>
          <p><strong>Od rekrutera:</strong> ${recruiterEmail}</p>
          <p><strong>Opis projektu:</strong></p>
          <p style="background: #f3f4f6; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${projectDescription}</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <h3 style="color: #1f2937;">Wybrani kandydaci:</h3>
          <pre style="background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">${candidatesInfo}</pre>
        </div>
      `

      try {
        await resend!.emails.send({
          from: "Butik Kandydatów <noreply@mail.mainly.pl>",
          to: caretakerEmail,
          subject: `Prośba o kontakt - ${candidateList.length} kandydatów`,
          html,
        })
        return { success: true, email: caretakerEmail }
      } catch (error) {
        console.error(`[v0] Error sending email to ${caretakerEmail}:`, error)
        return { success: false, email: caretakerEmail, error }
      }
    }),
  )

  const failed = results.filter((r) => !r.success)
  if (failed.length > 0) {
    throw new Error(`Nie udało się wysłać e-maili do: ${failed.map((f) => f.email).join(", ")}`)
  }

  return { success: true, sentTo: Object.keys(groupedByCaretaker) }
}
