const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.qualibase.pl"

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface ListingContentParams {
  role?: string
  technology?: string
  location?: string
  page?: number
}

export function getListingH1(params: ListingContentParams): string {
  const { role, technology, location } = params

  if (role && technology && location) {
    return `${capitalize(technology)} ${capitalize(role)} ${capitalize(location)} — dostępni kandydaci`
  }
  if (role && technology) {
    return `${capitalize(technology)} ${capitalize(role)} — dostępni kandydaci`
  }
  if (technology) {
    return `${capitalize(technology)} — dostępni kandydaci`
  }
  if (role) {
    return `${capitalize(role)} — dostępni kandydaci`
  }
  return "Kandydaci IT — baza specjalistów"
}

export function getListingDescription(params: ListingContentParams): string {
  const { role, technology, location } = params

  if (role && technology && location) {
    return `Lista dostępnych kandydatów ${capitalize(role)} z doświadczeniem w ${capitalize(technology)} w lokalizacji ${capitalize(location)}.`
  }
  if (role && technology) {
    return `Lista dostępnych kandydatów ${capitalize(role)} z doświadczeniem w ${capitalize(technology)}.`
  }
  if (technology) {
    return `Lista dostępnych kandydatów z doświadczeniem w ${capitalize(technology)}.`
  }
  if (role) {
    return `Lista dostępnych kandydatów na stanowisko ${capitalize(role)}. Sprawdź profile zweryfikowanych specjalistów IT.`
  }
  return `Baza zweryfikowanych specjalistów IT. Przeglądaj profile kandydatów według roli, technologii i lokalizacji.`
}

export function getListingMetaTitle(params: ListingContentParams): string {
  const { role, technology, location, page } = params
  const pageSuffix = page && page > 1 ? ` — strona ${page}` : ""

  if (role && technology && location) {
    return `${capitalize(technology)} ${capitalize(role)} ${capitalize(location)}${pageSuffix} | QualiBase`
  }
  if (role && technology) {
    return `${capitalize(technology)} ${capitalize(role)} — kandydaci IT${pageSuffix} | QualiBase`
  }
  if (technology) {
    return `${capitalize(technology)} — kandydaci IT${pageSuffix} | QualiBase`
  }
  if (role) {
    return `${capitalize(role)} — dostępni kandydaci IT${pageSuffix} | QualiBase`
  }
  return `Kandydaci IT — baza specjalistów${pageSuffix} | QualiBase`
}

export function getListingMetaDescription(params: ListingContentParams): string {
  const { role, technology, location, page } = params
  const pageInfo = page && page > 1 ? ` Strona ${page} wyników.` : ""

  if (role && technology && location) {
    return `Znajdź ${capitalize(technology)} ${capitalize(role)} w ${capitalize(location)}. Zweryfikowani specjaliści IT dostępni od zaraz.${pageInfo} QualiBase — platforma rekrutacyjna.`
  }
  if (role && technology) {
    return `Kandydaci ${capitalize(role)} z doświadczeniem w ${capitalize(technology)}. Zweryfikowani specjaliści IT dostępni do współpracy.${pageInfo} QualiBase.`
  }
  if (technology) {
    return `Kandydaci z doświadczeniem w ${capitalize(technology)}. Zweryfikowani specjaliści IT dostępni do współpracy.${pageInfo} QualiBase.`
  }
  if (role) {
    return `Kandydaci na stanowisko ${capitalize(role)}. Przeglądaj profile zweryfikowanych specjalistów IT.${pageInfo} QualiBase — platforma rekrutacyjna.`
  }
  return `Baza zweryfikowanych specjalistów IT. Przeglądaj profile kandydatów według roli, technologii i lokalizacji.${pageInfo} QualiBase.`
}

export function getListingCanonicalUrl(params: {
  role?: string
  technology?: string
  location?: string
  page?: number
}): string {
  const parts = [baseUrl, "kandydaci"]
  if (params.role) parts.push(params.role)
  if (params.technology) parts.push(params.technology)
  if (params.location) parts.push(params.location)
  const base = parts.join("/")
  const page = params.page && params.page > 1 ? params.page : undefined
  if (!page) return base
  const url = new URL(base)
  url.searchParams.set("page", String(page))
  return url.toString()
}

export function getListingBreadcrumbs(params: {
  role?: string
  technology?: string
  location?: string
}): Array<{ name: string; url: string }> {
  const items: Array<{ name: string; url: string }> = [
    { name: "Strona główna", url: baseUrl },
    { name: "Kandydaci", url: `${baseUrl}/kandydaci` },
  ]

  if (params.role) {
    items.push({
      name: capitalize(params.role),
      url: `${baseUrl}/kandydaci/${params.role}`,
    })
  }
  if (params.technology) {
    items.push({
      name: capitalize(params.technology),
      url: `${baseUrl}/kandydaci/${params.role}/${params.technology}`,
    })
  }
  if (params.location) {
    items.push({
      name: capitalize(params.location),
      url: `${baseUrl}/kandydaci/${params.role}/${params.technology}/${params.location}`,
    })
  }

  return items
}
