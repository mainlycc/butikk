"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Search, Users, Filter, X, Lock, Eye } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
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
import Link from "next/link"

interface PublicDatabaseContentProps {
  candidates: PublicCandidate[]
}

export default function PublicDatabaseContent({ candidates: initialCandidates }: PublicDatabaseContentProps) {
  const router = useRouter()
  const [searchTerms, setSearchTerms] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])
  const itemsPerPage = 20

  const filteredCandidates = useMemo(() => {
    if (!searchTerms.trim()) return initialCandidates

    const terms = searchTerms
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)

    return initialCandidates.filter((candidate) => {
      const searchableText = [
        candidate.role,
        candidate.seniority,
        candidate.technologies,
        candidate.location,
        candidate.languages,
        candidate.skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }, [initialCandidates, searchTerms])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerms, sorting])

  const handleFilter = () => {
    toast.info(`Znaleziono ${filteredCandidates.length} kandydatów`)
  }

  const handleResetFilter = () => {
    setSearchTerms("")
    toast.info("Wyświetlane są wszyscy kandydaci")
  }

  const toggleCandidate = useCallback((slug: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(slug)) {
      newSelected.delete(slug)
    } else {
      newSelected.add(slug)
    }
    setSelectedCandidates(newSelected)
  }, [selectedCandidates])

  const toggleAll = useCallback(() => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.slug)))
    }
  }, [filteredCandidates, selectedCandidates.size])

  const handleViewProfiles = () => {
    const selectedSlugs = Array.from(selectedCandidates)
    if (selectedSlugs.length > 0) {
      const params = new URLSearchParams()
      params.set("selected", selectedSlugs.join(","))
      router.push(`/kandydat/${selectedSlugs[0]}?${params.toString()}`)
    }
  }

  const columns = useMemo<ColumnDef<PublicCandidate>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0}
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedCandidates.has(row.original.slug)}
            onCheckedChange={() => toggleCandidate(row.original.slug)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: "Rola",
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.role || "-"}</Badge>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "seniority",
        header: "Seniority",
        cell: ({ row }) => (
          <Badge>{row.original.seniority || "-"}</Badge>
        ),
        sortingFn: (rowA, rowB) => {
          const getSeniorityValue = (seniority: string | null): { isNumeric: boolean; value: number; original: string } => {
            if (!seniority) return { isNumeric: false, value: 0, original: "" }
            const normalized = seniority.trim()
            const numberMatch = normalized.match(/(\d+)/)
            if (numberMatch) {
              return { isNumeric: true, value: parseInt(numberMatch[1], 10), original: normalized }
            }
            const lowerNormalized = normalized.toLowerCase()
            let value = 1000
            if (lowerNormalized.includes("junior") || lowerNormalized.includes("trainee")) value = 1001
            else if (lowerNormalized.includes("mid") || lowerNormalized.includes("regular")) value = 1002
            else if (lowerNormalized.includes("senior")) value = 1003
            else if (lowerNormalized.includes("lead") || lowerNormalized.includes("principal")) value = 1004
            return { isNumeric: false, value, original: normalized }
          }
          const infoA = getSeniorityValue(rowA.original.seniority)
          const infoB = getSeniorityValue(rowB.original.seniority)
          if (infoA.isNumeric && !infoB.isNumeric) return -1
          if (!infoA.isNumeric && infoB.isNumeric) return 1
          if (infoA.isNumeric && infoB.isNumeric) return infoA.value - infoB.value
          if (infoA.value !== infoB.value) return infoA.value - infoB.value
          return infoA.original.localeCompare(infoB.original)
        },
      },
      {
        accessorKey: "technologies",
        header: "Technologie",
        cell: ({ row }) => {
          const technologies = row.original.technologies || "-"
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-sm max-w-xs truncate cursor-help">{technologies}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-md whitespace-pre-wrap">{technologies}</p>
              </TooltipContent>
            </Tooltip>
          )
        },
        enableSorting: false,
      },
      {
        accessorKey: "location",
        header: "Lokalizacja",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground">{row.original.location || "-"}</div>
        ),
      },
      {
        accessorKey: "availability",
        header: "Dostępność",
        cell: ({ row }) => <div className="text-sm">{row.original.availability || "-"}</div>,
      },
    ],
    [selectedCandidates, filteredCandidates.length, toggleCandidate, toggleAll]
  )

  const table = useReactTable({
    data: filteredCandidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualPagination: true,
  })

  const sortedCandidates = table.getRowModel().rows.map((row) => row.original)
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCandidates = sortedCandidates.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Wprowadź słowa kluczowe oddzielone przecinkami (np. React, Senior, Warszawa)"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                className="pl-10 h-12 text-base"
                onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              />
            </div>
            <Button onClick={handleFilter} size="lg" className="px-8">
              <Filter className="w-4 h-4 mr-2" />
              Filtruj
            </Button>
            {searchTerms && (
              <Button onClick={handleResetFilter} variant="outline" size="lg">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="border-2 border-primary/50 bg-primary/5 py-0">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            {selectedCandidates.size > 0 ? (
              <p className="text-base font-medium">Wybrano {selectedCandidates.size} kandydatów</p>
            ) : (
              <p className="text-base font-medium text-muted-foreground">Zaznacz kandydatów</p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleViewProfiles}
                variant="outline"
                size="lg"
                disabled={selectedCandidates.size === 0}
              >
                <Eye className="w-4 h-4 mr-2" />
                Przeglądaj profile
              </Button>
              <Button size="lg" asChild>
                <Link href="/app/login">
                  <Lock className="w-4 h-4 mr-2" />
                  Pełne dane — zaloguj się
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-2">
        <CardContent className="p-0">
          {filteredCandidates.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">Nie znaleziono kandydatów</p>
              <p className="text-sm">Spróbuj zmienić kryteria wyszukiwania</p>
            </div>
          ) : (
            <div className="p-4">
              <DataTable
                columns={columns}
                data={paginatedCandidates}
                sorting={sorting}
                onSortingChange={setSorting}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredCandidates.length > itemsPerPage && (
        <Card className="border-2">
          <CardContent className="pt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {(() => {
                  const pages: (number | "ellipsis")[] = []
                  if (totalPages <= 7) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i)
                  } else if (currentPage <= 3) {
                    pages.push(1, 2, 3, 4, "ellipsis", totalPages)
                  } else if (currentPage >= totalPages - 2) {
                    pages.push(1, "ellipsis")
                    for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
                  } else {
                    pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages)
                  }
                  return pages.map((page, index) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
