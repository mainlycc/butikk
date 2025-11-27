"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { ColumnDef, SortingState, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Search, Users, Mail, FileText, Filter, X, Shield } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/client"
import CVSlideshow from "@/components/cv-slideshow"
import ContactDialog from "@/components/contact-dialog"
import { AdminPanel } from "@/components/admin-panel"
import { SyncButton } from "@/components/sync-button"
import { syncGoogleSheetsToSupabase } from "@/app/actions/sync-google-sheets"
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

interface Candidate {
  id: string
  // Wartość dostępna dla rekordów z bazy, ale nie jest wymagana w każdym miejscu
  sheet_row_number?: number
  nr?: string | null
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  location?: string | null
  candidate_email?: string | null
  guardian: string | null
  guardian_email?: string | null
  cv: string | null
  cv_pdf_url?: string | null
  technologies: string | null
  previous_contact: string | null
  project_description: string | null
  skills?: string | null
  languages?: string | null
  availability?: string | null
}

interface DatabaseContentProps {
  initialCandidates: Candidate[]
  userEmail: string
  isAdmin: boolean
}

export default function DatabaseContent({ initialCandidates, userEmail, isAdmin }: DatabaseContentProps) {
  const [searchTerms, setSearchTerms] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [contactCandidates, setContactCandidates] = useState<Candidate[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([])
  const itemsPerPage = 50

  // Automatyczna synchronizacja w tle co 5 minut
  useEffect(() => {
    const performAutoSync = async () => {
      if (isSyncingRef.current) return // Zapobiegaj równoczesnym synchronizacjom
      
      isSyncingRef.current = true
      setIsAutoSyncing(true)
      try {
        const result = await syncGoogleSheetsToSupabase(true)
        if (result.success) {
          // Odśwież dane po synchronizacji
          const supabase = getSupabaseBrowserClient()
          const { data: updatedCandidates } = await supabase
            .from("candidates")
            .select("*")
            .order("sheet_row_number", { ascending: true })
          
          if (updatedCandidates) {
            setCandidates(updatedCandidates)
          }
        }
      } catch (error) {
        console.error("Auto sync error:", error)
      } finally {
        isSyncingRef.current = false
        setIsAutoSyncing(false)
      }
    }

    // Wykonaj synchronizację natychmiast po załadowaniu (jeśli minęło wystarczająco czasu)
    // Opóźnij o 2 sekundy, żeby nie blokować renderowania
    const initialTimeout = setTimeout(performAutoSync, 2000)

    // Następnie synchronizuj co 5 minut (300000 ms)
    syncIntervalRef.current = setInterval(performAutoSync, 5 * 60 * 1000)

    return () => {
      clearTimeout(initialTimeout)
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [])

  // Aktualizuj kandydatów gdy zmienią się initialCandidates (np. po revalidate)
  useEffect(() => {
    setCandidates(initialCandidates)
  }, [initialCandidates])

  const filteredCandidates = useMemo(() => {
    if (!searchTerms.trim()) return candidates

    const terms = searchTerms
      .toLowerCase()
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)

    return candidates.filter((candidate) => {
      const searchableText = [
        candidate.first_name,
        candidate.last_name,
        candidate.role,
        candidate.seniority,
        candidate.rate,
        candidate.technologies,
        candidate.location,
        candidate.languages,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }, [candidates, searchTerms])

  // Resetuj stronę gdy zmienia się filtrowanie lub sortowanie
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerms, candidates, sorting])

  const handleFilter = () => {
    toast.info(`Znaleziono ${filteredCandidates.length} kandydatów`)
  }

  const handleResetFilter = () => {
    setSearchTerms("")
    toast.info("Wyświetlane są wszyscy kandydaci")
  }

  const toggleCandidate = (id: string) => {
    const newSelected = new Set(selectedCandidates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCandidates(newSelected)
  }

  const toggleAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set())
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map((c) => c.id)))
    }
  }

  const getSelectedCandidatesData = () => {
    return filteredCandidates.filter((c) => selectedCandidates.has(c.id))
  }

  const columns = useMemo<ColumnDef<Candidate>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={
              selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0
            }
            onCheckedChange={toggleAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedCandidates.has(row.original.id)}
            onCheckedChange={() => toggleCandidate(row.original.id)}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "first_name",
        header: "Imię i Nazwisko",
        cell: ({ row }) => (
          <div className="font-medium">
            {row.original.first_name} {row.original.last_name || ""}
          </div>
        ),
        enableSorting: false,
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
      },
      {
        accessorKey: "rate",
        header: "Stawka",
        cell: ({ row }) => <div className="text-sm">{row.original.rate || "-"}</div>,
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

  // Użyj useReactTable do sortowania wszystkich danych przed paginacją
  const table = useReactTable({
    data: filteredCandidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    manualPagination: true,
  })

  // Oblicz paginowane dane z posortowanych danych
  const sortedCandidates = table.getRowModel().rows.map((row) => row.original)
  const totalPages = Math.ceil(sortedCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex)

  return (
    <>
      <div className="space-y-6">
          {isAdmin && (
            <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-purple-700 dark:text-purple-300" />
                    <div>
                      <p className="font-semibold text-purple-900 dark:text-purple-100">Panel Administratora</p>
                      <p className="text-sm text-purple-800 dark:text-purple-200">
                        Zarządzaj użytkownikami i synchronizuj dane
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <SyncButton />
                    <AdminPanel />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search & Filter */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Wprowadź słowa kluczowe oddzielone przecinkami (np. React, Senior, JavaScript)"
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

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <p className="text-muted-foreground">
                      Wyświetlanych: <span className="font-semibold text-foreground">{filteredCandidates.length}</span>{" "}
                      kandydatów
                      {searchTerms && ` (z ${candidates.length} całkowitych)`}
                    </p>
                    {isAutoSyncing && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
                        Synchronizacja...
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    Zaznaczonych: <span className="font-semibold text-foreground">{selectedCandidates.size}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                {selectedCandidates.size > 0 ? (
                  <p className="text-base font-medium">Wybrano {selectedCandidates.size} kandydatów</p>
                ) : (
                  <p className="text-base font-medium text-muted-foreground">Zaznacz kandydatów</p>
                )}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowSlideshow(true)} 
                    variant="outline" 
                    size="lg"
                    disabled={selectedCandidates.size === 0}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Pokaz slajdów CV
                  </Button>
                  <Button 
                    onClick={() => {
                      setContactCandidates(getSelectedCandidatesData())
                      setShowContactDialog(true)
                    }} 
                    size="lg"
                    disabled={selectedCandidates.size === 0}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Wyślij zapytanie
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Table */}
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
                        // Jeśli jest mało stron, pokaż wszystkie
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(i)
                        }
                      } else {
                        // Zawsze pokaż pierwszą stronę
                        pages.push(1)
                        
                        if (currentPage <= 3) {
                          // Jesteśmy na początku
                          for (let i = 2; i <= 4; i++) {
                            pages.push(i)
                          }
                          pages.push("ellipsis")
                          pages.push(totalPages)
                        } else if (currentPage >= totalPages - 2) {
                          // Jesteśmy na końcu
                          pages.push("ellipsis")
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          // Jesteśmy w środku
                          pages.push("ellipsis")
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(i)
                          }
                          pages.push("ellipsis")
                          pages.push(totalPages)
                        }
                      }
                      
                      return pages.map((page, index) => {
                        if (page === "ellipsis") {
                          return (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return (
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
                      })
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

      {/* CV Slideshow Modal */}
      {showSlideshow && (
        <CVSlideshow 
          candidates={getSelectedCandidatesData().map(({ 
            id,
            first_name,
            last_name,
            role,
            seniority,
            rate,
            technologies,
            cv,
            cv_pdf_url,
            location,
            candidate_email,
            guardian,
            guardian_email,
            previous_contact,
            project_description,
            languages,
            availability,
            skills,
          }) => ({
            id,
            first_name,
            last_name,
            role,
            seniority,
            rate,
            technologies,
            cv,
            cv_pdf_url,
            location,
            candidate_email,
            guardian,
            guardian_email,
            previous_contact,
            project_description,
            languages,
            availability,
            skills,
          }))} 
          onClose={() => setShowSlideshow(false)} 
          onOpenContact={(candidate) => {
            // Zamknij podgląd slajdów i otwórz ten sam dialog co z listy
            setShowSlideshow(false)
            setContactCandidates([candidate])
            setShowContactDialog(true)
          }}
        />
      )}

      {/* Contact Dialog */}
      {showContactDialog && contactCandidates.length > 0 && (
        <ContactDialog
          candidates={contactCandidates}
          recruiterEmail={userEmail}
          onClose={() => setShowContactDialog(false)}
        />
      )}
    </>
  )
}
