'use server'

import { refresh } from 'next/cache'
import { z } from 'zod'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'

import * as data from './account-data'
import { AccountError } from './account-data'
import { requireSession } from './guards'

const passwordSchema = z.object({
  password: z.string().min(1, 'Enter your password'),
})

const revokeSchema = z.object({
  token: z.string().trim().min(10).max(400),
})

/**
 * Password re-auth, throttled.
 *
 * These endpoints take a password and say whether it was right, which is an
 * oracle if it can be called without limit — and unlike the login form, the
 * caller is already inside a session, so Better Auth's sign-in limiter never
 * sees them. Keyed per user rather than per IP: the account is what is under
 * attack, and a shared office IP should not lock everyone out.
 */
async function reauth(userId: string, password: string): Promise<ActionResult<null>> {
  const limit = await rateLimit('reauth', 5, 900, userId)
  if (!limit.ok) return fail('conflict', tooManyRequests(limit.retryAfter))

  const valid = await data.verifyPassword(userId, password)
  if (!valid) return fail('forbidden', 'That password is not correct.')

  return ok(null)
}

export async function revokeSession(input: unknown): Promise<ActionResult<null>> {
  const parsed = revokeSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  // Better Auth scopes revocation to the caller's own sessions; a token
  // belonging to somebody else simply does not match.
  await requireSession()
  await data.revokeSession(parsed.data.token)

  refresh()
  return ok(null)
}

export async function revokeOtherSessions(): Promise<ActionResult<null>> {
  await requireSession()
  await data.revokeOtherSessions()

  refresh()
  return ok(null)
}

export async function exportMyData(input: unknown): Promise<ActionResult<string>> {
  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  const session = await requireSession()

  const check = await reauth(session.user.id, parsed.data.password)
  if (!check.ok) return check

  try {
    const payload = await data.exportAccountData(session.user.id)
    // Returned as a string for the browser to turn into a download; the action
    // boundary would otherwise serialise Dates into something less readable.
    return ok(JSON.stringify(payload, null, 2))
  } catch (error) {
    if (error instanceof AccountError) return fail('not_found', error.message)
    throw error
  }
}

export async function deleteMyAccount(input: unknown): Promise<ActionResult<null>> {
  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  const session = await requireSession()

  const check = await reauth(session.user.id, parsed.data.password)
  if (!check.ok) return check

  /**
   * An admin deleting themselves would leave a store nobody can administer, and
   * no second admin exists to undo it. Refuse rather than let one misplaced
   * click end access to the order book.
   */
  if (session.user.role === 'admin') {
    return fail(
      'forbidden',
      'Admin accounts cannot be deleted from here. Change the role first, or ask another admin.',
    )
  }

  try {
    await data.deleteAccount(session.user.id)
    return ok(null)
  } catch (error) {
    if (error instanceof AccountError) return fail('not_found', error.message)
    throw error
  }
}
