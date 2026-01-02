import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/main',
          '/main/kandydat',
          '/main/rekruter',
          '/main/o-nas',
        ],
        disallow: [
          '/database',
          '/dashboard',
          '/register',
          '/reset-password',
          '/update-password',
          '/accept-invite',
          '/main/zaloguj',
          '/api',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

