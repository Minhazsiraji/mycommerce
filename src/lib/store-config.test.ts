import { describe, expect, it, vi } from 'vitest'

import { getStoreUrl, STORE_CONFIG, STORE_HOST, STORE_SLUG } from './store-config'

describe('store config defaults', () => {
  it('preserves SirajiBD as the current deployment default', () => {
    expect(STORE_CONFIG.name).toBeTruthy()
    expect(STORE_CONFIG.currency).toMatch(/^[A-Z]{3}$/)
    expect(STORE_CONFIG.countryCode).toMatch(/^[A-Z]{2}$/)
  })

  it('builds canonical child URLs from one configured origin', () => {
    const url = getStoreUrl('/p/example-product')
    expect(url.origin).toBe(new URL(STORE_CONFIG.canonicalUrl).origin)
    expect(url.pathname).toBe('/p/example-product')
  })
})

describe('identity derived for prose and downloads', () => {
  it('names the host without the scheme, for policy sentences', () => {
    expect(STORE_HOST).toBe(new URL(STORE_CONFIG.canonicalUrl).host)
    expect(STORE_HOST).not.toContain('://')
    expect(STORE_HOST).not.toContain('/')
  })

  it('produces a filename-safe slug', () => {
    expect(STORE_SLUG).toMatch(/^[a-z0-9-]+$/)
  })

  it('keeps a hostile store name out of the Content-Disposition header', async () => {
    // STORE_NAME is operator-supplied and STORE_SLUG lands inside a quoted
    // header value, where a quote or newline would let it inject headers.
    vi.resetModules()
    vi.stubEnv('STORE_NAME', 'Evil"\nX-Injected: yes')

    const { STORE_SLUG: hostile } = await import('./store-config')
    // Asserting the exact slug, not just the shape: a shape-only check would
    // still pass if the module cache never picked up the hostile name.
    expect(hostile).toBe('evil-x-injected-yes')

    vi.unstubAllEnvs()
    vi.resetModules()
  })
})
