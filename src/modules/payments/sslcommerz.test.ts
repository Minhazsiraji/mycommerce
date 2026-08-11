import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: {
    SSLCOMMERZ_STORE_ID: 'test-store',
    SSLCOMMERZ_STORE_PASSWORD: 'test-password',
    SSLCOMMERZ_SANDBOX: true,
  },
}))

import { createSession } from './sslcommerz'

const input = {
  orderNumber: 'MC-TEST-1',
  amount: 125_00,
  customer: { name: 'Test Customer', email: 'test@example.com', phone: '+8801712345678' },
  address: {
    recipient: 'Test Customer',
    phone: '+8801712345678',
    line1: 'House 1',
    city: 'Savar',
    district: 'Dhaka',
    upazila: 'Ashulia',
    postalCode: ' 1340 ',
    country: 'BD',
  },
  baseUrl: 'https://preview.example.com',
}

describe('SSLCommerz session', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('maps the normalized postcode to customer and shipping fields', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'SUCCESS', GatewayPageURL: 'https://gateway.test' }), {
        status: 200,
      }),
    )

    await createSession(input)

    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('cus_postcode')).toBe('1340')
    expect(body.get('ship_postcode')).toBe('1340')
    expect(body.get('success_url')).toBe(
      'https://preview.example.com/api/webhooks/sslcommerz/return?status=success&order=MC-TEST-1',
    )
  })

  it('uses a gateway-only fallback when the optional postcode is blank', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ status: 'SUCCESS', GatewayPageURL: 'https://gateway.test' }), {
        status: 200,
      }),
    )

    await createSession({ ...input, address: { ...input.address, postalCode: '' } })

    const body = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('cus_postcode')).toBe('1000')
    expect(body.get('ship_postcode')).toBe('1000')
  })

  it('does not call SSLCommerz when a supplied postcode is malformed', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    await expect(
      createSession({ ...input, address: { ...input.address, postalCode: '134' } }),
    ).rejects.toThrow('four digits')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
