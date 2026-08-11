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

export function hashUserData(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
