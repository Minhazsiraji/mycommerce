import type { NextConfig } from 'next'

/**
 * Headers here are the static half of the security policy. The Content-Security-
 * Policy is set per-request in middleware.ts because it carries a nonce.
 *
 * docs/04-security.md is the reference; an e2e test asserts these in P5 so a
 * regression fails CI rather than shipping quietly.
 */
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-Frame-Options', value: 'DENY' },
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
