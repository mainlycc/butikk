const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://qualibase.pl"

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

interface ListingContentParams {
  role?: string
  technology?: string
  location?: string
  count: number
}

export function getListingH1(params: ListingContentParams): string {
  const { role, technology, location } = params

  if (role && technology && location) {
    return `${capitalize(technology)} ${capitalize(role)} ${capitalize(location)} — dostępni kandydaci`
  }
  if (role && technology) {
    return `${capitalize(technology)} ${capitalize(role)} — dostępni kandydaci`
  }
  if (role) {
    return `${capitalize(role)} — dostępni kandydaci`
  }
  return "Kandydaci IT — baza specjalistów"
}

export function getListingDescription(params: ListingContentParams): string {
  const { role, technology, location, count } = params

  if (role && technology && location) {
    return `Lista dostępnych kandydatów ${capitalize(role)} z doświadczeniem w ${capitalize(technology)} w lokalizacji ${capitalize(location)}. Aktualnie ${count} specjalistów w bazie.`
  }
  if (role && technology) {
    return `Lista dostępnych kandydatów ${capitalize(role)} z doświadczeniem w ${capitalize(technology)}. Aktualnie ${count} specjalistów w bazie.`
  }
  if (role) {
    return `Lista dostępnych kandydatów na stanowisko ${capitalize(role)}. Sprawdź profile zweryfikowanych specjalistów IT. Aktualnie ${count} kandydatów w bazie.`
  }
  return `Baza zweryfikowanych specjalistów IT. Przeglądaj profile kandydatów według roli, technologii i lokalizacji. Aktualnie ${count} kandydatów w bazie.`
}

export function getListingMetaTitle(params: ListingContentParams): string {
  const { role, technology, location } = params

  if (role && technology && location) {
    return `${capitalize(technology)} ${capitalize(role)} ${capitalize(location)} | QualiBase`
  }
  if (role && technology) {
    return `${capitalize(technology)} ${capitalize(role)} — kandydaci IT | QualiBase`
  }
  if (role) {
    return `${capitalize(role)} — dostępni kandydaci IT | QualiBase`
  }
  return "Kandydaci IT — baza specjalistów | QualiBase"
}

export function getListingMetaDescription(params: ListingContentParams): string {
  const { role, technology, location, count } = params

  if (role && technology && location) {
    return `Znajdź ${capitalize(technology)} ${capitalize(role)} w ${capitalize(location)}. ${count} zweryfikowanych specjalistów IT dostępnych od zaraz. QualiBase — platforma rekrutacyjna.`
  }
  if (role && technology) {
    return `${count} kandydatów ${capitalize(role)} z doświadczeniem w ${capitalize(technology)}. Zweryfikowani specjaliści IT dostępni do współpracy. QualiBase.`
  }
  if (role) {
    return `${count} kandydatów na stanowisko ${capitalize(role)}. Przeglądaj profile zweryfikowanych specjalistów IT. QualiBase — platforma rekrutacyjna.`
  }
  return `Baza ${count} zweryfikowanych specjalistów IT. Przeglądaj profile kandydatów według roli, technologii i lokalizacji. QualiBase.`
}

export function getListingCanonicalUrl(params: {
  role?: string
  technology?: string
  location?: string
}): string {
  const parts = [baseUrl, "kandydaci"]
  if (params.role) parts.push(params.role)
  if (params.technology) parts.push(params.technology)
  if (params.location) parts.push(params.location)
  return parts.join("/")
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
