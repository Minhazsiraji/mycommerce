import { getTableConfig } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'

import {
  hasAttributionSignal,
  mergeAttribution,
  parseAttributionCookie,
  parseAttributionFromUrl,
  serializeAttribution,
  synthesizeFbc,
} from './attribution'
import {
  normalizeName,
  normalizePostalCode,
  normalizeRegion,
  splitRecipientName,
} from './normalization'
import { metaOrderAttributions } from './schema'

describe('ad attribution capture', () => {
  it('builds _fbc in Meta’s documented format with a millisecond timestamp', () => {
    expect(synthesizeFbc('AbC123', 1_700_000_000_000)).toBe('fb.1.1700000000000.AbC123')
    expect(synthesizeFbc('x', 1_700_000_000_000.9)).toBe('fb.1.1700000000000.x')
  })

  it('extracts fbclid, utm and generic ad identifiers, ignoring unrelated params', () => {
    const attribution = parseAttributionFromUrl(
      'https://shop.example/p/thing?fbclid=CLICK1&utm_source=facebook&utm_medium=cpc&ad_id=999&creative_id=c7&foo=bar',
    )
    expect(attribution.fbclid).toBe('CLICK1')
    expect(attribution.utm).toEqual({ utm_source: 'facebook', utm_medium: 'cpc' })
    expect(attribution.adParams).toEqual({ ad_id: '999', creative_id: 'c7' })
    expect(attribution.landingPath).toBe('/p/thing')
    expect((attribution.utm as Record<string, string>).foo).toBeUndefined()
  })

  it('never throws on a malformed URL and reports no signal for a plain visit', () => {
    expect(parseAttributionFromUrl('http://[malformed-ipv6')).toEqual({})
    expect(hasAttributionSignal(parseAttributionFromUrl('https://shop.example/about'))).toBe(false)
    expect(
      hasAttributionSignal(parseAttributionFromUrl('https://shop.example/?utm_campaign=launch')),
    ).toBe(true)
  })

  it('keeps first-touch utm while a newer click wins fbclid (last-touch)', () => {
    const first = parseAttributionFromUrl('https://s.example/?fbclid=OLD&utm_source=fb&utm_campaign=spring')
    const second = parseAttributionFromUrl('https://s.example/?fbclid=NEW&utm_source=ig')
    const merged = mergeAttribution(first, second)
    expect(merged.fbclid).toBe('NEW')
    expect(merged.utm).toEqual({ utm_source: 'ig', utm_campaign: 'spring' })
  })

  it('round-trips through the cookie and rejects junk', () => {
    const value = mergeAttribution(null, parseAttributionFromUrl('https://s.example/?fbclid=Z&utm_term=boots'))
    const parsed = parseAttributionCookie(serializeAttribution(value))
    expect(parsed?.fbclid).toBe('Z')
    expect(parsed?.utm).toEqual({ utm_term: 'boots' })
    expect(parseAttributionCookie('not json')).toBeNull()
    expect(parseAttributionCookie('x'.repeat(5000))).toBeNull()
    expect(parseAttributionCookie(JSON.stringify({ utm: 'nope', evil: 1 }))).toEqual({})
  })

  it('persists attribution columns on the order-attribution table', () => {
    const columns = getTableConfig(metaOrderAttributions).columns.map((c) => c.name)
    expect(columns).toEqual(expect.arrayContaining(['fbclid', 'utm', 'ad_params', 'fbp', 'fbc']))
  })
})

describe('Meta advanced-match normalisation for name, region and postcode', () => {
  it('lowercases and strips punctuation while keeping non-Latin letters', () => {
    expect(normalizeName('  Karim-Rahman ')).toBe('karimrahman')
    expect(normalizeName('আয়েশা')).toBe('আয়েশা')
    expect(normalizeRegion('Dhaka Division')).toBe('dhakadivision')
    expect(normalizePostalCode(' 1207 ')).toBe('1207')
  })

  it('splits a recipient into first and family name without inventing a surname', () => {
    expect(splitRecipientName('Md Karim Rahman')).toEqual({ first: 'md', last: 'karimrahman' })
    expect(splitRecipientName('Ayesha')).toEqual({ first: 'ayesha', last: undefined })
    expect(splitRecipientName('   ')).toEqual({})
  })
})
