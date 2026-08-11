import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  env: { BETTER_AUTH_URL: 'https://shop.example' },
}))

import { paymentCallbackOrigin } from './request-origin'

describe('paymentCallbackOrigin', () => {
  beforeEach(() => {
    delete process.env.VERCEL_URL
    delete process.env.VERCEL_BRANCH_URL
  })

  it('keeps the configured production origin', () => {
    expect(paymentCallbackOrigin('https://shop.example')).toBe('https://shop.example')
  })

  it('keeps the exact Vercel branch origin for an isolated Preview', () => {
    process.env.VERCEL_BRANCH_URL = 'mycommerce-git-agent-preview.example.vercel.app'

    expect(
      paymentCallbackOrigin('https://mycommerce-git-agent-preview.example.vercel.app'),
    ).toBe('https://mycommerce-git-agent-preview.example.vercel.app')
  })

  it('rejects an arbitrary HTTPS callback origin', () => {
    expect(paymentCallbackOrigin('https://attacker.example')).toBe('https://shop.example')
  })

  it('rejects malformed and insecure origins', () => {
    expect(paymentCallbackOrigin('http://shop.example')).toBe('https://shop.example')
    expect(paymentCallbackOrigin('not a URL')).toBe('https://shop.example')
  })
})
