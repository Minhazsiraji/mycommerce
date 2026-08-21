import { afterEach, describe, expect, it, vi } from 'vitest'

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

describe('a production deployment must configure its own identity', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it.each(['STORE_NAME', 'STORE_CANONICAL_URL'])('refuses to boot without %s', async (missing) => {
    vi.resetModules()
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('STORE_NAME', missing === 'STORE_NAME' ? '' : 'Client Store')
    vi.stubEnv('STORE_CANONICAL_URL', missing === 'STORE_CANONICAL_URL' ? '' : 'https://client.example')

    await expect(import('./store-config')).rejects.toThrow(missing)
  })

  it('boots when both are configured', async () => {
    vi.resetModules()
    vi.stubEnv('VERCEL_ENV', 'production')
    vi.stubEnv('STORE_NAME', 'Client Store')
    vi.stubEnv('STORE_CANONICAL_URL', 'https://client.example')

    const { STORE_CONFIG: configured } = await import('./store-config')
    expect(configured.name).toBe('Client Store')
    expect(configured.canonicalUrl).toBe('https://client.example')
  })

  it('falls back quietly outside production, so local work needs no setup', async () => {
    vi.resetModules()
    vi.stubEnv('VERCEL_ENV', '')
    vi.stubEnv('STORE_NAME', '')

    const { STORE_CONFIG: local } = await import('./store-config')
    expect(local.name).toBe('Commerce')
    expect(local.name).not.toMatch(/sirajibd/i)
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
