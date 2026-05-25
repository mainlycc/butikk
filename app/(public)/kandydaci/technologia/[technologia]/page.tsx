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
} from "@/lib/seo/listing-content"
import { getBreadcrumbSchema } from "@/lib/seo/structured-data"
import PublicCandidatesListing from "@/components/public-candidates-listing"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qualibase.pl"

interface PageProps {
  params: Promise<{ technologia: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { technologia } = await params
  const { page } = await searchParams
  const technology = decodeURIComponent(technologia)
  const currentPage = Number(page) > 1 ? Number(page) : 1
  const count = await getPublicCandidatesCount({ technology })

  const title = getListingMetaTitle({ technology, page: currentPage })
  const description = getListingMetaDescription({ technology, page: currentPage })
  const canonicalBase = `${baseUrl}/kandydaci/technologia/${technologia}`
  const canonical =
    currentPage > 1 ? `${canonicalBase}?page=${encodeURIComponent(String(currentPage))}` : canonicalBase

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
    ...(count < 5 && { robots: { index: false } }),
  }
}

export default async function TechnologiaOnlyPage({ params, searchParams }: PageProps) {
  const { technologia } = await params
  const { page } = await searchParams
  const technology = decodeURIComponent(technologia)
  const currentPage = Number(page) > 1 ? Number(page) : 1

  const { data: candidates, total, totalPages } = await getPublicCandidates(
    { technology },
    currentPage
  )

  const h1 = getListingH1({ technology, page: currentPage })
  const description = getListingDescription({ technology, page: currentPage })

  const breadcrumbs = [
    { name: "Strona główna", url: baseUrl },
    { name: "Kandydaci", url: `${baseUrl}/kandydaci` },
    { name: technology, url: `${baseUrl}/kandydaci/technologia/${technologia}` },
  ]

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

      <PublicCandidatesListing
        candidates={candidates}
        page={currentPage}
        totalPages={totalPages}
        basePath={`/kandydaci/technologia/${technologia}`}
      />
    </section>
  )
}
