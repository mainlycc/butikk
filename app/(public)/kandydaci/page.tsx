import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import ExpandableTags from "@/components/expandable-tags"
import {
  getAllPublicCandidates,
  getPublicCandidatesCount,
  getAvailableTechnologies,
  getAvailableRoles,
} from "@/lib/data/candidates-queries"
import { slugify } from "@/lib/utils/slug"
import {
  getListingH1,
  getListingDescription,
  getListingMetaTitle,
  getListingMetaDescription,
  getListingCanonicalUrl,
  getListingBreadcrumbs,
} from "@/lib/seo/listing-content"
import { getBreadcrumbSchema } from "@/lib/seo/structured-data"
import PublicDatabaseContent from "@/components/public-database-content"

export async function generateMetadata(): Promise<Metadata> {
  const count = await getPublicCandidatesCount()

  const title = getListingMetaTitle({ count })
  const description = getListingMetaDescription({ count })
  const canonical = getListingCanonicalUrl({})

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(count < 5 && { robots: { index: false } }),
  }
}

export default async function KandydaciPage() {
  const [candidates, count, technologies, roles] = await Promise.all([
    getAllPublicCandidates(),
    getPublicCandidatesCount(),
    getAvailableTechnologies(),
    getAvailableRoles(),
  ])

  const h1 = getListingH1({ count })
  const description = getListingDescription({ count })
  const breadcrumbs = getListingBreadcrumbs({})

  return (
    <section className="container mx-auto px-4 py-10 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema(breadcrumbs)),
        }}
      />

      <h1 className="text-3xl font-bold tracking-tight mb-3">{h1}</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">{description}</p>

      <div className="space-y-4 mb-8">
        <ExpandableTags
          label="Według roli"
          variant="outline"
          tags={roles.map((role) => ({ text: role, href: `/kandydaci/${slugify(role)}` }))}
        />
        <ExpandableTags
          label="Według technologii"
          variant="secondary"
          tags={technologies.map((tech) => ({ text: tech, href: `/kandydaci/${slugify(tech)}` }))}
        />
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <PublicDatabaseContent candidates={candidates} />
      </Suspense>
    </section>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
