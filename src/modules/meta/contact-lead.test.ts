import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { contactEventSchema, leadEventSchema } from './validators'

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
      if (name === 'referer') return 'https://shop.example/contact'
      return null
    },
  }),
}))
vi.mock('@/lib/env', () => ({
  clientEnv: { NEXT_PUBLIC_APP_URL: 'https://shop.example' },
  env: { META_GRAPH_API_VERSION: 'v25.0' },
}))
vi.mock('@/lib/money', () => ({ CURRENCY: 'BDT', toDecimalString: (n: number) => String(n / 100) }))
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

import { trackContact, trackLead } from './service'

function okFetch() {
  return vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
}

function lastEvent(fetchMock: ReturnType<typeof vi.fn>) {
  const call = fetchMock.mock.calls[0]
  if (!call) throw new Error('fetch was not called')
  const body = JSON.parse((call[1] as { body: string }).body)
  return body.data[0]
}

describe('Contact / Lead validators', () => {
  it('accepts only known contact channels and replay-safe event ids', () => {
    expect(
      contactEventSchema.safeParse({
        eventId: 'contact:3f99ce0d-c696-43f4-84ff-c6cae1539876',
        method: 'whatsapp',
      }).success,
    ).toBe(true)
    expect(
      contactEventSchema.safeParse({ eventId: 'contact:3f99ce0d-c696-43f4-84ff-c6cae1539876', method: 'fax' })
        .success,
    ).toBe(false)
    expect(contactEventSchema.safeParse({ eventId: 'shared-id', method: 'email' }).success).toBe(false)
  })

  it('rejects a negative or unbounded Lead value and a non-ISO currency', () => {
    expect(
      leadEventSchema.safeParse({ eventId: 'lead:3f99ce0d-c696-43f4-84ff-c6cae1539876', value: -1 }).success,
    ).toBe(false)
    expect(
      leadEventSchema.safeParse({
        eventId: 'lead:3f99ce0d-c696-43f4-84ff-c6cae1539876',
        value: 10,
        currency: 'bdt',
      }).success,
    ).toBe(false)
    expect(
      leadEventSchema.safeParse({ eventId: 'lead:3f99ce0d-c696-43f4-84ff-c6cae1539876' }).success,
    ).toBe(true)
  })
})

describe('Contact / Lead CAPI delivery', () => {
  beforeEach(() => {
    state.consent = 'granted_v1'
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('sends a Contact event under the caller-supplied id so browser and server deduplicate', async () => {
    const fetchMock = okFetch()
    vi.stubGlobal('fetch', fetchMock)

    await trackContact('contact:3f99ce0d-c696-43f4-84ff-c6cae1539876', 'whatsapp')

    expect(fetchMock).toHaveBeenCalledOnce()
    const event = lastEvent(fetchMock)
    expect(event.event_name).toBe('Contact')
    expect(event.event_id).toBe('contact:3f99ce0d-c696-43f4-84ff-c6cae1539876')
    expect(event.action_source).toBe('website')
    expect(event.custom_data.content_name).toBe('whatsapp')
    expect(event.user_data.client_user_agent).toBe('Vitest browser')
  })

  it('does not deliver Contact without analytics consent', async () => {
    state.consent = 'denied_v1'
    const fetchMock = okFetch()
    vi.stubGlobal('fetch', fetchMock)

    await trackContact('contact:3f99ce0d-c696-43f4-84ff-c6cae1539876', 'email')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('carries a Lead value only when a valid amount and currency travel together', async () => {
    const withPair = okFetch()
    vi.stubGlobal('fetch', withPair)
    await trackLead('lead:3f99ce0d-c696-43f4-84ff-c6cae1539876', { value: 500, currency: 'BDT' })
    expect(lastEvent(withPair).custom_data).toMatchObject({ value: 500, currency: 'BDT' })

    vi.unstubAllGlobals()

    const noCurrency = okFetch()
    vi.stubGlobal('fetch', noCurrency)
    await trackLead('lead:3f99ce0d-c696-43f4-84ff-c6cae1539876', { value: 500 })
    expect(lastEvent(noCurrency).custom_data.value).toBeUndefined()
  })

  it('never throws when Meta delivery fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network offline')))

    await expect(
      trackContact('contact:3f99ce0d-c696-43f4-84ff-c6cae1539876', 'messenger'),
    ).resolves.toBeUndefined()
    await expect(
      trackLead('lead:3f99ce0d-c696-43f4-84ff-c6cae1539876', {}),
    ).resolves.toBeUndefined()
  })
})
