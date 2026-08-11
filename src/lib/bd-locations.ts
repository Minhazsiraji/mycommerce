import { BD_LOCATION_HIERARCHY } from './bd-locations.generated'

export const BD_DISTRICTS = Object.keys(BD_LOCATION_HIERARCHY) as Array<
  keyof typeof BD_LOCATION_HIERARCHY
>

export const BD_DISTRICT_SET: ReadonlySet<string> = new Set(BD_DISTRICTS)

export function bdCitiesFor(district: string): readonly string[] {
  const localities = BD_LOCATION_HIERARCHY[district as keyof typeof BD_LOCATION_HIERARCHY]
  return localities?.map((locality) => locality.name) ?? []
}

export function bdAreasFor(district: string, city: string): readonly string[] {
  const localities = BD_LOCATION_HIERARCHY[district as keyof typeof BD_LOCATION_HIERARCHY]
  return localities?.find((locality) => locality.name === city)?.areas ?? []
}

function canonical(value: string, candidates: readonly string[]) {
  const normalized = value.trim().toLocaleLowerCase('en')
  return candidates.find((candidate) => candidate.toLocaleLowerCase('en') === normalized) ?? ''
}

export function canonicalBdCity(district: string, value: string) {
  const cities = bdCitiesFor(district)
  const exact = canonical(value, cities)
  if (exact) return exact

  // Existing saved addresses commonly use "Dhaka" rather than "Dhaka City".
  if (value.trim().toLocaleLowerCase('en') === district.trim().toLocaleLowerCase('en')) {
    return canonical(`${district} City`, cities)
  }

  return ''
}

export function canonicalBdArea(district: string, city: string, value: string) {
  return canonical(value, bdAreasFor(district, city))
}

export function isValidBdLocation(district: string, city: string, area: string) {
  const canonicalCity = canonicalBdCity(district, city)
  return Boolean(canonicalCity && canonicalBdArea(district, canonicalCity, area))
}
