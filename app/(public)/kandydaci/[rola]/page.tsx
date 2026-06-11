import type { Metadata } from "next"
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
import PublicCandidatesListing from "@/components/public-candidates-listing"

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

  const title = getListingMetaTitle({ role, page: currentPage })
  const description = getListingMetaDescription({ role, page: currentPage })
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

  const h1 = getListingH1({ role, page: currentPage })
  const description = getListingDescription({ role, page: currentPage })
  const breadcrumbs = getListingBreadcrumbs({ role: rola })

  return (
    <section className="container mx-auto px-4 py-10 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getBreadcrumbSchema(breadcrumbs)),
        }}
      />

      <h1 className="text-3xl tracking-tight mb-3">{h1}</h1>
      <p className="text-muted-foreground mb-8 max-w-2xl">{description}</p>

      <PublicCandidatesListing
        candidates={candidates}
        page={currentPage}
        totalPages={totalPages}
        basePath={`/kandydaci/${rola}`}
      />
    </section>
  )
}
