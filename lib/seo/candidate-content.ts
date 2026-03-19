import type { PublicCandidate } from "@/lib/types/candidate"

type CandidateForDescription = Pick<
  PublicCandidate,
  | "role"
  | "seniority"
  | "technologies"
  | "location"
  | "experience_years"
  | "summary"
  | "availability"
  | "languages"
  | "skills"
>

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

function toList(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((t) => clean(t))
    .filter(Boolean)
}

function isRemoteLocation(location: string | null | undefined): boolean {
  if (!location) return false
  const l = location.toLowerCase()
  return l.includes("zdal") || l.includes("remote")
}

function pluralYears(n: number): string {
  // PL: 1 rok, 2-4 lata (z wyjątkami 12-14), w pozostałych "lat"
  if (n === 1) return "rok"
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "lata"
  return "lat"
}

function normalizeYears(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    // akceptuj np. "5", "5 lat", "5lat"
    const match = value.match(/\d+/)
    if (!match) return null
    const n = Number.parseInt(match[0], 10)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function looksLikeYears(text: string): boolean {
  const t = clean(text).toLowerCase()
  // przykłady: "10 lat", "5lat", "3 lata", "1 rok", "12-14 lat"
  return /\d/.test(t) && (t.includes("lat") || t.includes("lata") || t.includes("rok") || t.includes("l.") || t.includes("years"))
}

function clamp(text: string, maxLen: number): string {
  const t = clean(text)
  if (t.length <= maxLen) return t
  // tnij na ostatniej spacji, żeby nie urywać słowa
  const cut = t.slice(0, maxLen - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

export function getCandidateAutoDescription(candidate: CandidateForDescription): string {
  const role = candidate.role?.trim()
  const rawSeniority = candidate.seniority?.trim() || null
  const seniority = rawSeniority && !looksLikeYears(rawSeniority) ? rawSeniority : null
  const years = normalizeYears(candidate.experience_years) ?? (rawSeniority ? normalizeYears(rawSeniority) : null)
  const location = candidate.location?.trim()
  const availability = candidate.availability?.trim()
  const languages = candidate.languages?.trim()
  const skills = candidate.skills?.trim()
  const techs = toList(candidate.technologies)

  const topTechs = techs.slice(0, 6)
  const techsText = topTechs.length > 0 ? topTechs.join(", ") : ""

  // Akapit 1: rola, seniority, doświadczenie + ogólne credo
  const part1Role = role ? `na stanowisko ${role}` : "na stanowisko w obszarze IT"
  const part1Seniority = seniority ? ` na poziomie ${seniority}` : ""
  const part1Years = years != null ? `, posiadający około ${years} ${pluralYears(years)} doświadczenia w branży` : ""
  const sentence1 = `Kandydat ${part1Role}${part1Seniority}${part1Years}.`
  const sentence1b = `W swojej pracy skupia się na dostarczaniu stabilnych i skalowalnych rozwiązań, dbając jednocześnie o jakość kodu oraz efektywność procesów wytwórczych.`

  // Akapit 2: technologie + skills (opcjonalnie)
  const sentence2 =
    techsText
      ? `Na co dzień pracuje z technologiami takimi jak ${techsText}, które wykorzystuje do budowy i utrzymania nowoczesnych systemów.`
      : null
  const sentence2b =
    skills && clean(skills).length > 0
      ? `Dodatkowo posiada doświadczenie w obszarach związanych z ${clean(skills)}, co pozwala mu lepiej rozumieć potrzeby użytkowników oraz projektować intuicyjne rozwiązania.`
      : null

  // Akapit 3: języki (opcjonalnie)
  const sentence3 =
    languages && clean(languages).length > 0
      ? `Komunikuje się w języku ${clean(languages)}, co umożliwia sprawną współpracę zarówno w zespołach lokalnych, jak i międzynarodowych.`
      : null

  // Akapit 4: model pracy i dostępność (opcjonalnie)
  const modeLabel = location
    ? (isRemoteLocation(location) ? "zdalnym" : `stacjonarnym (${location})`)
    : null
  const availabilityLabel = availability
    ? (availability.toLowerCase().includes("immediate") ? "od zaraz" : availability)
    : null

  let sentence4: string | null = null
  if (modeLabel && availabilityLabel) {
    sentence4 = `Preferuje pracę w modelu ${modeLabel} i jest dostępny ${availabilityLabel}, co daje dużą elastyczność przy planowaniu współpracy.`
  } else if (modeLabel) {
    sentence4 = `Preferuje pracę w modelu ${modeLabel}, co daje dużą elastyczność przy planowaniu współpracy.`
  } else if (availabilityLabel) {
    sentence4 = `Jest dostępny ${availabilityLabel}, co daje dużą elastyczność przy planowaniu współpracy.`
  }

  return clean(
    [sentence1, sentence1b, sentence2, sentence2b, sentence3, sentence4]
      .filter(Boolean)
      .join(" ")
  )
}

export function getCandidateMetaTitle(candidate: PublicCandidate): string {
  const parts = [candidate.seniority, candidate.role].filter(Boolean).map((s) => clean(String(s)))
  const years = candidate.experience_years
  const exp = years != null ? `${years} ${pluralYears(years)}` : null
  const mode = isRemoteLocation(candidate.location) ? "zdalnie" : candidate.location ? clean(candidate.location) : null

  // format: "Senior Backend Engineer, 8 lat — zdalnie | QualiBase"
  const left = [parts.join(" "), exp ? `${exp}` : null].filter(Boolean).join(", ") || "Kandydat IT"
  const mid = mode ? `— ${mode}` : ""
  return clean(`${left} ${mid} | QualiBase`)
}

export function getCandidateMetaDescription(candidate: PublicCandidate): string {
  // ~150-160 znaków, bez wrażliwych danych
  const base = getCandidateAutoDescription(candidate)
  return clamp(base, 160)
}

