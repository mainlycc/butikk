import { MetadataRoute } from "next"
import {
  getAllPublicSlugs,
  getIndexableListingPaths,
} from "@/lib/data/candidates-queries"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qualibase.pl"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/kandydaci`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kandydat`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rekruter`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/o-nas`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  const [slugs, listingPaths] = await Promise.all([
    getAllPublicSlugs(),
    getIndexableListingPaths(5),
  ])

  const listingPages: MetadataRoute.Sitemap = [
    ...listingPaths.roles.map((role) => ({
      url: `${baseUrl}/kandydaci/${role}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...listingPaths.roleTech.map(({ role, technology }) => ({
      url: `${baseUrl}/kandydaci/${role}/${technology}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...listingPaths.roleTechLocation.map(({ role, technology, location }) => ({
      url: `${baseUrl}/kandydaci/${role}/${technology}/${location}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]

  const profilePages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${baseUrl}/kandydat/${slug}`,
    lastModified: currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticPages, ...listingPages, ...profilePages]
}
