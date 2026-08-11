import { getSessionCookie } from 'better-auth/cookies'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next 16 renamed the `middleware` file convention to `proxy`.
 *
 * Two jobs: the Content-Security-Policy, and an optimistic gate on private
 * routes.
 *
 * The route gate is a *cookie presence* check, not authentication. It exists to
 * avoid rendering a protected page for an obviously signed-out visitor. The real
 * check is `requireSession` / `requireRole` in the page itself — this file must
 * never be the only thing standing between a request and private data.
 *
 * ---
 *
 * On the absence of a nonce.
 *
 * The obvious CSP here is `'nonce-<x>' 'strict-dynamic'`, and that is what this
 * file used to emit. It broke the entire site. `'strict-dynamic'` tells browsers
 * to ignore host sources like `'self'`, so only nonce'd scripts run — and Next
 * cannot stamp a per-request nonce onto a page that was *statically prerendered
 * at build time*. In production, zero of eighteen script tags carried a nonce,
 * every chunk was blocked, and nothing on the site was interactive.
 *
 * It looked perfectly healthy from outside: pages returned 200 with correct
 * markup, and API calls made with fetch worked, because those never touch the
 * blocked bundle. Only clicking something revealed it.
 *
 * Static rendering and per-request nonces are mutually exclusive by definition,
 * and docs/05-performance.md commits to static catalog pages because that is
 * where the speed comes from. So: host-based CSP, plus `'unsafe-inline'` for the
 * bootstrap and flight-data scripts Next emits inline.
 *
 * What is kept is a narrow host allowlist: application code plus Meta's single
 * documented Pixel host. Everything else remains blocked. What is given up is
 * protection against injected *inline* script, which first requires an XSS
 * hole: React escapes by default and `dangerouslySetInnerHTML` is banned on user
 * content (docs/04-security.md, threat 10). CSP is defence in depth here, not
 * the primary control.
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
  const isDev = process.env.NODE_ENV !== 'production'

  const csp = [
    `default-src 'self'`,
    // React's development build needs eval() for its debugging features. It
    // never uses eval() in production, so that relaxation stays scoped to dev.
    // Permitted by host, but loaded only after explicit analytics consent.
    `script-src 'self' 'unsafe-inline' https://connect.facebook.net${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'unsafe-inline'`,
    // Cloudinary serves every product image.
    `img-src 'self' blob: data: https://res.cloudinary.com https://www.facebook.com`,
    `font-src 'self'`,
    // api.cloudinary.com receives direct browser uploads from admin.
    // ws: is the dev HMR socket only.
    `connect-src 'self' https://api.cloudinary.com https://www.facebook.com https://connect.facebook.net${isDev ? ' ws:' : ''}`,
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

  const response = NextResponse.next()
  response.headers.set('content-security-policy', csp)
  return response
}

export const config = {
  matcher: [
    // Everything except static assets and image optimisation output.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)',
  ],
}
