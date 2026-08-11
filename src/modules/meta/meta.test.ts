import { getTableConfig } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'

import { metaEventDeliveries } from './schema'
import {
  META_CONSENT_DENIED,
  META_CONSENT_GRANTED,
  parseMetaConsent,
} from './consent'
import { purchaseEventId } from './event-id'
import { hashUserData, normalizeBdPhone, normalizeEmail } from './normalization'
import { minorToMetaValue } from './value'
import { metaEventIdSchema } from './validators'

describe('Meta commerce event safety', () => {
  it('uses a stable Purchase event id for browser/server deduplication', () => {
    const orderId = '01989be2-5ef1-7ad0-a826-6aa6cc777111'
    expect(purchaseEventId(orderId)).toBe(`purchase:${orderId}`)
    expect(purchaseEventId(orderId)).toBe(purchaseEventId(orderId))
  })

  it('enforces a unique database event id for replay protection', () => {
    const config = getTableConfig(metaEventDeliveries)
    const eventIndex = config.indexes.find((index) => index.config.name === 'meta_event_deliveries_event_idx')
    expect(eventIndex?.config.unique).toBe(true)
  })

  it('converts integer poisha only at the provider boundary', () => {
    expect(minorToMetaValue(199900)).toBe(1999)
    expect(minorToMetaValue(45050)).toBe(450.5)
  })

  it('normalizes and hashes customer match data deterministically', () => {
    expect(normalizeEmail('  Buyer@Example.COM ')).toBe('buyer@example.com')
    expect(normalizeBdPhone('01712-345678')).toBe('8801712345678')
    expect(normalizeBdPhone('+880 1712 345678')).toBe('8801712345678')
    expect(hashUserData('buyer@example.com')).toMatch(/^[a-f0-9]{64}$/)
    expect(hashUserData('buyer@example.com')).toBe(hashUserData('buyer@example.com'))
  })

  it('defaults to no consent and recognises only explicit versioned choices', () => {
    expect(parseMetaConsent(undefined)).toBe('unset')
    expect(parseMetaConsent('granted')).toBe('unset')
    expect(parseMetaConsent(META_CONSENT_GRANTED)).toBe('granted')
    expect(parseMetaConsent(META_CONSENT_DENIED)).toBe('denied')
  })

  it('rejects arbitrary or replay-unfriendly browser event ids', () => {
    expect(metaEventIdSchema.safeParse('addtocart:3f99ce0d-c696-43f4-84ff-c6cae1539876').success).toBe(true)
    expect(metaEventIdSchema.safeParse('same-id-for-everyone').success).toBe(false)
    expect(metaEventIdSchema.safeParse('purchase:../../../token').success).toBe(false)
  })
})
