import { env } from '@/lib/env'

function httpsOrigin(value: string | null | undefined) {
  if (!value) return null

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.pathname === '/' && !url.search && !url.hash
      ? url.origin
      : null
  } catch {
    return null
  }
}

/**
 * Returns the public origin of the deployment handling the current request.
 *
 * Server Actions already reject cross-origin submissions. We still constrain
 * the value to either the configured storefront or Vercel's exact deployment
 * and branch hosts before giving it to a payment provider. This prevents an
 * arbitrary caller-controlled callback URL while allowing Preview payments to
 * return to the isolated Preview database that created the order.
 */
export function paymentCallbackOrigin(requestOrigin: string | null) {
  const candidate = httpsOrigin(requestOrigin)
  if (!candidate) return env.BETTER_AUTH_URL

  const allowed = new Set([
    httpsOrigin(env.BETTER_AUTH_URL),
    httpsOrigin(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null),
    httpsOrigin(process.env.VERCEL_BRANCH_URL ? `https://${process.env.VERCEL_BRANCH_URL}` : null),
  ])

  return allowed.has(candidate) ? candidate : env.BETTER_AUTH_URL
}
