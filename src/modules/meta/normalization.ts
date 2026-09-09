import { createHash } from 'node:crypto'

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeBdPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (/^01\d{9}$/.test(digits)) return `88${digits}`
  if (/^1\d{9}$/.test(digits)) return `880${digits}`
  return digits
}

export function normalizeCity(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function normalizeCountry(value: string) {
  const clean = value.trim().toLowerCase()
  if (clean === 'bangladesh' || clean === 'bd' || clean === 'bgd') return 'bd'
  return clean.replace(/[^a-z]/g, '')
}

/**
 * Meta's advanced-match rule for names and regions: lowercase, no whitespace,
 * no punctuation or digits. Letters from any script are kept so a non-Latin
 * name still hashes to something Meta can match, rather than to an empty string.
 */
export function normalizeName(value: string) {
  // Keep letters and their combining marks so a Bengali or Arabic name is not
  // hollowed out to a different string before hashing; drop everything else
  // (whitespace, punctuation, digits) as Meta's rule requires.
  return value.trim().toLowerCase().replace(/[^\p{L}\p{M}]/gu, '')
}

/** State / region. Same shape Meta expects as the city field. */
export function normalizeRegion(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function normalizePostalCode(value: string) {
  return value.trim().toLowerCase().replace(/\s/g, '').slice(0, 10)
}

/**
 * Splits a single recipient name into first / last for Meta's `fn` / `ln`.
 * First token is the given name; everything after it is the family name. A
 * single-token name yields a first name only — never a fabricated surname.
 */
export function splitRecipientName(recipient: string): { first?: string; last?: string } {
  const [head, ...rest] = recipient.trim().split(/\s+/).filter(Boolean)
  if (!head) return {}
  const first = normalizeName(head)
  const last = normalizeName(rest.join(''))
  return {
    first: first || undefined,
    last: last || undefined,
  }
}

export function hashUserData(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
