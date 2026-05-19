"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PublicCandidatesTable from "@/components/public-candidates-table"
import type { PublicCandidate } from "@/lib/types/candidate"

export interface HomepageCandidatesPreviewProps {
  candidates: PublicCandidate[]
}

const INITIAL_VISIBLE = 10
const EXPAND_STEP = 10

function TableFooterSection({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 text-center border-t pt-4">{children}</div>
}

export default function HomepageCandidatesPreview({
  candidates,
}: HomepageCandidatesPreviewProps) {
  const [visibleCandidatesCount, setVisibleCandidatesCount] = useState(INITIAL_VISIBLE)

  const visibleCandidates = useMemo(
    () => candidates.slice(0, visibleCandidatesCount),
    [candidates, visibleCandidatesCount]
  )

  const blurredIds = useMemo(() => {
    const ids = new Set<string>()
    const totalVisible = visibleCandidates.length
    for (let i = 0; i < visibleCandidates.length; i++) {
      const candidate = visibleCandidates[i]
      if (totalVisible > 2 && i >= totalVisible - 2) {
        ids.add(candidate.id)
      }
    }
    return ids
  }, [visibleCandidates])

  const handleExpand = useCallback(() => {
    setVisibleCandidatesCount((prev) => Math.min(prev + EXPAND_STEP, candidates.length))
  }, [candidates.length])

  const hasMoreCandidates = visibleCandidatesCount < candidates.length
  const allCandidatesVisible = visibleCandidatesCount >= candidates.length

  if (candidates.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="py-16 text-center text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" aria-hidden />
          <p className="text-lg">Nie znaleziono kandydatów</p>
          <p className="text-sm">Spróbuj zmienić kryteria wyszukiwania</p>
        </CardContent>
      </Card>
    )
  }

  const footer = hasMoreCandidates ? (
    <TableFooterSection>
      <p className="text-sm text-muted-foreground mb-3">Zobacz więcej kandydatów</p>
      <Button onClick={handleExpand} size="default" className="h-10 px-6 text-sm font-semibold">
        Rozwiń
      </Button>
    </TableFooterSection>
  ) : allCandidatesVisible ? (
    <TableFooterSection>
      <p className="text-sm text-muted-foreground mb-3">
        Chcesz zobaczyć więcej? Dołącz jako rekruter
      </p>
      <Button asChild size="default" className="h-10 px-6 text-sm font-semibold">
        <Link href="/rekruter">Korzystaj jako rekruter</Link>
      </Button>
    </TableFooterSection>
  ) : null

  return (
    <PublicCandidatesTable
      candidates={visibleCandidates}
      blurredIds={blurredIds}
      footer={footer}
    />
  )
}
