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

export function hashUserData(value: string) {
  return createHash('sha256').update(value).digest('hex')
}
