"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type SimilarCandidateItem = {
  key: string
  href: string
  heading: string
  subheading?: string
  technologies?: string
  seniority?: string
  location?: string | null
}

export default function SimilarCandidates({
  title,
  description,
  items,
}: {
  title: string
  description?: string
  items: SimilarCandidateItem[]
}) {
  if (!items || items.length === 0) return null

  return (
    <Card className="border-2 shadow-sm bg-gradient-to-br from-background via-background to-muted/40">
      <CardHeader className="pb-3">
        <CardTitle className="text-base tracking-tight">{title}</CardTitle>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-fr">
        {items.map((item) => {
          const techs = item.technologies
            ?.split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 6)

          return (
            <Link
              key={item.key}
              href={item.href}
              className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
            >
              <Card className="h-full border shadow-sm bg-card/80 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-primary/70">
                <CardContent className="h-full p-4 flex flex-col gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold leading-snug line-clamp-2">
                      {item.heading}
                    </div>
                    {/* Meta badges row */}
                    {(item.seniority || item.location) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.seniority && (
                          <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                            Seniority: {item.seniority}
                          </Badge>
                        )}
                        {item.location && (
                          <Badge variant="outline" className="text-[11px] px-2 py-0.5">
                            {item.location.toLowerCase().includes("zdalnie") || item.location.toLowerCase().includes("remote")
                              ? "Tryb pracy: Zdalnie"
                              : `Lokalizacja: ${item.location}`}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {techs && techs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto max-h-[56px] overflow-hidden">
                      {techs.map((t) => (
                        <Badge
                          key={t}
                          className="text-[11px] px-2 py-0.5 bg-primary/15 text-primary ring-1 ring-inset ring-primary/20"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}

