/**
 * Etykiety technologii będące samą liczbą lub fragmentem wersji (np. 17, 3.x, 1.0).
 * Zostawia np. 802.11 — spójnie z normalize_tech_token w SQL (020).
 */
export function isNumericTechnologyJunkLabel(s: string): boolean {
  const t = s.trim()
  if (!t) return true
  if (/^\d+$/.test(t)) return true
  if (/^\d+\.x$/i.test(t)) return true
  if (/^\d+\.\d+$/.test(t) && !/^\d{3,}\.\d{2,}$/.test(t)) return true
  if (/^[.\-+_]+$/.test(t)) return true
  return false
}
