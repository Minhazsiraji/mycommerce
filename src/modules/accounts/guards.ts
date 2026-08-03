import 'server-only'

import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { auth, type AuthSession } from './auth'
import type { Role } from './schema'

/**
 * The only sanctioned way to read or require a session.
 *
 * Every protected surface goes through one of these three functions so there is a
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

export async function requireRole(role: Role): Promise<AuthSession> {
  const session = await getSession()

  // 404 rather than 403 or a redirect: an unauthorised visitor should not be able
  // to confirm that an admin route exists at all.
  if (!session || session.user.role !== role) notFound()

  return session
}
