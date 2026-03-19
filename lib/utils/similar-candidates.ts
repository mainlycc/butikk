export function normalizeTechnologies(input: string | null | undefined): string[] {
  if (!input) return []
  const items = input
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  // uniq preserving order
  const seen = new Set<string>()
  const out: string[] = []
  for (const t of items) {
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

export function techOverlapScore(a: string[] | null | undefined, b: string[] | null | undefined): number {
  if (!a?.length || !b?.length) return 0

  // iterate smaller set for speed
  const [small, big] = a.length <= b.length ? [a, b] : [b, a]
  const bigSet = new Set(big)
  let score = 0
  for (const t of small) {
    if (bigSet.has(t)) score++
  }
  return score
}

