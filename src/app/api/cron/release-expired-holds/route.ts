import { timingSafeEqual } from 'node:crypto'

import { env } from '@/lib/env'
import { pruneRateLimits } from '@/lib/rate-limit'
import { pruneAuditLogs } from '@/modules/admin'
import { listExpiredHolds, releaseHold } from '@/modules/orders'
import { retryPendingPurchases } from '@/modules/meta'

/**
 * Compares without leaking length or position through timing.
 *
 * `!==` returns on the first differing byte. Over the public internet that
 * signal is buried in jitter, but this endpoint cancels orders and returns
 * stock, and the constant-time version is three lines.
 */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false

  const a = Buffer.from(provided)
  const b = Buffer.from(`Bearer ${expected}`)

  // timingSafeEqual throws on a length mismatch, which would itself be a signal.
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/**
 * Returns stock reserved by orders that were never paid.
 *
 * Without this an abandoned checkout holds stock nobody can buy, permanently —
 * the store slowly sells out of things it still has. Windows are set when the
 * order is created: 30 minutes for a gateway checkout, 72 hours for a bank
 * transfer.
 *
 * Idempotent by construction: releasing sets the order to cancelled and clears
 * its hold, so a second run finds nothing.
 */
export async function POST(request: Request) {
  // Vercel Cron sends this header. No secret configured means no caller can
  // ever authenticate — closed, not open.
  if (!env.CRON_SECRET || !secretMatches(request.headers.get('authorization'), env.CRON_SECRET)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const expired = await listExpiredHolds()
  const released: string[] = []

  for (const order of expired) {
    try {
      if (await releaseHold(order.id, 'expired')) released.push(order.orderNumber)
    } catch (error) {
      // One bad order must not stop the rest being released.
      console.error('[cron] failed to release hold', order.orderNumber, error)
    }
  }

  /**
   * Retention, piggybacked on the job that already runs.
   *
   * docs/04-security.md promises audit logs are kept one year; a promise with no
   * code behind it is just a sentence. Rate-limit windows older than a day can
   * never be counted against again. Neither is allowed to fail the release pass,
   * which is the part that actually affects customers.
   */
  let pruned = { auditLogs: 0, rateLimits: 0 }
  try {
    pruned = {
      auditLogs: await pruneAuditLogs(),
      rateLimits: await pruneRateLimits(),
    }
  } catch (error) {
    console.error('[cron] retention pass failed', error)
  }

  let metaPurchasesAttempted = 0
  try {
    metaPurchasesAttempted = await retryPendingPurchases()
  } catch (error) {
    console.error('[cron] Meta retry pass failed', error)
  }

  return Response.json({ checked: expired.length, released, pruned, metaPurchasesAttempted })
}

// Vercel Cron invokes GET; POST remains for the documented manual/monitoring call.
export const GET = POST
