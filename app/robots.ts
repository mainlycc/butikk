import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/kandydaci',
          '/kandydat',
          '/rekruter',
          '/o-nas',
          '/kontakt',
          '/polityka-prywatnosci',
        ],
        disallow: [
          '/app',
          '/api',
          '/register',
          '/reset-password',
          '/update-password',
          '/accept-invite',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
