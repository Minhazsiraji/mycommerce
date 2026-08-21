import { describe, expect, it } from 'vitest'

import { purchaseEventId } from './event-id'
import { buildMetaPurchaseData, isSendableMetaPurchaseData } from './purchase-data'
import { metaPurchaseStorageKey, parseMetaPurchasePayload } from './purchase-payload'

/**
 * Mirrors a real paid order: MC-XRI0TE-B13F8039BC55, two units at 65000 poisha
 * plus 6000 delivery, total 136000 poisha.
 */
const order = {
  total: 136000,
  items: [
    {
      sku: 'SBD-ELE-005',
      variantId: '01a00ec1-b734-747a-a0c8-a5f1a911c3d1',
      unitPrice: 65000,
      quantity: 2,
    },
  ],
}

describe('Meta Purchase custom data', () => {
  it('reports currency BDT', () => {
    expect(buildMetaPurchaseData(order).currency).toBe('BDT')
  })

  it('sends currency as a three-letter uppercase string, not a symbol or name', () => {
    const { currency } = buildMetaPurchaseData(order)

    expect(typeof currency).toBe('string')
    expect(currency).toMatch(/^[A-Z]{3}$/)
    expect(currency).not.toBe('৳')
  })

  it('sends value as a number in major units, not minor units or a string', () => {
    const { value } = buildMetaPurchaseData(order)

    expect(typeof value).toBe('number')
    expect(value).toBe(1360)
    expect(value).not.toBe(136000)
  })

  it('keeps a fractional total exact rather than drifting', () => {
    expect(buildMetaPurchaseData({ ...order, total: 199950 }).value).toBe(1999.5)
  })

  it('sends contents item_price as numeric major units', () => {
    const { contents } = buildMetaPurchaseData(order)

    expect(contents).toEqual([
      { id: '01a00ec1-b734-747a-a0c8-a5f1a911c3d1', quantity: 2, item_price: 650 },
    ])
    expect(typeof contents![0]!.item_price).toBe('number')
    expect(typeof contents![0]!.quantity).toBe('number')
  })

  it('counts num_items across quantities, not lines', () => {
    const twoLines = {
      total: 300000,
      items: [
        { sku: 'A', variantId: 'va', unitPrice: 100000, quantity: 2 },
        { sku: 'B', variantId: null, unitPrice: 50000, quantity: 1 },
      ],
    }
    expect(buildMetaPurchaseData(twoLines).num_items).toBe(3)
  })

  it('falls back to the SKU when a variant has been deleted', () => {
    const data = buildMetaPurchaseData({
      total: 50000,
      items: [{ sku: 'ONLY-SKU', variantId: null, unitPrice: 50000, quantity: 1 }],
    })

    expect(data.content_ids).toEqual(['ONLY-SKU'])
    expect(data.contents![0]!.id).toBe('ONLY-SKU')
  })

  it('carries exactly the fields Meta expects for Purchase', () => {
    expect(Object.keys(buildMetaPurchaseData(order)).sort()).toEqual([
      'content_ids',
      'content_type',
      'contents',
      'currency',
      'num_items',
      'value',
    ])
  })

  it('survives a JSON round trip unchanged, as the inert DOM block requires', () => {
    const data = buildMetaPurchaseData(order)
    expect(JSON.parse(JSON.stringify(data))).toEqual(data)
  })
})

describe('Pixel and CAPI agree', () => {
  it('builds byte-identical custom data for both transports', () => {
    // page.tsx (Pixel block) and service.ts (CAPI) both call this one builder,
    // so the two cannot describe the same sale differently.
    const pixel = buildMetaPurchaseData(order)
    const capi = buildMetaPurchaseData({ total: order.total, items: order.items })

    expect(JSON.stringify(pixel)).toBe(JSON.stringify(capi))
  })

  it('shares one stable event ID for deduplication', () => {
    const orderId = '01a011af-33a4-7ac4-80e7-770979412b76'

    // Observed in production: the CAPI delivery row and the browser block both
    // carry purchase:01a011af-33a4-7ac4-80e7-770979412b76.
    expect(purchaseEventId(orderId)).toBe(`purchase:${orderId}`)
    expect(purchaseEventId(orderId)).toBe(purchaseEventId(orderId))
  })

  it('derives the browser dedup key from that same event ID', () => {
    const eventId = purchaseEventId('01a011af-33a4-7ac4-80e7-770979412b76')
    expect(metaPurchaseStorageKey(eventId)).toBe(`commerce_meta_${eventId}`)
  })
})

describe('refusing to send a Purchase Meta would reject', () => {
  it('accepts the real payload', () => {
    expect(isSendableMetaPurchaseData(buildMetaPurchaseData(order))).toBe(true)
  })

  it.each([
    ['currency missing', { value: 1360 }],
    ['currency empty', { currency: '', value: 1360 }],
    ['currency lowercase', { currency: 'bdt', value: 1360 }],
    ['currency a symbol', { currency: '৳', value: 1360 }],
    ['currency a name', { currency: 'Taka', value: 1360 }],
    ['currency sent as a number', { currency: 50, value: 1360 }],
    ['value missing', { currency: 'BDT' }],
    ['value as a string', { currency: 'BDT', value: '1360' }],
    ['value NaN', { currency: 'BDT', value: Number.NaN }],
    ['value negative', { currency: 'BDT', value: -1 }],
    ['item_price as a string', {
      currency: 'BDT',
      value: 1360,
      contents: [{ id: 'x', quantity: 2, item_price: '650' }],
    }],
  ])('refuses when %s', (_label, data) => {
    expect(isSendableMetaPurchaseData(data)).toBe(false)
  })

  it('never edits currency to silence a warning — it only accepts or refuses', () => {
    const data = buildMetaPurchaseData(order)
    const before = JSON.stringify(data)

    isSendableMetaPurchaseData(data)

    expect(JSON.stringify(data)).toBe(before)
    expect(data.currency).toBe('BDT')
  })
})

describe('the inert block the browser reads', () => {
  const eventId = purchaseEventId('01a011af-33a4-7ac4-80e7-770979412b76')

  it('round-trips a real payload', () => {
    const raw = JSON.stringify({ eventId, data: buildMetaPurchaseData(order) })
    const parsed = parseMetaPurchasePayload(raw)

    expect(parsed?.eventId).toBe(eventId)
    expect(parsed?.data.currency).toBe('BDT')
    expect(parsed?.data.value).toBe(1360)
  })

  it('refuses a block whose data lost its currency', () => {
    // A truncated or malformed block previously still reached fbq, producing
    // "Parameter 'currency' is invalid for event 'Purchase'" and no conversion.
    const raw = JSON.stringify({ eventId, data: { value: 1360 } })
    expect(parseMetaPurchasePayload(raw)).toBeNull()
  })

  it.each([
    ['nothing', null],
    ['an empty string', ''],
    ['malformed JSON', '{'],
    ['an empty data object', JSON.stringify({ eventId, data: {} })],
    ['a missing event id', JSON.stringify({ data: { currency: 'BDT', value: 1 } })],
  ])('returns null for %s rather than throwing', (_label, raw) => {
    expect(parseMetaPurchasePayload(raw)).toBeNull()
  })
})
