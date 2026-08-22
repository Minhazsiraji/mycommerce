import { describe, expect, it, vi } from 'vitest'

import { getSiteUrl, isIndexableEnvironment } from './site-metadata'
import { STORE_CONFIG } from './store-config'

describe('site metadata environment policy', () => {
  it('allows indexing only on Vercel production', () => {
    expect(isIndexableEnvironment('production')).toBe(true)
    expect(isIndexableEnvironment('preview')).toBe(false)
    expect(isIndexableEnvironment('development')).toBe(false)
    expect(isIndexableEnvironment(undefined)).toBe(false)
  })

  it('takes its canonical origin from configuration', () => {
    expect(getSiteUrl().href).toBe(`${STORE_CONFIG.canonicalUrl}/`)
  })

  it('follows a deployment that configures a different origin', async () => {
    // This used to assert https://sirajibd.com/ outright, which encoded one
    // business as the software's identity. Every canonical tag, sitemap entry
    // and Merchant feed URL follows this value, so it has to track the config.
    vi.resetModules()
    vi.stubEnv('STORE_CANONICAL_URL', 'https://client.example')

    const { getSiteUrl: configured } = await import('./site-metadata')
    expect(configured().href).toBe('https://client.example/')

    vi.unstubAllEnvs()
    vi.resetModules()
  })
})

