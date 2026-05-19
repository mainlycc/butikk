"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PublicCandidate } from "@/lib/types/candidate"
import { cn } from "@/lib/utils"

export interface PublicCandidatesTableProps {
  candidates: PublicCandidate[]
  blurredIds?: Set<string>
  onRowClick?: (slug: string) => void
  footer?: React.ReactNode
}

export function profileHref(slug: string) {
  return `/kandydat/${slug}`
}

export function profileAnchorText(c: PublicCandidate) {
  const parts = [c.first_name, c.role, c.seniority, c.location].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "Profil kandydata"
}

export function displayFirstName(c: PublicCandidate) {
  const n = c.first_name?.trim()
  return n || "—"
}

function MobileCardContent({ c, isBlurred }: { c: PublicCandidate; isBlurred: boolean }) {
  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2", isBlurred && "blur-sm")}>
        <span className="font-medium text-foreground">{displayFirstName(c)}</span>
        <Badge variant="secondary">{c.role || "Profil kandydata"}</Badge>
        <Badge>{c.seniority || "—"}</Badge>
      </div>
      <p
        className={cn("text-sm max-w-full truncate", isBlurred && "blur-sm")}
        title={c.technologies ?? undefined}
      >
        {c.technologies || "—"}
      </p>
      <p className={cn("text-sm text-muted-foreground", isBlurred && "blur-sm")}>
        {c.location || "—"}
      </p>
      <p className={cn("text-sm", isBlurred && "blur-sm")}>{c.availability || "—"}</p>
    </>
  )
}

export default function PublicCandidatesTable({
  candidates,
  blurredIds,
  onRowClick,
  footer,
}: PublicCandidatesTableProps) {
  const router = useRouter()

  const handleRowClick = (slug: string, isBlurred: boolean) => {
    if (isBlurred) return
    if (onRowClick) {
      onRowClick(slug)
    } else {
      router.push(profileHref(slug))
    }
  }

  return (
    <>
      <Card className="border-2 sm:hidden">
        <CardContent className="p-4 space-y-3">
          <ul className="space-y-3 list-none p-0 m-0">
            {candidates.map((c) => {
              const isBlurred = blurredIds?.has(c.id) ?? false
              const href = profileHref(c.slug)
              const label = profileAnchorText(c)
              const cardClassName =
                "block rounded-lg border bg-card p-3 space-y-2 text-inherit outline-offset-2 transition-colors"

              if (isBlurred) {
                return (
                  <li key={c.id}>
                    <div
                      aria-hidden
                      className={cn(cardClassName, "pointer-events-none select-none")}
                    >
                      <MobileCardContent c={c} isBlurred />
                    </div>
                  </li>
                )
              }

              return (
                <li key={c.id}>
                  <Link
                    href={href}
                    title={label}
                    className={cn(
                      cardClassName,
                      "no-underline hover:bg-accent/40 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <MobileCardContent c={c} isBlurred={false} />
                  </Link>
                </li>
              )
            })}
          </ul>
          {footer}
        </CardContent>
      </Card>

      <Card className="border-2 hidden sm:block">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imię</TableHead>
                  <TableHead>Rola</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Technologie</TableHead>
                  <TableHead>Lokalizacja</TableHead>
                  <TableHead>Dostępność</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => {
                  const isBlurred = blurredIds?.has(c.id) ?? false
                  const label = profileAnchorText(c)

                  return (
                    <TableRow
                      key={c.id}
                      tabIndex={isBlurred ? -1 : 0}
                      aria-label={isBlurred ? undefined : `Profil: ${label}`}
                      className={cn(
                        isBlurred
                          ? "pointer-events-none select-none"
                          : "cursor-pointer hover:bg-muted/70"
                      )}
                      onClick={() => handleRowClick(c.slug, isBlurred)}
                      onKeyDown={(e) => {
                        if (isBlurred) return
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          handleRowClick(c.slug, false)
                        }
                      }}
                    >
                      <TableCell className={cn("font-medium", isBlurred && "blur-sm")}>
                        {displayFirstName(c)}
                      </TableCell>
                      <TableCell className={isBlurred ? "blur-sm" : undefined}>
                        <Badge variant="secondary">{c.role || "Profil kandydata"}</Badge>
                      </TableCell>
                      <TableCell className={isBlurred ? "blur-sm" : undefined}>
                        <Badge>{c.seniority || "—"}</Badge>
                      </TableCell>
                      <TableCell className={isBlurred ? "blur-sm" : undefined}>
                        <div className="text-sm max-w-xs truncate" title={c.technologies ?? undefined}>
                          {c.technologies || "—"}
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn("text-sm text-muted-foreground", isBlurred && "blur-sm")}
                      >
                        {c.location || "—"}
                      </TableCell>
                      <TableCell className={cn("text-sm", isBlurred && "blur-sm")}>
                        {c.availability || "—"}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            </div>
            {footer}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
