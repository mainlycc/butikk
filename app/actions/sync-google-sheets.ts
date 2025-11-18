"use server"

import { getSupabaseServerClient } from "@/lib/server"

// ID arkusza Google Sheets
const CANDIDATES_SHEET_ID = process.env.NEXT_PUBLIC_CANDIDATES_SHEET_ID || "1XCpfMqh2-iZJnXHx42zsc8utynW8WNe89Fy2jslUnKY"

/**
 * Parsuje linię CSV obsługującą cudzysłowy i przecinki w komórkach
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Podwójny cudzysłów - escape
        current += '"'
        i++ // Pomiń następny cudzysłów
      } else {
        // Początek/koniec cudzysłowów
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      // Separator poza cudzysłowami
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  // Dodaj ostatnią komórkę
  result.push(current.trim())
  return result
}

/**
 * Pobiera dane z Google Sheets jako CSV i parsuje je
 */
async function fetchGoogleSheet(sheetId: string): Promise<string[][] | null> {
  if (!sheetId) return null

  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`, {
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Google Sheets API error: ${response.status} ${response.statusText}`)
      return null
    }

    const csv = await response.text()
    
    if (!csv || csv.trim().length === 0) {
      console.error("Empty CSV response from Google Sheets")
      return null
    }

    // Podziel na linie i parsuj każdą linię
    // Używamy \r\n lub \n jako separatora
    const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0)
    const rows = lines.map((line) => parseCSVLine(line))

    // Debug: loguj pierwszą linię i pierwsze kilka wierszy
    if (rows.length > 0) {
      console.log("Pierwszy wiersz (nagłówek):", rows[0])
      if (rows.length > 1) {
        console.log("Drugi wiersz (przykład danych):", rows[1])
      }
    }

    // Filtruj puste wiersze
    return rows.filter((row) => row.some((cell) => cell && cell.trim().length > 0))
  } catch (error) {
    console.error("Error fetching Google Sheet:", error)
    return null
  }
}

/**
 * Znajduje indeks kolumny w nagłówku po dokładnej nazwie (case-insensitive)
 */
function findColumnIndex(header: string[], columnName: string): number {
  const normalizedName = columnName.toLowerCase().trim()
  for (let i = 0; i < header.length; i++) {
    if ((header[i] || "").toLowerCase().trim() === normalizedName) {
      return i
    }
  }
  return -1
}

/**
 * Synchronizuje dane z Google Sheets do Supabase
 * @param skipAuthCheck - Jeśli true, pomija sprawdzanie autoryzacji (dla cron jobs)
 */
export async function syncGoogleSheetsToSupabase(skipAuthCheck: boolean = false) {
  const supabase = await getSupabaseServerClient()

  if (!skipAuthCheck) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Nie jesteś zalogowany" }
    }

    const { data: currentUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "Brak uprawnień administratora" }
    }
  }

  try {
    const candidatesData = await fetchGoogleSheet(CANDIDATES_SHEET_ID)
    
    if (!candidatesData) {
      return { success: false, error: "Nie udało się pobrać danych z Google Sheets" }
    }

    if (candidatesData.length === 0) {
      return { success: false, error: "Arkusz Google Sheets jest pusty" }
    }

    // Pobierz nagłówek (pierwszy wiersz) i znajdź indeksy kolumn
    const header = candidatesData[0]
    const candidates = candidatesData.slice(1) // Skip header

    if (candidates.length === 0) {
      return { success: false, error: "Brak danych kandydatów w arkuszu" }
    }

    // Loguj pełny nagłówek dla debugowania
    console.log("Nagłówek z Google Sheets:", header)
    console.log("Liczba kolumn w nagłówku:", header.length)

    // Znajdź indeksy kolumn po dokładnych nazwach
    const nrIndex = findColumnIndex(header, "Nr")
    const imieIndex = findColumnIndex(header, "Imię i Nazwisko")
    const rolaIndex = findColumnIndex(header, "Rola")
    const seniorityIndex = findColumnIndex(header, "Seniority")
    const stawkaIndex = findColumnIndex(header, "Stawka") // Mapujemy na rate
    const technologieIndex = findColumnIndex(header, "Technologie") // Mapujemy na skills
    const cvIndex = findColumnIndex(header, "CV")
    const opiekunIndex = findColumnIndex(header, "Opiekun kandydata")
    const dostepnoscIndex = findColumnIndex(header, "Dostępność") // Mapujemy na availability
    // Opcjonalne kolumny - mogą nie być w Google Sheets
    const guardianEmailIndex = findColumnIndex(header, "Email opiekuna")
    const languagesIndex = findColumnIndex(header, "Języki")

    // Walidacja kluczowych kolumn
    if (imieIndex < 0) {
      return { 
        success: false, 
        error: `Nie znaleziono kolumny 'Imię i Nazwisko' w nagłówku. Dostępne kolumny: ${header.join(", ")}` 
      }
    }

    // Loguj mapowanie kolumn dla debugowania
    console.log("Mapowanie kolumn:", {
      "Nr": { index: nrIndex, found: nrIndex >= 0, headerValue: header[nrIndex] },
      "Imię i Nazwisko": { index: imieIndex, found: imieIndex >= 0, headerValue: header[imieIndex] },
      "Rola": { index: rolaIndex, found: rolaIndex >= 0, headerValue: header[rolaIndex] },
      "Seniority": { index: seniorityIndex, found: seniorityIndex >= 0, headerValue: header[seniorityIndex] },
      "Stawka": { index: stawkaIndex, found: stawkaIndex >= 0, headerValue: header[stawkaIndex] },
      "Technologie": { index: technologieIndex, found: technologieIndex >= 0, headerValue: header[technologieIndex] },
      "CV": { index: cvIndex, found: cvIndex >= 0, headerValue: header[cvIndex] },
      "Opiekun kandydata": { index: opiekunIndex, found: opiekunIndex >= 0, headerValue: header[opiekunIndex] },
      "Dostępność": { index: dostepnoscIndex, found: dostepnoscIndex >= 0, headerValue: header[dostepnoscIndex] },
      "Email opiekuna": { index: guardianEmailIndex, found: guardianEmailIndex >= 0, headerValue: header[guardianEmailIndex] },
      "Języki": { index: languagesIndex, found: languagesIndex >= 0, headerValue: header[languagesIndex] },
    })

    // Loguj przykładowy wiersz dla debugowania
    if (candidates.length > 0) {
      console.log("Przykładowy wiersz danych:", candidates[0])
      console.log("Długość wiersza:", candidates[0].length)
    }

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < candidates.length; i++) {
      const row = candidates[i]
      
      // Pomiń puste wiersze
      if (!row || row.length === 0) {
        continue
      }

      // Pomiń wiersze gdzie kolumna z imieniem jest pusta
      const imieValue = row[imieIndex]?.trim() || ""
      if (!imieValue) {
        continue
      }

      // Bezpieczne pobieranie wartości z obsługą undefined/null
      const getValue = (index: number): string => {
        if (index < 0 || index >= row.length) return ""
        const value = row[index]
        // Jeśli wartość to undefined, null, lub pusty string po trim, zwróć pusty string
        if (value === null || value === undefined) return ""
        const trimmed = String(value).trim()
        return trimmed
      }

      // Numer wiersza w arkuszu (zaczynamy od 2, bo 1 to nagłówek)
      const sheetRowNumber = nrIndex >= 0 && getValue(nrIndex) 
        ? parseInt(getValue(nrIndex), 10) 
        : i + 2

      // Rozdziel "Imię i Nazwisko" na first_name i last_name
      const fullName = getValue(imieIndex)
      const nameParts = fullName.split(/\s+/)
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || null

      const candidate = {
        sheet_row_number: isNaN(sheetRowNumber) ? i + 2 : sheetRowNumber,
        nr: nrIndex >= 0 ? getValue(nrIndex) || null : null,
        first_name: firstName || null,
        last_name: lastName,
        role: rolaIndex >= 0 ? getValue(rolaIndex) || null : null,
        seniority: seniorityIndex >= 0 ? getValue(seniorityIndex) || null : null,
        rate: stawkaIndex >= 0 ? getValue(stawkaIndex) || null : null,
        guardian: opiekunIndex >= 0 ? getValue(opiekunIndex) || null : null,
        guardian_email: guardianEmailIndex >= 0 ? getValue(guardianEmailIndex) || null : null,
        cv: cvIndex >= 0 ? getValue(cvIndex) || null : null,
        skills: technologieIndex >= 0 ? getValue(technologieIndex) || null : null,
        languages: languagesIndex >= 0 ? getValue(languagesIndex) || null : null,
        availability: dostepnoscIndex >= 0 ? getValue(dostepnoscIndex) || null : null,
        last_synced_at: new Date().toISOString(),
      }

      // Loguj pierwsze 3 kandydatów dla debugowania
      if (i < 3) {
        console.log(`Kandydat ${i + 1} (${candidate.first_name}):`, {
          fullName: fullName,
          firstName: candidate.first_name,
          lastName: candidate.last_name,
          rate: candidate.rate,
          skills: candidate.skills,
          availability: candidate.availability,
          rawRowValues: {
            imie: row[imieIndex],
            stawka: row[stawkaIndex],
            technologie: row[technologieIndex],
            dostepnosc: row[dostepnoscIndex],
          }
        })
      }

      const { error } = await supabase.from("candidates").upsert(candidate, { 
        onConflict: "sheet_row_number" 
      })
      
      if (error) {
        console.error(`Error upserting candidate row ${candidate.sheet_row_number}:`, error)
        errorCount++
      } else {
        successCount++
      }
    }

    if (errorCount > 0) {
      return {
        success: true,
        message: `Zsynchronizowano ${successCount} kandydatów, ${errorCount} błędów`,
        warning: true,
      }
    }

    return {
      success: true,
      message: `Zsynchronizowano ${successCount} kandydatów`,
    }
  } catch (error) {
    console.error("Sync error:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Błąd podczas synchronizacji" 
    }
  }
}

/**
 * Automatyczna synchronizacja (pomija sprawdzanie autoryzacji)
 */
export async function autoSyncGoogleSheets() {
  return await syncGoogleSheetsToSupabase(true)
}

/**
 * Sprawdza czy potrzebna jest synchronizacja na podstawie czasu ostatniej synchronizacji
 * @param syncIntervalMinutes - Interwał synchronizacji w minutach (domyślnie 5 minut)
 * @returns true jeśli potrzebna jest synchronizacja
 */
export async function shouldSync(syncIntervalMinutes: number = 5): Promise<boolean> {
  const supabase = await getSupabaseServerClient()
  
  try {
    // Pobierz najnowszy czas synchronizacji z bazy
    const { data, error } = await supabase
      .from("candidates")
      .select("last_synced_at")
      .order("last_synced_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !data || !data.last_synced_at) {
      // Jeśli nie ma danych, potrzebna jest synchronizacja
      return true
    }

    const lastSyncTime = new Date(data.last_synced_at)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60)

    return diffMinutes >= syncIntervalMinutes
  } catch (error) {
    console.error("Error checking sync status:", error)
    // W przypadku błędu, lepiej zsynchronizować
    return true
  }
}
