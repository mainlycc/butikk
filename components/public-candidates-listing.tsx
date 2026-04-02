import { Users } from "lucide-react"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import type { PublicCandidate } from "@/lib/types/candidate"
import { cn } from "@/lib/utils"

export interface PublicCandidatesListingProps {
  candidates: PublicCandidate[]
  page: number
  totalPages: number
  basePath: string
}

function profileHref(slug: string) {
  return `/kandydat/${slug}`
}

function profileAnchorText(c: PublicCandidate) {
  const parts = [c.role, c.seniority, c.location].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : "Profil kandydata"
}

function buildPaginationPages(totalPages: number, currentPage: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages]
  }
  if (currentPage >= totalPages - 2) {
    return [1, "ellipsis", ...Array.from({ length: 4 }, (_, i) => totalPages - 3 + i)]
  }
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages]
}

function pageHref(basePath: string, pageNum: number) {
  return pageNum === 1 ? basePath : `${basePath}?page=${pageNum}`
}

export default function PublicCandidatesListing({
  candidates,
  page: currentPage,
  totalPages,
  basePath,
}: PublicCandidatesListingProps) {
  if (candidates.length === 0) {
    return (
      <Card className="border-2">
        <CardContent className="py-16 text-center text-muted-foreground">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-20" aria-hidden />
          <p className="text-lg">Nie znaleziono kandydatów</p>
          <p className="text-sm">Spróbuj innej ścieżki lub filtra</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 sm:hidden">
        <CardContent className="p-4 space-y-3">
          <ul className="space-y-3 list-none p-0 m-0">
            {candidates.map((c) => (
              <li key={c.id}>
                <article className="border rounded-lg p-3 space-y-2 bg-card">
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={profileHref(c.slug)}
                      className="inline-flex no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                      title={profileAnchorText(c)}
                    >
                      <Badge variant="secondary">{c.role || "Profil kandydata"}</Badge>
                    </a>
                    <Badge>{c.seniority || "—"}</Badge>
                  </div>
                  <p className="text-sm max-w-full truncate" title={c.technologies ?? undefined}>
                    {c.technologies || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.location || "—"}</p>
                  <p className="text-sm">{c.availability || "—"}</p>
                </article>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-2 hidden sm:block">
        <CardContent className="p-0">
          <div className="p-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rola</TableHead>
                  <TableHead>Seniority</TableHead>
                  <TableHead>Technologie</TableHead>
                  <TableHead>Lokalizacja</TableHead>
                  <TableHead>Dostępność</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <a
                        href={profileHref(c.slug)}
                        className="inline-flex no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                        title={profileAnchorText(c)}
                      >
                        <Badge variant="secondary">{c.role || "Profil kandydata"}</Badge>
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge>{c.seniority || "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate" title={c.technologies ?? undefined}>
                        {c.technologies || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.location || "—"}</TableCell>
                    <TableCell className="text-sm">{c.availability || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Card className="border-2">
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={currentPage > 2 ? pageHref(basePath, currentPage - 1) : basePath}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {buildPaginationPages(totalPages, currentPage).map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href={pageHref(basePath, item)}
                        isActive={item === currentPage}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    href={pageHref(basePath, currentPage + 1)}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
