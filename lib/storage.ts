import { createAdminClient } from "@/lib/supabase/admin"

const BUCKET_NAME = "cv-pdfs"

/**
 * Konwertuje link Google Drive na link do bezpośredniego pobrania
 */
function convertGoogleDriveLink(url: string): string {
  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
  }
  
  // Format: https://drive.google.com/open?id=FILE_ID
  const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (openIdMatch && openIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${openIdMatch[1]}`
  }
  
  return url
}

/**
 * Konwertuje link Dropbox na link do bezpośredniego pobrania
 */
function convertDropboxLink(url: string): string {
  // Format: https://www.dropbox.com/s/.../file.pdf?dl=0
  // Zmieniamy ?dl=0 na ?dl=1 aby wymusić pobranie
  return url.replace(/\?dl=0$/, "?dl=1")
}

/**
 * Konwertuje różne typy linków na bezpośrednie linki do pobrania PDF
 */
export function convertToDirectDownloadLink(url: string): string {
  if (!url || typeof url !== "string") {
    return url
  }

  const trimmedUrl = url.trim()
  
  // Jeśli już jest bezpośrednim linkiem do PDF, zwróć bez zmian
  if (trimmedUrl.toLowerCase().endsWith(".pdf")) {
    return trimmedUrl
  }

  // Google Drive
  if (trimmedUrl.includes("drive.google.com")) {
    return convertGoogleDriveLink(trimmedUrl)
  }

  // Dropbox
  if (trimmedUrl.includes("dropbox.com")) {
    return convertDropboxLink(trimmedUrl)
  }

  // OneDrive - format: https://onedrive.live.com/embed?cid=...&resid=...&authkey=...
  // Dla OneDrive trudno jest automatycznie konwertować, więc zwracamy oryginalny link
  // Użytkownik może użyć opcji "Pobierz" w OneDrive

  // Dla innych linków zwracamy bez zmian
  return trimmedUrl
}

/**
 * Pobiera PDF z URL i zwraca jako ArrayBuffer
 */
async function downloadPDF(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    })

    if (!response.ok) {
      console.error(`Failed to download PDF from ${url}: ${response.status} ${response.statusText}`)
      return null
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("pdf")) {
      console.warn(`Warning: Content type is not PDF for ${url}: ${contentType}`)
      // Kontynuujemy mimo to, bo niektóre serwery mogą zwracać nieprawidłowy content-type
    }

    const data = await response.arrayBuffer()
    const buf = Buffer.from(data)
    const magic5 = buf.subarray(0, 5).toString("utf8")
    if (magic5 === "%PDF-") {
      return data
    }

    // Google Drive: czasem zamiast pliku zwraca HTML (ekran logowania / potwierdzenia / limit).
    // Spróbuj wyłuskać „prawdziwy” link do pobrania z HTML i pobrać ponownie.
    const isHtml = buf.subarray(0, 15).toString("utf8").toLowerCase().includes("<!doctype html")
    if (isHtml && url.includes("drive.google.com")) {
      const html = buf.toString("utf8")

      // 1) Najczęstszy przypadek: w HTML jest link do /uc?export=download...&confirm=...
      const ucHrefMatch = html.match(/href=\"(\/uc\?export=download[^\"]+)\"/i)
      if (ucHrefMatch?.[1]) {
        const nextUrl = `https://drive.google.com${ucHrefMatch[1].replace(/&amp;/g, "&")}`
        return await downloadPDF(nextUrl)
      }

      // 2) Alternatywnie: link do drive.usercontent.google.com/download?... (bezpośredni download endpoint)
      const userContentMatch = html.match(/https:\/\/drive\.usercontent\.google\.com\/download\?[^\"]+/i)
      if (userContentMatch?.[0]) {
        const nextUrl = userContentMatch[0].replace(/&amp;/g, "&")
        return await downloadPDF(nextUrl)
      }
    }

    console.warn(
      `Downloaded file is not a valid PDF (magic=${JSON.stringify(magic5)}) for ${url}`
    )
    return null
  } catch (error) {
    console.error(`Error downloading PDF from ${url}:`, error)
    return null
  }
}

/**
 * Uploaduje PDF do Supabase Storage
 * @param pdfData - ArrayBuffer z danymi PDF
 * @param fileName - Nazwa pliku (np. "123_Jan_Kowalski.pdf")
 * @returns Publiczny URL do pliku lub null w przypadku błędu
 */
export async function uploadPDFToStorage(
  pdfData: ArrayBuffer,
  fileName: string
): Promise<string | null> {
  try {
    const supabase = createAdminClient()

    // Sprawdź czy bucket istnieje, jeśli nie - utwórz go
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error("Error listing buckets:", listError)
      return null
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)
    
    if (!bucketExists) {
      // Utwórz bucket z publicznym dostępem do odczytu
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ["application/pdf"],
      })

      if (createError) {
        console.error("Error creating bucket:", createError)
        // Możliwe że bucket już istnieje, kontynuujemy
      }
    }

    // Upload pliku
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, pdfData, {
        contentType: "application/pdf",
        upsert: true, // Nadpisz jeśli plik już istnieje
      })

    if (error) {
      console.error("Error uploading PDF to storage:", error)
      return null
    }

    // Pobierz publiczny URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error("Error in uploadPDFToStorage:", error)
    return null
  }
}

/**
 * Pobiera PDF z linku i uploaduje do Supabase Storage
 * @param url - URL do PDF (może być Google Drive, Dropbox, bezpośredni link, itp.)
 * @param fileName - Nazwa pliku do zapisania w Storage
 * @returns Publiczny URL do pliku w Storage lub null w przypadku błędu
 */
export async function downloadAndUploadPDF(
  url: string,
  fileName: string
): Promise<string | null> {
  if (!url || !fileName) {
    return null
  }

  try {
    // Konwertuj link na bezpośredni link do pobrania
    const directLink = convertToDirectDownloadLink(url)

    // Pobierz PDF
    const pdfData = await downloadPDF(directLink)
    if (!pdfData) {
      console.error(`Failed to download PDF from ${url}`)
      return null
    }

    // Upload do Storage
    const publicUrl = await uploadPDFToStorage(pdfData, fileName)
    return publicUrl
  } catch (error) {
    console.error(`Error in downloadAndUploadPDF for ${url}:`, error)
    return null
  }
}

/**
 * Generuje nazwę pliku PDF na podstawie danych kandydata
 */
export function generatePDFFileName(
  sheetRowNumber: number,
  firstName: string | null,
  lastName: string | null
): string {
  const safeFirstName = (firstName || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .substring(0, 20)
  const safeLastName = (lastName || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .substring(0, 20)
  
  const lastNamePart = safeLastName ? `_${safeLastName}` : ""
  return `${sheetRowNumber}_${safeFirstName}${lastNamePart}.pdf`
}

