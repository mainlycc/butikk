import { syncGoogleSheetsToSupabase } from "@/app/actions/sync-google-sheets"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

/**
 * API endpoint dla automatycznej synchronizacji (można wywołać przez cron jobs)
 * POST /api/sync - wyzwala synchronizację
 * GET /api/sync - sprawdza status endpointu
 */
export async function POST(request: NextRequest) {
  // Sprawdź token autoryzacyjny dla cron jobs (opcjonalnie)
  const authToken = request.headers.get("authorization")
  const expectedToken = process.env.SYNC_API_TOKEN

  // Jeśli jest ustawiony token, wymagaj go dla bezpieczeństwa
  if (expectedToken) {
    if (!authToken || authToken !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }
  }

  // Wykonaj synchronizację bez sprawdzania autoryzacji użytkownika
  const result = await syncGoogleSheetsToSupabase(true)

  if (result.success) {
    return NextResponse.json(result, { status: 200 })
  } else {
    return NextResponse.json(result, { status: 500 })
  }
}

/**
 * Endpoint GET do sprawdzenia statusu synchronizacji
 */
export async function GET() {
  return NextResponse.json({ 
    status: "ready",
    message: "Use POST with optional Authorization header to trigger sync",
    hasToken: !!process.env.SYNC_API_TOKEN
  })
}
