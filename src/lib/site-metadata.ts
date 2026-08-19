import { getStoreUrl } from '@/lib/store-config'

/** Only the canonical Vercel production deployment may be indexed. */
export function isIndexableEnvironment(vercelEnv = process.env.VERCEL_ENV) {
  return vercelEnv === 'production'
}

export function getSiteUrl() {
  return getStoreUrl('/')
}
