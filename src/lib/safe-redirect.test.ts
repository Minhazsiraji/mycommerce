import { describe, expect, it } from 'vitest'

import { safeRedirect } from './safe-redirect'

describe('safeRedirect', () => {
  it('keeps an ordinary same-origin path', () => {
    expect(safeRedirect('/account/orders')).toBe('/account/orders')
  })

  it('falls back when the value is missing or empty', () => {
    expect(safeRedirect(undefined, '/account')).toBe('/account')
    expect(safeRedirect('', '/account')).toBe('/account')
  })

  it('rejects absolute URLs', () => {
    expect(safeRedirect('https://evil.example', '/account')).toBe('/account')
  })

  it('rejects protocol-relative URLs', () => {
    // The case a startsWith('/') check lets through.
    expect(safeRedirect('//evil.example', '/account')).toBe('/account')
  })

  it('rejects backslash-prefixed paths browsers may normalise', () => {
    expect(safeRedirect('/\\evil.example', '/account')).toBe('/account')
  })
})
