import { describe, expect, it } from 'vitest'

import {
  buildGooglePurchasePayload,
  googlePurchaseStorageKey,
  isGooglePurchaseEligible,
  parseGooglePurchasePayload,
  type PurchaseEligibleOrder,
} from './purchase-event'

/**
 * These mirror rows that actually exist in the store's database, not invented
 * shapes — including the cancelled-but-refunded SSLCommerz order, which is the
 * case a naive "is it paid?" check gets wrong.
 */
function order(overrides: Partial<PurchaseEligibleOrder> = {}): PurchaseEligibleOrder {
  return {
    orderNumber: 'MC-XRI0TE-B13F8039BC55',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'sslcommerz',
    total: 136000,
    shippingCost: 6000,
    currency: 'BDT',
    items: [
      {
        sku: 'SBD-ELE-005',
        variantId: '01a00ec1-b734-747a-a0c8-a5f1a911c3d1',
        productTitle: '20W Fast Charger',
        variantTitle: null,
        unitPrice: 65000,
        quantity: 2,
      },
    ],
    ...overrides,
  }
}

const enabled = { enabled: true }

describe('purchase eligibility', () => {
  it('accepts a paid, confirmed SSLCommerz order', () => {
    expect(isGooglePurchaseEligible(order())).toBe(true)
    expect(buildGooglePurchasePayload(order(), enabled)).not.toBeNull()
  })

  it('refuses a COD order at creation', () => {
    const cod = order({ paymentMethod: 'cod', paymentStatus: 'cod_pending' })
    expect(isGooglePurchaseEligible(cod)).toBe(false)
    expect(buildGooglePurchasePayload(cod, enabled)).toBeNull()
  })

  it('refuses a COD order even once the courier has collected the cash', () => {
    // markCodCollected sets paymentStatus to 'paid' on delivery. Without the
    // method check this would silently start reporting COD as online revenue.
    const collected = order({ paymentMethod: 'cod', paymentStatus: 'paid' })
    expect(isGooglePurchaseEligible(collected)).toBe(false)
  })

  it.each([
    ['unpaid', 'unpaid'],
    ['failed', 'failed'],
    ['awaiting transfer', 'awaiting_transfer'],
    ['awaiting verification', 'awaiting_verification'],
    ['refunded', 'refunded'],
  ])('refuses an order that is %s', (_label, paymentStatus) => {
    expect(isGooglePurchaseEligible(order({ paymentStatus }))).toBe(false)
  })

  it('refuses a cancelled order whose payment arrived late', () => {
    // This row exists in production: status=cancelled, paymentStatus=refunded.
    // Its stock was released; counting it as revenue would overstate sales.
    expect(isGooglePurchaseEligible(order({ status: 'cancelled', paymentStatus: 'paid' }))).toBe(
      false,
    )
    expect(isGooglePurchaseEligible(order({ status: 'cancelled', paymentStatus: 'refunded' }))).toBe(
      false,
    )
  })

  it('refuses everything when the integration is switched off', () => {
    expect(buildGooglePurchasePayload(order(), { enabled: false })).toBeNull()
  })
})

describe('purchase payload', () => {
  it('carries the order number as the transaction id', () => {
    expect(buildGooglePurchasePayload(order(), enabled)?.transaction_id).toBe(
      'MC-XRI0TE-B13F8039BC55',
    )
  })

  it('reports the final paid total and shipping in major units, exactly', () => {
    const payload = buildGooglePurchasePayload(order(), enabled)!

    // 136000 poisha is BDT 1360.00 — not 1359.9999999999998.
    expect(payload.value).toBe(1360)
    expect(payload.shipping).toBe(60)
    expect(Number.isInteger(payload.value * 100)).toBe(true)
  })

  it('keeps a fractional amount exact rather than drifting', () => {
    const payload = buildGooglePurchasePayload(order({ total: 199950 }), enabled)!
    expect(payload.value).toBe(1999.5)
  })

  it('reports BDT', () => {
    expect(buildGooglePurchasePayload(order(), enabled)?.currency).toBe('BDT')
  })

  it('maps items with id, name, unit price and quantity', () => {
    const payload = buildGooglePurchasePayload(order(), enabled)!

    expect(payload.items).toEqual([
      {
        item_id: '01a00ec1-b734-747a-a0c8-a5f1a911c3d1',
        item_name: '20W Fast Charger',
        price: 650,
        quantity: 2,
      },
    ])
  })

  it('includes the variant name when the line has one', () => {
    const payload = buildGooglePurchasePayload(
      order({
        items: [
          {
            sku: 'AGR-40',
            variantId: '019fcb4d-2b8a-7085-844b-acf0ef73e672',
            productTitle: 'Aero Glide Runner',
            variantTitle: 'EU 40',
            unitPrice: 645000,
            quantity: 1,
          },
        ],
      }),
      enabled,
    )!

    expect(payload.items[0]).toMatchObject({ item_variant: 'EU 40', price: 6450, quantity: 1 })
  })

  it('falls back to the SKU when a variant has since been deleted', () => {
    const payload = buildGooglePurchasePayload(
      order({ items: [{ ...order().items[0]!, variantId: null }] }),
      enabled,
    )!

    expect(payload.items[0]!.item_id).toBe('SBD-ELE-005')
  })

  it('the item total plus shipping reconciles with the reported value', () => {
    const payload = buildGooglePurchasePayload(order(), enabled)!
    const itemsTotal = payload.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    expect(itemsTotal + payload.shipping).toBe(payload.value)
  })
})

describe('deduplication', () => {
  it('derives one stable key per order number', () => {
    expect(googlePurchaseStorageKey('MC-ABC')).toBe('commerce_google_purchase_MC-ABC')
    expect(googlePurchaseStorageKey('MC-ABC')).toBe(googlePurchaseStorageKey('MC-ABC'))
  })

  it('gives different orders different keys', () => {
    expect(googlePurchaseStorageKey('MC-ABC')).not.toBe(googlePurchaseStorageKey('MC-XYZ'))
  })

  it('keys the same order identically across separate page loads', () => {
    // A reload rebuilds the payload from scratch; the key must still collide so
    // the second load suppresses the event.
    const first = buildGooglePurchasePayload(order(), enabled)!
    const second = buildGooglePurchasePayload(order(), enabled)!

    expect(googlePurchaseStorageKey(first.transaction_id)).toBe(
      googlePurchaseStorageKey(second.transaction_id),
    )
  })
})

describe('payload parsing', () => {
  it('round-trips a built payload', () => {
    const built = buildGooglePurchasePayload(order(), enabled)!
    expect(parseGooglePurchasePayload(JSON.stringify(built))).toEqual(built)
  })

  it.each([
    ['nothing', null],
    ['an empty string', ''],
    ['malformed JSON', '{'],
    ['an unrelated object', '{"foo":1}'],
    ['a payload with no transaction id', '{"value":1,"currency":"BDT","shipping":0,"items":[]}'],
    [
      'a payload whose value is a string',
      '{"transaction_id":"MC-1","value":"1360","currency":"BDT","shipping":0,"items":[]}',
    ],
  ])('returns null for %s rather than throwing', (_label, raw) => {
    expect(parseGooglePurchasePayload(raw)).toBeNull()
  })
})
