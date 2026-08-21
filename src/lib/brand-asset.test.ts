import { describe, expect, it } from 'vitest'

import { safeBrandAssetUrl } from './brand-asset'

describe('a store may configure its own brand asset', () => {
  it('accepts an upload on the configured storage host', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/logo.png'
    expect(safeBrandAssetUrl(url)).toBe(url)
  })

  it('accepts a same-origin path', () => {
    expect(safeBrandAssetUrl('/icon.svg')).toBe('/icon.svg')
    expect(safeBrandAssetUrl('/brand/logo.png')).toBe('/brand/logo.png')
  })

  it('trims incidental whitespace', () => {
    expect(safeBrandAssetUrl('  /icon.svg  ')).toBe('/icon.svg')
  })

  it('falls back when nothing is configured', () => {
    for (const empty of [null, undefined, '', '   ']) {
      expect(safeBrandAssetUrl(empty)).toBeNull()
    }
  })
})

describe('it refuses anything that could be turned against the store', () => {
  it.each([
    ['a javascript: URL', 'javascript:alert(1)'],
    ['a data: URL', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
    ['plain http', 'http://res.cloudinary.com/demo/logo.png'],
    ['an arbitrary https host', 'https://evil.example/pixel.gif'],
    ['a lookalike host', 'https://res.cloudinary.com.evil.example/logo.png'],
    ['a protocol-relative URL', '//evil.example/logo.png'],
    ['nonsense', 'not a url at all'],
  ])('refuses %s', (_label, value) => {
    expect(safeBrandAssetUrl(value)).toBeNull()
  })

  it('refuses a host that only contains the allowed one', () => {
    // "res.cloudinary.com" appears in this string, so a substring check would
    // have passed it.
    expect(safeBrandAssetUrl('https://notres.cloudinary.com.attacker.test/x.png')).toBeNull()
  })
})
