import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  MapPin,
  Briefcase,
  Clock,
  Globe,
  ChevronRight,
  Users,
  ChevronLeft,
} from "lucide-react"
import type { PublicCandidate, PaginatedCandidates } from "@/lib/types/candidate"

interface CandidatesListingProps {
  result: PaginatedCandidates<PublicCandidate>
  basePath: string
  subcategories?: Array<{ label: string; href: string; count?: number }>
  currentPage: number
}

function CandidateCard({ candidate }: { candidate: PublicCandidate }) {
  const technologies = candidate.technologies
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 6)

  return (
    <Link href={`/kandydat/${candidate.slug}`}>
      <Card className="border hover:border-primary/50 hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {candidate.seniority && (
                  <Badge variant="default" className="text-xs">
                    {candidate.seniority}
                  </Badge>
                )}
                {candidate.role && (
                  <Badge variant="secondary" className="text-xs">
                    {candidate.role}
                  </Badge>
                )}
              </div>

              {candidate.summary && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {candidate.summary}
                </p>
              )}

              {technologies && technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {tech}
                    </Badge>
                  ))}
                  {candidate.technologies &&
                    candidate.technologies.split(",").length > 6 && (
                      <Badge
                        variant="outline"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        +{candidate.technologies.split(",").length - 6}
                      </Badge>
                    )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {candidate.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {candidate.location}
                  </span>
                )}
                {candidate.experience_years && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {candidate.experience_years} lat doświadczenia
                  </span>
                )}
                {candidate.availability && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {candidate.availability}
                  </span>
                )}
                {candidate.languages && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {candidate.languages}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block flex-shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PaginationNav({
  currentPage,
  totalPages,
  basePath,
}: {
  currentPage: number
  totalPages: number
  basePath: string
}) {
  if (totalPages <= 1) return null

  function pageHref(page: number) {
    return page === 1 ? basePath : `${basePath}?page=${page}`
  }

  const pages: (number | "dots")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "dots", totalPages)
  } else if (currentPage >= totalPages - 2) {
    pages.push(1, "dots", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
  } else {
    pages.push(1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots", totalPages)
  }

  return (
    <nav aria-label="Paginacja" className="flex items-center justify-center gap-1 mt-8">
      {currentPage > 1 && (
        <Link
          href={pageHref(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Poprzednia
        </Link>
      )}

      {pages.map((p, i) =>
        p === "dots" ? (
          <span key={`dots-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(p)}
            className={`inline-flex items-center justify-center w-9 h-9 text-sm rounded-md border transition-colors ${
              p === currentPage
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link
          href={pageHref(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border hover:bg-accent transition-colors"
        >
          Następna
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </nav>
  )
}

export default function CandidatesListing({
  result,
  basePath,
  subcategories,
  currentPage,
}: CandidatesListingProps) {
  const { data: candidates, total, totalPages } = result

  return (
    <div className="space-y-6">
      {/* Subcategories / links do podkategorii */}
      {subcategories && subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Link key={sub.href} href={sub.href}>
              <Badge
                variant="outline"
                className="px-3 py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer"
              >
                {sub.label}
                {sub.count !== undefined && (
                  <span className="ml-1.5 text-muted-foreground">({sub.count})</span>
                )}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Informacja o liczbie wyników */}
      <p className="text-sm text-muted-foreground">
        {total === 0
          ? "Brak kandydatów spełniających kryteria"
          : `${total} kandydatów`}
      </p>

      {/* Lista kandydatów */}
      {candidates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Nie znaleziono kandydatów w tej kategorii.
            </p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/kandydaci">Przeglądaj wszystkich kandydatów</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.slug} candidate={candidate} />
          ))}
        </div>
      )}

      {/* Paginacja */}
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
      />
    </div>
  )
}
