import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCandidateBySlug, getSimilarPublicCandidates } from "@/lib/data/candidates-queries"
import { getBreadcrumbSchema } from "@/lib/seo/structured-data"
import {
  getCandidateAutoDescription,
  getCandidateMetaDescription,
  getCandidateMetaTitle,
} from "@/lib/seo/candidate-content"
import { slugify } from "@/lib/utils/slug"
import PublicCandidateView from "@/components/public-candidate-view"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qualibase.pl"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const candidate = await getCandidateBySlug(slug)

  if (!candidate) {
    return { title: "Kandydat nie znaleziony | QualiBase" }
  }

  const title = getCandidateMetaTitle(candidate)
  const description = getCandidateMetaDescription(candidate)
  const canonical = `${baseUrl}/kandydat/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "profile" },
  }
}

function getPersonSchema(candidate: NonNullable<Awaited<ReturnType<typeof getCandidateBySlug>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    jobTitle: [candidate.seniority, candidate.role].filter(Boolean).join(" "),
    knowsAbout: candidate.technologies?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    ...(candidate.location && {
      address: { "@type": "PostalAddress", addressLocality: candidate.location },
    }),
  }
}

export default async function PublicCandidateProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  await searchParams

  const [candidate, similarCandidates] = await Promise.all([
    getCandidateBySlug(slug),
    getSimilarPublicCandidates(slug, 3),
  ])
  if (!candidate) notFound()

  const autoDescription = getCandidateAutoDescription(candidate)

  const roleSlug = candidate.role ? slugify(candidate.role) : null

  const breadcrumbs = [
    { name: "Strona główna", url: baseUrl },
    { name: "Kandydaci", url: `${baseUrl}/kandydaci` },
    ...(roleSlug
      ? [{ name: candidate.role!, url: `${baseUrl}/kandydaci/${roleSlug}` }]
      : []),
    {
      name: [candidate.seniority, candidate.role].filter(Boolean).join(" "),
      url: `${baseUrl}/kandydat/${slug}`,
    },
  ]

  return (
    <section className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(breadcrumbs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getPersonSchema(candidate)) }}
      />

      <PublicCandidateView
        candidate={candidate}
        autoDescription={autoDescription}
        similarCandidates={similarCandidates}
        previousSlug={null}
        nextSlug={null}
        currentIndex={0}
        totalCount={1}
      />
    </section>
  )
}
