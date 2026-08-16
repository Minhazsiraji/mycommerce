type DistrictRate = { districts: string[] }

const matchesDistrict = (rate: DistrictRate, district: string) =>
  rate.districts.some((name) => name.toLowerCase() === district.trim().toLowerCase())

/** A catch-all means everywhere else, never an alternative to a specific rate. */
export function ratesForDistrict<T extends DistrictRate>(rates: T[], district: string | null): T[] {
  if (!district) return []

  const specific = rates.filter(
    (rate) => rate.districts.length > 0 && matchesDistrict(rate, district),
  )

  return specific.length ? specific : rates.filter((rate) => rate.districts.length === 0)
}
