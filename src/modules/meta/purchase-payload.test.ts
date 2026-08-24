import { describe, expect, it } from 'vitest'

import {
  legacyMetaPurchaseStorageKey,
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

  it('uses a store-neutral dedup namespace', () => {
    expect(metaPurchaseStorageKey('purchase:abc')).toBe('commerce_meta_purchase:abc')
    expect(metaPurchaseStorageKey('purchase:abc')).not.toMatch(/sirajibd/i)
  })

  it('can still recognise a key written before the rename', () => {
    // An order page left open across the deploy must not fire a second
    // Purchase for a sale the browser already reported.
    expect(legacyMetaPurchaseStorageKey('purchase:abc')).toBe('sirajibd_meta_purchase:abc')
    expect(legacyMetaPurchaseStorageKey('purchase:abc')).not.toBe(
      metaPurchaseStorageKey('purchase:abc'),
    )
  })
})
