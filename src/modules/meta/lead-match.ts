import {
  hashUserData,
  normalizeBdPhone,
  normalizeCity,
  normalizeCountry,
  normalizeEmail,
  normalizePostalCode,
  normalizeRegion,
  splitRecipientName,
} from './normalization'

/** Only call after verifying opt-in consent and persisted order attribution. */
export function buildConsentedCodLeadMatch(input: {
  recipient: string
  email: string | null
  phone: string | null
  city: string
  district: string
  country: string
  postalCode: string | null
  userId: string | null
  clientIpAddress: string | null
  clientUserAgent: string
  fbp: string | null
  fbc: string | null
}): Record<string, string | string[] | undefined> {
  const { first, last } = splitRecipientName(input.recipient)
  const email = input.email ? normalizeEmail(input.email) : ''
  const phone = input.phone ? normalizeBdPhone(input.phone) : ''
  const city = normalizeCity(input.city)
  const region = normalizeRegion(input.district)
  const postal = input.postalCode ? normalizePostalCode(input.postalCode) : ''
  const country = normalizeCountry(input.country)

  const hashed = (value: string) => value ? [hashUserData(value)] : undefined
  return {
    em: hashed(email),
    ph: hashed(phone),
    fn: hashed(first ?? ''),
    ln: hashed(last ?? ''),
    ct: hashed(city),
    st: hashed(region),
    zp: hashed(postal),
    country: hashed(country),
    external_id: hashed(input.userId ?? ''),
    client_ip_address: input.clientIpAddress ?? undefined,
    client_user_agent: input.clientUserAgent,
    fbp: input.fbp ?? undefined,
    fbc: input.fbc ?? undefined,
  }
}
