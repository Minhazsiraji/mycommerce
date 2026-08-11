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
  })

  it('does not call SSLCommerz when the postcode is missing', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')

    await expect(
      createSession({ ...input, address: { ...input.address, postalCode: '' } }),
    ).rejects.toThrow('valid 4-digit postcode')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
