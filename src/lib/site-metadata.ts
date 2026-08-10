const PRODUCTION_URL = 'https://sirajibd.com'

/** Only the canonical Vercel production deployment may be indexed. */
export function isIndexableEnvironment(vercelEnv = process.env.VERCEL_ENV) {
  return vercelEnv === 'production'
}

export function getSiteUrl() {
  return new URL(PRODUCTION_URL)
}

