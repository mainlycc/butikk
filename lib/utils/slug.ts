const POLISH_CHARS: Record<string, string> = {
  ą: "a", ć: "c", ę: "e", ł: "l", ń: "n",
  ó: "o", ś: "s", ź: "z", ż: "z",
  Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n",
  Ó: "o", Ś: "s", Ź: "z", Ż: "z",
}

function transliterate(text: string): string {
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (ch) => POLISH_CHARS[ch] || ch)
}

/**
 * Generuje slug na podstawie danych kandydata.
 * Format: {seniority}-{role}-{technologia-glowna}-{lokalizacja}
 * np. "senior-react-developer-warszawa"
 */
export function generateCandidateSlug(params: {
  seniority: string | null
  role: string | null
  technologies: string | null
  location: string | null
}): string {
  const parts: string[] = []

  if (params.seniority) {
    parts.push(params.seniority.trim())
  }

  if (params.role) {
    parts.push(params.role.trim())
  }

  if (params.technologies) {
    const mainTech = params.technologies.split(",")[0]?.trim()
    if (mainTech) {
      parts.push(mainTech)
    }
  }

  if (params.location) {
    parts.push(params.location.trim())
  }

  if (parts.length === 0) {
    return "kandydat"
  }

  const raw = parts.join("-")
  return slugify(raw)
}

/**
 * Normalizuje tekst do formatu slug (lowercase, bez polskich znaków, bez znaków specjalnych).
 */
export function slugify(text: string): string {
  return transliterate(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

/**
 * Deduplikuje slug dodając sufiks numeryczny (-2, -3, ...).
 * `existingSlugs` to Set slugów już obecnych w bazie.
 */
export function deduplicateSlug(slug: string, existingSlugs: Set<string>): string {
  if (!existingSlugs.has(slug)) return slug

  let counter = 2
  while (existingSlugs.has(`${slug}-${counter}`)) {
    counter++
  }
  return `${slug}-${counter}`
}
