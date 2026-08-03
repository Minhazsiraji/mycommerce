import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Two jobs: per-request CSP nonce, and an optimistic gate on private routes.
 *
 * The route gate is a *cookie presence* check, not authentication. It exists to
 * avoid rendering a protected page for an obviously signed-out visitor. The real
 * check is `requireSession` / `requireRole` in the page itself — middleware must
 * never be the only thing standing between a request and private data.
 */

const PRIVATE_PREFIXES = ['/account', '/admin']

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    ...(process.env.NODE_ENV === 'production' ? [`upgrade-insecure-requests`] : []),
  ].join('; ')

  const { pathname } = request.nextUrl
  const isPrivate = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPrivate && !getSessionCookie(request)) {
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
