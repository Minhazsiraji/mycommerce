import { describe, expect, it } from 'vitest'

import { signOrderAccess, verifyOrderAccess } from './order-access-cookie'

const SECRET = 'test-secret-that-is-long-enough-for-an-hmac'

describe('guest order access cookie', () => {
  it('round-trips a signed order list', () => {
    const value = signOrderAccess(['MC-ABC123-001122334455'], SECRET)
    expect(verifyOrderAccess(value, SECRET)).toEqual(['MC-ABC123-001122334455'])
  })

  it('rejects the old unsigned format', () => {
    expect(verifyOrderAccess('MC-ABC123-001122', SECRET)).toEqual([])
  })

  it('rejects payload tampering and a different secret', () => {
    const value = signOrderAccess(['MC-ABC123-001122334455'], SECRET)
    const [, payload, mac] = value.split('.')
    const changedPayload = Buffer.from(JSON.stringify(['MC-ABC123-AABBCCDDEEFF'])).toString(
      'base64url',
    )

    expect(verifyOrderAccess(`v1.${changedPayload}.${mac}`, SECRET)).toEqual([])
    expect(verifyOrderAccess(`v1.${payload}.${mac}`, `${SECRET}-different`)).toEqual([])
  })

  it('deduplicates and caps the signed list', () => {
    const orders = Array.from({ length: 12 }, (_, i) => `MC-ABC123-${String(i).padStart(12, '0')}`)
    const value = signOrderAccess([orders[0]!, orders[0]!, ...orders], SECRET)

    expect(verifyOrderAccess(value, SECRET)).toEqual(orders.slice(0, 10))
  })

  it('enforces the access lifetime on the server', () => {
    const now = Date.UTC(2026, 7, 16)
    const value = signOrderAccess(['MC-ABC123-001122334455'], SECRET, now)

    expect(verifyOrderAccess(value, SECRET, now + 7 * 24 * 60 * 60_000 - 1)).toHaveLength(1)
    expect(verifyOrderAccess(value, SECRET, now + 7 * 24 * 60 * 60_000)).toEqual([])
  })
})
