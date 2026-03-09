import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAllPublicCandidates,
  getPublicCandidatesCount,
} from "@/lib/data/candidates-queries"
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

interface PageProps {
  params: Promise<{ rola: string; technologia: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { rola, technologia } = await params
  const role = decodeURIComponent(rola)
  const technology = decodeURIComponent(technologia)
  const count = await getPublicCandidatesCount({ role, technology })

  const title = getListingMetaTitle({ role, technology, count })
  const description = getListingMetaDescription({ role, technology, count })
  const canonical = getListingCanonicalUrl({ role: rola, technology: technologia })

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(count < 5 && { robots: { index: false } }),
  }
}

export default async function TechnologiaPage({ params }: PageProps) {
  const { rola, technologia } = await params
  const role = decodeURIComponent(rola)
  const technology = decodeURIComponent(technologia)

  const [candidates, count] = await Promise.all([
    getAllPublicCandidates({ role, technology }),
    getPublicCandidatesCount({ role, technology }),
  ])

  const h1 = getListingH1({ role, technology, count })
  const description = getListingDescription({ role, technology, count })
  const breadcrumbs = getListingBreadcrumbs({ role: rola, technology: technologia })

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
