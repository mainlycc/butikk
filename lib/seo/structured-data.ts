const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qualibase.pl'

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QualiBase',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: 'Platforma rekrutacyjna dla branży IT. Łączymy najlepsze firmy ze zweryfikowanymi specjalistami IT.',
    sameAs: [
      // Tutaj można dodać linki do social media, gdy będą dostępne
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'kontakt@qualibase.pl',
    },
  }
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QualiBase',
    url: baseUrl,
    description: 'Platforma rekrutacyjna dla branży IT. Znajdź topowe talenty IT szybciej niż kiedykolwiek.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/main?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

