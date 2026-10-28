import { getStoreUrl } from '@/lib/store-config'

/** The MoyMoy custom-domain storefront is intentionally deployed from a preview branch.
 * Other previews must remain excluded from search results; proxy.ts enforces
 * an additional host-based X-Robots-Tag on preview deployment URLs.
 */
export function isIndexableEnvironment(vercelEnv = process.env.VERCEL_ENV) {
  if (vercelEnv === 'production') return true
  return vercelEnv === 'preview' &&
    process.env.VERCEL_GIT_COMMIT_REF === 'agent/moymoy-storefront' &&
    process.env.STORE_CANONICAL_URL?.replace(/\/$/, '') === 'https://moymoy.sirajibd.com' &&
    process.env.STORE_NAME === 'MoyMoy Fashion'
}

/** Never expose preview deployment URLs to search engines. */
export function isCanonicalRequestHost(hostname: string) {
  return hostname.toLowerCase() === getSiteUrl().hostname.toLowerCase()
}

export function getSiteUrl() {
  return getStoreUrl('/')
}
