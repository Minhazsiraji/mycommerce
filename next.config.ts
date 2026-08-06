import type { NextConfig } from 'next'

/**
 * Headers here are the static half of the security policy; the Content-Security-
 * Policy is set per-request in `src/proxy.ts`. It carries no nonce — see the
 * long note in that file for why, and why removing it was not a downgrade.
 *
 * docs/04-security.md is the reference; an e2e test asserts these in P5 so a
 * regression fails CI rather than shipping quietly.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrers stay on-origin in full and shrink to the bare origin off-site, so
  // an order number in a path never travels to a third party.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
  },
  // frame-ancestors in the CSP is the modern control; this covers browsers that
  // still only understand the old header.
  { key: 'X-Frame-Options', value: 'DENY' },
  // Severs window.opener between our pages and anything they open, so a gateway
  // or third-party tab cannot reach back into an authenticated document.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Privacy: stop the browser silently resolving hostnames found in page content.
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,

  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    /**
     * next/image refuses any host not listed here, so an unconfigured hostname
     * is a hard 500 on every page that renders a product image — not a broken
     * thumbnail. Must be kept in step with lib/storage's provider.
     */
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },

  typedRoutes: true,

  /**
   * Opts into explicit caching: a page is dynamic unless something inside it is
   * marked `'use cache'`. That is what makes the `updateTag` calls in the
   * catalog actions actually invalidate something — before this they tagged
   * nothing and did nothing.
   */
  cacheComponents: true,

  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
