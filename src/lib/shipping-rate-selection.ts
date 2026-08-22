type DistrictRate = { districts: string[] }

const matchesDistrict = (rate: DistrictRate, district: string) =>
  rate.districts.some((name) => name.toLowerCase() === district.trim().toLowerCase())

/**
 * A catch-all means everywhere else, never an alternative to a specific rate.
 *
 * `regionRequired` defaults to true, which is the Bangladeshi model: a district
 * is mandatory, so having none yet means "not enough information", and checkout
 * says so rather than offering a rate it may have to withdraw. Where the region
 * is optional — most countries — no region means the catch-all applies, because
 * otherwise a store whose customers have no state or province could never see a
 * delivery option at all.
 */
export function ratesForDistrict<T extends DistrictRate>(
  rates: T[],
  district: string | null,
  { regionRequired = true }: { regionRequired?: boolean } = {},
): T[] {
  if (!district) return regionRequired ? [] : rates.filter((rate) => rate.districts.length === 0)

  const specific = rates.filter(
    (rate) => rate.districts.length > 0 && matchesDistrict(rate, district),
  )

  return specific.length ? specific : rates.filter((rate) => rate.districts.length === 0)
}
