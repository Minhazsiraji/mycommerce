import 'server-only'

/**
 * Retries database work that failed for connection reasons.
 *
 * Neon is reached over a long-lived WebSocket held by a pool. Those connections
 * drop — idle timeouts, network hiccups, a serverless function frozen and
 * resumed — and a query that lands on a dead one fails immediately. Without a
 * retry that surfaces as a 500 for the visitor, and during a build it fails the
 * whole deploy: observed twice, both times succeeding on a plain re-run with no
 * code change.
 *
 * The important half is what is NOT retried. If Postgres answered with an error
 * code the failure is deterministic — a duplicate SKU will still be duplicate
 * on the second attempt — so those propagate immediately. Retrying them would
 * turn a clear validation message into a slow one.
 */

/** Walks the cause chain; Drizzle wraps driver errors in DrizzleQueryError. */
function postgresErrorCode(error: unknown): string | undefined {
  let current: unknown = error

  for (let depth = 0; current && depth < 5; depth++) {
    if (typeof current === 'object' && 'code' in current) {
      const code = (current as { code?: unknown }).code
      // Postgres SQLSTATE codes are five characters, e.g. 23505.
      if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) return code
    }
    current = (current as { cause?: unknown }).cause
  }

  return undefined
}

export function isRetryableDbError(error: unknown): boolean {
  return postgresErrorCode(error) === undefined
}

const DELAYS_MS = [100, 400]

export async function withDbRetry<T>(operation: () => Promise<T>, label = 'query'): Promise<T> {
  let lastError: unknown

  for (let attempt = 0; attempt <= DELAYS_MS.length; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isRetryableDbError(error)) throw error

      const delay = DELAYS_MS[attempt]
      if (delay === undefined) break

      console.warn(
        `[db] ${label} failed on a connection error, retrying in ${delay}ms (attempt ${attempt + 1})`,
      )
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError
}
