import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getPublicCandidates,
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
  params: Promise<{ rola: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { rola } = await params
  const { page } = await searchParams
  const role = decodeURIComponent(rola)
  const currentPage = Number(page) > 1 ? Number(page) : 1
  const count = await getPublicCandidatesCount({ role })

  const title = getListingMetaTitle({ role, count, page: currentPage })
  const description = getListingMetaDescription({ role, count, page: currentPage })
  const canonical = getListingCanonicalUrl({ role: rola, page: currentPage })

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(count < 5 && { robots: { index: false } }),
  }
}

export default async function RolaPage({ params, searchParams }: PageProps) {
  const { rola } = await params
  const { page } = await searchParams
  const role = decodeURIComponent(rola)
  const currentPage = Number(page) > 1 ? Number(page) : 1

  const { data: candidates, total, totalPages } = await getPublicCandidates({ role }, currentPage)

  const h1 = getListingH1({ role, count: total, page: currentPage })
  const description = getListingDescription({ role, count: total, page: currentPage })
  const breadcrumbs = getListingBreadcrumbs({ role: rola })

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
        <PublicDatabaseContent
          candidates={candidates}
          page={currentPage}
          totalPages={totalPages}
          basePath={`/kandydaci/${rola}`}
        />
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
