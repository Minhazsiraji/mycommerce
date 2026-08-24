import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  configuredGatewayIds,
  isOnlineGateway,
  providerFor,
  registerPaymentProvider,
  resetPaymentProviders,
  type PaymentProvider,
} from './provider'

/**
 * Adapter portability.
 *
 * `payments/service.ts` used to import SSLCommerz's functions directly and
 * branch on `paymentMethod === 'sslcommerz'`, so adding a second gateway meant
 * editing the order and payment core. These tests register a gateway that does
 * not exist anywhere in the source and assert the generic machinery treats it
 * exactly like the real one — which is the only honest way to claim that adding
 * Stripe is adapter-level work.
 */
function fakeGateway(overrides: Partial<PaymentProvider> = {}): PaymentProvider {
  return {
    id: 'testpay',
    isConfigured: () => true,
    createSession: async () => ({ redirectUrl: 'https://testpay.example/checkout/abc' }),
    validatePayment: async () => ({
      valid: true,
      orderNumber: 'MC-TEST-0001',
      amount: 136000,
      currency: 'USD',
      providerRef: 'testpay-ref',
      raw: {},
    }),
    ...overrides,
  }
}

beforeEach(() => {
  resetPaymentProviders()
})

afterEach(() => {
  resetPaymentProviders()
})

describe('a gateway the core has never heard of', () => {
  it('becomes an online gateway purely by registering', () => {
    expect(isOnlineGateway('testpay')).toBe(false)

    registerPaymentProvider(fakeGateway())

    expect(isOnlineGateway('testpay')).toBe(true)
    expect(providerFor('testpay')?.id).toBe('testpay')
  })

  it('starts a session through the interface, not a named import', async () => {
    registerPaymentProvider(fakeGateway())

    const session = await providerFor('testpay')!.createSession({
      orderNumber: 'MC-TEST-0001',
      amount: 136000,
      customer: { name: 'Dana', email: 'dana@example.com', phone: '+14155550134' },
      address: {} as never,
      baseUrl: 'https://clone.example',
    })

    expect(session.redirectUrl).toBe('https://testpay.example/checkout/abc')
  })

  it('verifies a payment through the interface', async () => {
    registerPaymentProvider(fakeGateway())

    const result = await providerFor('testpay')!.validatePayment('ref-1')

    expect(result.valid).toBe(true)
    expect(result.currency).toBe('USD')
  })

  it('is hidden while it has no credentials', () => {
    registerPaymentProvider(fakeGateway({ isConfigured: () => false }))

    expect(configuredGatewayIds()).not.toContain('testpay')
    // Still registered — "known but unconfigured" is different from "unknown",
    // so an existing order paid through it can still be reconciled.
    expect(isOnlineGateway('testpay')).toBe(true)
  })

  it('appears once configured', () => {
    registerPaymentProvider(fakeGateway())
    expect(configuredGatewayIds()).toEqual(['testpay'])
  })

  it('coexists with another gateway without either knowing about the other', () => {
    registerPaymentProvider(fakeGateway())
    registerPaymentProvider(fakeGateway({ id: 'otherpay' }))

    expect(configuredGatewayIds().sort()).toEqual(['otherpay', 'testpay'])
    expect(providerFor('testpay')?.id).toBe('testpay')
    expect(providerFor('otherpay')?.id).toBe('otherpay')
  })
})

describe('offline methods are not gateways', () => {
  it.each(['cod', 'bank_transfer'])('%s is collected outside any provider', (method) => {
    registerPaymentProvider(fakeGateway())
    expect(isOnlineGateway(method)).toBe(false)
    expect(providerFor(method)).toBeUndefined()
  })
})

describe('the real deployment registers SSLCommerz through the same door', () => {
  it('registers it as one provider among possible others', async () => {
    resetPaymentProviders()
    vi.resetModules()
    // providers.ts reads credentials through lib/env, which validates the whole
    // server environment on import.
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pw@localhost:5432/test')
    vi.stubEnv('BETTER_AUTH_SECRET', 'x'.repeat(32))
    vi.stubEnv('BETTER_AUTH_URL', 'http://localhost:3000')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

    await import('./providers')

    const { isOnlineGateway: check, providerFor: lookup } = await import('./provider')
    expect(check('sslcommerz')).toBe(true)
    expect(lookup('sslcommerz')?.id).toBe('sslcommerz')
    expect(check('cod')).toBe(false)

    vi.unstubAllEnvs()
  })
})
