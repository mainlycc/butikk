"use client"

import { Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PublicCandidatesTable from "@/components/public-candidates-table"
import type { PublicCandidate } from "@/lib/types/candidate"
import { cn } from "@/lib/utils"

export interface PublicCandidatesListingProps {
  candidates: PublicCandidate[]
  page: number
  totalPages: number
  basePath: string
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
      <PublicCandidatesTable candidates={candidates} />

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
