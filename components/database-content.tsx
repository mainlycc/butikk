"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, LogOut, Users, Mail, FileText, Filter, X, Shield } from "lucide-react"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/client"
import CVSlideshow from "@/components/cv-slideshow"
import ContactDialog from "@/components/contact-dialog"
import { AdminPanel } from "@/components/admin-panel"
import { SyncButton } from "@/components/sync-button"
import { syncGoogleSheetsToSupabase } from "@/app/actions/sync-google-sheets"

interface Candidate {
  id: string
  sheet_row_number: number
  nr?: string | null
  first_name: string | null
  last_name?: string | null
  role: string | null
  seniority: string | null
  rate: string | null
  guardian: string | null
  guardian_email?: string | null
  cv: string | null
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
  const router = useRouter()
  const [searchTerms, setSearchTerms] = useState("")
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set())
  const [showSlideshow, setShowSlideshow] = useState(false)
  const [showContactDialog, setShowContactDialog] = useState(false)
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
  const [isAutoSyncing, setIsAutoSyncing] = useState(false)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isSyncingRef = useRef(false)

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
        candidate.guardian,
        candidate.languages,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return terms.every((term) => searchableText.includes(term))
    })
  }, [candidates, searchTerms])

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/")
  }

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

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Butik Kandydatów</h1>
                    {isAdmin && (
                      <Badge variant="default" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Wyloguj
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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
          {selectedCandidates.size > 0 && (
            <Card className="border-2 border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-medium">Wybrano {selectedCandidates.size} kandydatów</p>
                  <div className="flex gap-3">
                    <Button onClick={() => setShowSlideshow(true)} variant="outline" size="lg">
                      <FileText className="w-4 h-4 mr-2" />
                      Pokaz slajdów CV
                    </Button>
                    <Button onClick={() => setShowContactDialog(true)} size="lg">
                      <Mail className="w-4 h-4 mr-2" />
                      Wyślij zapytanie o kontakt
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b-2">
                      <tr>
                        <th className="p-4 text-left">
                          <Checkbox
                            checked={
                              selectedCandidates.size === filteredCandidates.length && filteredCandidates.length > 0
                            }
                            onCheckedChange={toggleAll}
                          />
                        </th>
                        <th className="p-4 text-left font-semibold">Imię i Nazwisko</th>
                        <th className="p-4 text-left font-semibold">Rola</th>
                        <th className="p-4 text-left font-semibold">Seniority</th>
                        <th className="p-4 text-left font-semibold">Stawka</th>
                        <th className="p-4 text-left font-semibold">Technologie</th>
                        <th className="p-4 text-left font-semibold">Opiekun</th>
                        <th className="p-4 text-left font-semibold">Dostępność</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            selectedCandidates.has(candidate.id) ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-4">
                            <Checkbox
                              checked={selectedCandidates.has(candidate.id)}
                              onCheckedChange={() => toggleCandidate(candidate.id)}
                            />
                          </td>
                          <td className="p-4 font-medium">
                            {candidate.first_name} {candidate.last_name || ""}
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary">{candidate.role}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge>{candidate.seniority}</Badge>
                          </td>
                          <td className="p-4 text-sm">{candidate.rate || "-"}</td>
                          <td className="p-4 text-sm max-w-xs truncate">{candidate.technologies || "-"}</td>
                          <td className="p-4 text-sm text-muted-foreground">{candidate.guardian || "-"}</td>
                          <td className="p-4 text-sm">{candidate.availability || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CV Slideshow Modal */}
      {showSlideshow && (
        <CVSlideshow candidates={getSelectedCandidatesData()} onClose={() => setShowSlideshow(false)} />
      )}

      {/* Contact Dialog */}
      {showContactDialog && (
        <ContactDialog
          candidates={getSelectedCandidatesData()}
          recruiterEmail={userEmail}
          onClose={() => setShowContactDialog(false)}
        />
      )}
    </>
  )
}
