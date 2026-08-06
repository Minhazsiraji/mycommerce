import 'server-only'

import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { auth, type AuthSession } from './auth'
import type { Role } from './schema'

/**
 * The only sanctioned way to read or require a session.
 *
 * Every protected surface goes through one of these functions so there is a
 * single place to audit. Inline role checks scattered across route files are how a
 * page eventually ships without one.
 */

export async function getSession(): Promise<AuthSession | null> {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession(): Promise<AuthSession> {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

/** Where an admin without a second factor is sent to set one up. */
export const TWO_FACTOR_SETUP_PATH = '/account/security'

/**
 * Admin access requires a second factor.
 *
 * This is the enforcement Better Auth cannot do for us — the plugin knows how to
 * verify a code, but has no concept of "mandatory for this role", so without
 * this check 2FA is a setting nobody turns on. The admin holds the order book,
 * the customer list and the ability to mark payments received; a single
 * password is not enough to stand in front of that.
 *
 * An admin who has not enrolled is redirected to set one up rather than refused,
 * because refusing would lock the store's owner out of their own store. They can
 * reach the setup page and nothing else.
 */
export async function requireRole(role: Role): Promise<AuthSession> {
  const session = await getSession()

  // 404 rather than 403 or a redirect: an unauthorised visitor should not be able
  // to confirm that an admin route exists at all.
  if (!session || session.user.role !== role) notFound()

  if (role === 'admin' && !session.user.twoFactorEnabled) {
    redirect(`${TWO_FACTOR_SETUP_PATH}?required=admin`)
  }

  return session
}
