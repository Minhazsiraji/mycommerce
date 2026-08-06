import 'server-only'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

import { db } from '@/lib/db'
import { anonymiseOrdersForUser, listOrdersForUser } from '@/modules/orders'

import { auth } from './auth'
import { accounts, addresses, users } from './schema'

export class AccountError extends Error {}

/* ------------------------------------------------------------------ sessions */

/**
 * Every device signed in as this user.
 *
 * Better Auth scopes this to the caller's own session, so there is no user id
 * to pass and no way to ask about somebody else.
 */
export async function listMySessions() {
  return auth.api.listSessions({ headers: await headers() })
}

export async function revokeSession(token: string) {
  return auth.api.revokeSession({ body: { token }, headers: await headers() })
}

/** Signs out every other device. The one asking stays signed in. */
export async function revokeOtherSessions() {
  return auth.api.revokeOtherSessions({ headers: await headers() })
}

/* ------------------------------------------------------------------- re-auth */

/**
 * Confirms the caller still knows the password.
 *
 * A 30-day session means the browser in front of us may have been left open in
 * a library a month ago. Deleting an account and reading a full data export are
 * both irreversible in their own way, so both re-prove the password rather than
 * trusting the cookie.
 */
export async function verifyPassword(userId: string, password: string): Promise<boolean> {
  const credential = await db.query.accounts.findFirst({
    where: eq(accounts.userId, userId),
  })

  if (!credential?.password) return false

  const ctx = await auth.$context
  return ctx.password.verify({ password, hash: credential.password })
}

/* -------------------------------------------------------------------- export */

export type AccountExport = {
  exportedAt: string
  profile: { name: string; email: string; createdAt: string; twoFactorEnabled: boolean }
  addresses: unknown[]
  orders: unknown[]
}

/**
 * Everything held about one person, in one JSON file.
 *
 * Deliberately built from the same reads the customer already has access to
 * through the UI — an export that could surface more than the account screens
 * do would be a privilege escalation wearing a compliance hat.
 */
export async function exportAccountData(userId: string): Promise<AccountExport> {
  const [user, savedAddresses, orders] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    db.query.addresses.findMany({ where: eq(addresses.userId, userId) }),
    listOrdersForUser(userId),
  ])

  if (!user) throw new AccountError('Account not found.')

  return {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      twoFactorEnabled: user.twoFactorEnabled,
    },
    addresses: savedAddresses,
    orders,
  }
}

/* ------------------------------------------------------------------ deletion */

/**
 * Closes an account for good.
 *
 * Order rows survive, stripped of identity — see `anonymiseOrdersForUser`. Two
 * things happen in a deliberate order: anonymise first, then delete the user.
 * The reverse would work too, because the FK is `ON DELETE SET NULL`, but it
 * would leave a window in which orders carry an email addressed to nobody.
 *
 * Everything else cascades from the user row: addresses, cart, sessions, the
 * credential, and the TOTP secret all declare `ON DELETE CASCADE`. The delete
 * is a transaction so a half-erased account is not a state that can exist.
 */
export async function deleteAccount(userId: string): Promise<{ ordersAnonymised: number }> {
  const ordersAnonymised = await anonymiseOrdersForUser(userId)

  await db.transaction(async (tx) => {
    await tx.delete(users).where(eq(users.id, userId))
  })

  return { ordersAnonymised }
}
