import { describe, expect, it } from 'vitest'

import {
  metaPurchaseStorageKey,
  parseMetaPurchasePayload,
} from './purchase-payload'

describe('Meta purchase payload', () => {
  it('parses a valid purchase payload', () => {
    const parsed = parseMetaPurchasePayload(JSON.stringify({
      eventId: 'purchase:12345678-1234-1234-1234-123456789abc',
      data: { currency: 'BDT', value: 1550 },
    }))

    expect(parsed).toEqual({
      eventId: 'purchase:12345678-1234-1234-1234-123456789abc',
      data: { currency: 'BDT', value: 1550 },
    })
  })

  it('rejects malformed or empty blocks', () => {
    expect(parseMetaPurchasePayload(null)).toBeNull()
    expect(parseMetaPurchasePayload('not-json')).toBeNull()
    expect(parseMetaPurchasePayload(JSON.stringify({ eventId: '', data: {} }))).toBeNull()
  })

  it('uses the same stable dedup namespace as the previous browser tracker', () => {
    expect(metaPurchaseStorageKey('purchase:abc')).toBe('sirajibd_meta_purchase:abc')
  })
})
