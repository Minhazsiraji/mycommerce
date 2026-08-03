import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next 16 renamed the `middleware` file convention to `proxy`.
 *
 * Two jobs: per-request CSP nonce, and an optimistic gate on private routes.
 *
 * The route gate is a *cookie presence* check, not authentication. It exists to
 * avoid rendering a protected page for an obviously signed-out visitor. The real
 * check is `requireSession` / `requireRole` in the page itself — this file must
 * never be the only thing standing between a request and private data.
 */

const PRIVATE_PREFIXES = ['/account', '/admin']

/**
 * MUST match `advanced.cookiePrefix` in modules/accounts/auth.ts.
 *
 * `getSessionCookie` defaults to looking for `better-auth.session_token`. With a
 * custom prefix and no config passed, it never finds the cookie and bounces
 * every signed-in visitor back to /login — an infinite loop out of the account
 * area that no unit test would catch.
 */
const COOKIE_PREFIX = 'mycommerce'

export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const isDev = process.env.NODE_ENV !== 'production'

  const csp = [
    `default-src 'self'`,
    // React's development build needs eval() for its debugging features and says
    // so explicitly in the console. It never uses eval() in production, so this
    // relaxation is scoped to dev and the shipped policy stays strict.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    // ws: is the dev HMR socket only.
    `connect-src 'self'${isDev ? ' ws:' : ''}`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ')

  const { pathname } = request.nextUrl
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPrivate && !getSessionCookie(request, { cookiePrefix: COOKIE_PREFIX })) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  const headers = new Headers(request.headers)
  headers.set('x-nonce', nonce)
  headers.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers } })
  response.headers.set('content-security-policy', csp)
  return response
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation output.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}
