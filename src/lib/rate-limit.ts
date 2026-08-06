import 'server-only'

import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'

import { db } from '@/lib/db'

/**
 * Fixed-window rate limiting, counted in Postgres.
 *
 * It has to be Postgres. On Vercel each invocation may be a cold instance, so an
 * in-process Map counts to one and resets — a control that reads like a control
 * and stops nothing. Better Auth's own limiter covers `/api/auth/*` and nothing
 * else, which leaves every Server Action open, and the one that matters most is
 * `placeOrder`: it decrements real stock and holds it for up to 72 hours without
 * anyone having paid. Unthrottled, a loop takes the whole catalogue to zero.
 *
 * A fixed window lets through up to 2x the limit across a boundary. A sliding
 * window would not, at the cost of storing every hit. For "stop a script", the
 * fixed window is the right trade; this is not a billing meter.
 */

export type RateLimitResult = {
  ok: boolean
  /** Seconds until the window rolls over. Zero when allowed. */
  retryAfter: number
}

/**
 * The caller's identity for limiting purposes.
 *
 * `x-forwarded-for` is spoofable in general; on Vercel the platform overwrites
 * it at the edge, so the leftmost entry is the real client. Behind any other
 * proxy this assumption has to be re-checked before it is trusted.
 *
 * Falls back to a single shared bucket rather than to "unlimited" — if the
 * header is ever missing, everyone throttling each other is a bad day, and
 * everyone being unlimited is an incident.
 */
export async function callerId(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || h.get('x-real-ip')?.trim() || 'unknown'
}

/**
 * Counts one hit and says whether it is allowed.
 *
 * The whole decision is one atomic upsert. Read-then-write would let two
 * concurrent requests both see `hits = limit - 1` and both proceed, which is
 * exactly the case a limiter exists to stop.
 */
export async function rateLimit(
  bucket: string,
  limit: number,
  windowSeconds: number,
  identifier?: string,
): Promise<RateLimitResult> {
  const key = `${bucket}:${identifier ?? (await callerId())}`

  try {
    const result = await db.execute<{ hits: number; reset_in: number }>(sql`
      insert into rate_limits (key, hits, window_start)
      values (${key}, 1, now())
      on conflict (key) do update set
        hits = case
          when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          then 1
          else rate_limits.hits + 1
        end,
        window_start = case
          when rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
          then now()
          else rate_limits.window_start
        end
      returning
        hits,
        ceil(extract(epoch from (window_start + make_interval(secs => ${windowSeconds}) - now())))::int
          as reset_in
    `)

    const row = (Array.isArray(result) ? result : result.rows)[0]
    if (!row) return { ok: true, retryAfter: 0 }

    if (row.hits > limit) return { ok: false, retryAfter: Math.max(row.reset_in, 1) }
    return { ok: true, retryAfter: 0 }
  } catch (error) {
    /**
     * Fail open, deliberately.
     *
     * If the database is unreachable the limiter cannot answer — but neither can
     * checkout, so nothing is actually being protected by refusing here. Turning
     * a database blip into a hard "too many requests" on every page would be a
     * self-inflicted outage.
     */
    console.error('[rate-limit] check failed, allowing request', bucket, error)
    return { ok: true, retryAfter: 0 }
  }
}

/** Drops windows nothing can still be counting against. Called by cron. */
export async function pruneRateLimits(): Promise<number> {
  const result = await db.execute<{ n: number }>(sql`
    with deleted as (
      delete from rate_limits where window_start < now() - interval '24 hours' returning 1
    )
    select count(*)::int as n from deleted
  `)

  return (Array.isArray(result) ? result : result.rows)[0]?.n ?? 0
}

/** Human-facing message. Never says which bucket — that is a map for an attacker. */
export function tooManyRequests(retryAfter: number): string {
  const minutes = Math.ceil(retryAfter / 60)
  return retryAfter <= 90
    ? 'Too many attempts. Wait a moment and try again.'
    : `Too many attempts. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`
}
