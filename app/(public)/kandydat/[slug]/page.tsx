import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCandidateBySlug } from "@/lib/data/candidates-queries"
import { getBreadcrumbSchema } from "@/lib/seo/structured-data"
import { slugify } from "@/lib/utils/slug"
import PublicCandidateView from "@/components/public-candidate-view"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qualibase.pl"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ selected?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const candidate = await getCandidateBySlug(slug)

  if (!candidate) {
    return { title: "Kandydat nie znaleziony | QualiBase" }
  }

  const parts = [candidate.seniority, candidate.role, candidate.location].filter(Boolean)
  const title = `${parts.join(" — ")} | QualiBase`
  const description = candidate.summary
    || `Profil kandydata: ${parts.join(", ")}. Sprawdź technologie, doświadczenie i dostępność.`
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
  const { selected } = await searchParams

  const candidate = await getCandidateBySlug(slug)
  if (!candidate) notFound()

  const selectedSlugs = selected ? selected.split(",").filter(Boolean) : []

  const currentIndex = selectedSlugs.length > 0
    ? selectedSlugs.indexOf(slug)
    : -1

  const previousSlug = currentIndex > 0 ? selectedSlugs[currentIndex - 1] : null
  const nextSlug = currentIndex >= 0 && currentIndex < selectedSlugs.length - 1
    ? selectedSlugs[currentIndex + 1]
    : null

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
    <section className="container mx-auto px-4 py-10 max-w-3xl">
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
        previousSlug={previousSlug}
        nextSlug={nextSlug}
        currentIndex={currentIndex >= 0 ? currentIndex : 0}
        totalCount={selectedSlugs.length > 0 ? selectedSlugs.length : 1}
        selectedSlugs={selectedSlugs}
      />
    </section>
  )
}
