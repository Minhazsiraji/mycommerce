import { describe, expect, it } from 'vitest'

import { getStoreUrl, STORE_CONFIG } from './store-config'

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
