import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/kandydat',
          '/rekruter',
          '/o-nas',
        ],
        disallow: [
          '/database',
          '/dashboard',
          '/register',
          '/reset-password',
          '/update-password',
          '/accept-invite',
          '/zaloguj',
          '/api',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

