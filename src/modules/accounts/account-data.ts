import 'server-only'

import { and, desc, eq, ne } from 'drizzle-orm'

import { db } from '@/lib/db'
import { anonymiseOrdersForUser, listOrdersForUser } from '@/modules/orders'

import { auth } from './auth'
import { accounts, addresses, sessions, users } from './schema'

export class AccountError extends Error {}

/* ------------------------------------------------------------------ sessions */

export type DeviceSession = {
  id: string
  createdAt: Date
  expiresAt: Date
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

/**
 * Every device signed in as this user — read directly, and without tokens.
 *
 * Better Auth's own `listSessions` is deliberately not used here. It sits behind
 * a freshness check and returns each session's **token**, which is a bearer
 * credential: anything holding one is signed in as that user. Rendering those
 * into a page would put live credentials in the HTML, in the RSC payload, and
 * in any screenshot of the screen — so the token never leaves the server, and
 * revocation is keyed on the row id instead.
 *
 * That also fixes the practical problem: freshness meant the page 500'd for
 * anyone whose session was more than a day old, which is almost everyone.
 */
export async function listMySessions(
  userId: string,
  currentToken: string,
): Promise<DeviceSession[]> {
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(desc(sessions.createdAt))

  return rows.map((s) => ({
    id: s.id,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    // Compared server-side; only the boolean crosses to the client.
    current: s.token === currentToken,
  }))
}

/**
 * Ends one session. Scoped by user id in the WHERE clause, so a guessed row id
 * matches nothing rather than signing somebody else out.
 */
export async function revokeSession(userId: string, sessionId: string): Promise<boolean> {
  const removed = await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
    .returning({ id: sessions.id })

  return removed.length > 0
}

/** Signs out every other device. The one asking stays signed in. */
export async function revokeOtherSessions(userId: string, currentToken: string): Promise<number> {
  const removed = await db
    .delete(sessions)
    .where(and(eq(sessions.userId, userId), ne(sessions.token, currentToken)))
    .returning({ id: sessions.id })

  return removed.length
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
