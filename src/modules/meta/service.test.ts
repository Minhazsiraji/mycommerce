import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ consent: 'granted_v1' as string | undefined }))

vi.mock('server-only', () => ({}))
vi.mock('next/server', () => ({ after: vi.fn() }))
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      if (name === 'sirajibd_analytics_consent' && state.consent) return { value: state.consent }
      if (name === '_fbp') return { value: 'fb.1.123456789.987654321' }
      return undefined
    },
  }),
  headers: async () => ({
    get: (name: string) => {
      if (name === 'user-agent') return 'Vitest browser'
      if (name === 'x-forwarded-for') return '203.0.113.5'
      if (name === 'referer') return 'https://shop.example/p/shoe-spray'
      return null
    },
  }),
}))
vi.mock('@/lib/env', () => ({
  clientEnv: { NEXT_PUBLIC_APP_URL: 'https://shop.example' },
  env: { META_GRAPH_API_VERSION: 'v25.0' },
}))
vi.mock('./integration-config', () => ({
  getEffectiveMetaConfig: async () => ({
    enabled: true,
    source: 'env',
    datasetId: '1234567890',
    accessToken: 'server-only-test-token-with-safe-length',
    testEventCode: 'TEST123',
  }),
}))
vi.mock('./repository', () => ({
  deleteAttributionForUser: vi.fn(),
  recordMetaSuccessfulEvent: vi.fn().mockResolvedValue(undefined),
}))

import { trackAddToCart } from './service'

describe('Meta delivery failure isolation', () => {
  beforeEach(() => {
    state.consent = 'granted_v1'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does not throw when Meta is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network offline')))

    await expect(
      trackAddToCart({
        eventId: 'addtocart:3f99ce0d-c696-43f4-84ff-c6cae1539876',
        variant: { id: '01989be2-5ef1-7ad0-a826-6aa6cc777111', price: 45000, productTitle: 'Shoe spray' },
        quantity: 1,
      }),
    ).resolves.toBeUndefined()
  })

  it('does not call Meta without explicit analytics consent', async () => {
    state.consent = 'denied_v1'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    await trackAddToCart({
      eventId: 'addtocart:3f99ce0d-c696-43f4-84ff-c6cae1539876',
      variant: { id: '01989be2-5ef1-7ad0-a826-6aa6cc777111', price: 45000, productTitle: 'Shoe spray' },
      quantity: 1,
    })

    expect(fetchMock).not.toHaveBeenCalled()
  })
})
