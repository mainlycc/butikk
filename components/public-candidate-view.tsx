"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Briefcase,
  Clock,
  Globe,
  Code2,
  Sparkles,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"
import type { PublicCandidate } from "@/lib/types/candidate"

interface PublicCandidateViewProps {
  candidate: PublicCandidate
  previousSlug: string | null
  nextSlug: string | null
  currentIndex: number
  totalCount: number
  selectedSlugs: string[]
}

export default function PublicCandidateView({
  candidate,
  previousSlug,
  nextSlug,
  currentIndex,
  totalCount,
  selectedSlugs,
}: PublicCandidateViewProps) {
  const router = useRouter()

  const technologies = candidate.technologies
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  const h1Parts = [candidate.seniority, candidate.role, candidate.location].filter(Boolean)

  const selectedParam = selectedSlugs.length > 0
    ? `?selected=${selectedSlugs.join(",")}`
    : ""

  const navigateTo = (slug: string) => {
    router.push(`/kandydat/${slug}${selectedParam}`)
  }

  return (
    <div className="space-y-6">
      {/* Navigation bar */}
      {totalCount > 1 && (
        <Card className="border-2">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/kandydaci")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Lista kandydatów
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} z {totalCount}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!previousSlug}
                  onClick={() => previousSlug && navigateTo(previousSlug)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Poprzedni
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!nextSlug}
                  onClick={() => nextSlug && navigateTo(nextSlug)}
                >
                  Następny
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          {h1Parts.join(" — ")}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          {candidate.seniority && (
            <Badge variant="default">{candidate.seniority}</Badge>
          )}
          {candidate.role && (
            <Badge variant="secondary">{candidate.role}</Badge>
          )}
          {candidate.location && (
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" />
              {candidate.location}
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      {candidate.summary && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              O kandydacie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {candidate.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Technologies */}
      {technologies && technologies.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Technologie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {candidate.experience_years && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Doświadczenie</p>
                <p className="font-medium">{candidate.experience_years} lat</p>
              </div>
            </CardContent>
          </Card>
        )}

        {candidate.availability && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Dostępność</p>
                <p className="font-medium">{candidate.availability}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {candidate.languages && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Języki</p>
                <p className="font-medium">{candidate.languages}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {candidate.skills && (
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">Umiejętności</p>
                <p className="font-medium">{candidate.skills}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* CTA */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-6 text-center space-y-4">
          <Lock className="w-8 h-8 mx-auto text-primary" />
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Pełne dane tego kandydata
            </h2>
            <p className="text-muted-foreground text-sm">
              Imię, nazwisko, dane kontaktowe, CV i stawka — dostępne po zalogowaniu.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href={`/app/login?redirect=/app/kandydat/${candidate.id}`}>
              Zaloguj się i zobacz pełny profil
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
