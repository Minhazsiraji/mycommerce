import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'

import proxy from './proxy'

describe('proxy Content-Security-Policy', () => {
  it('allows only the Google hosts required by the Merchant Center tag', () => {
    const response = proxy(new NextRequest('https://store.example/'))
    const csp = response.headers.get('content-security-policy')

    expect(csp).toBeTruthy()
    expect(csp).toContain('https://www.googletagmanager.com')
    expect(csp).toContain('https://*.merchant-center-analytics.goog')

    // Keep the Google allowance intentionally narrow. Advertising / generic
    // Google origins are not needed for the current Merchant Center destination.
    expect(csp).not.toContain('https://*.google.com')
    expect(csp).not.toContain('https://google.com')
    expect(csp).not.toContain('https://www.google.com')
    expect(csp).not.toContain('doubleclick.net')
    expect(csp).not.toContain('googlesyndication.com')
    expect(csp).not.toContain('googleadservices.com')
  })

  it('preserves the existing Meta and Cloudinary allowlist', () => {
    const response = proxy(new NextRequest('https://store.example/'))
    const csp = response.headers.get('content-security-policy') ?? ''

    expect(csp).toContain('https://connect.facebook.net')
    expect(csp).toContain('https://www.facebook.com')
    expect(csp).toContain('https://res.cloudinary.com')
    expect(csp).toContain('https://api.cloudinary.com')
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
  })
})
