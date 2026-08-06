import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Rate-limit windows. Table only, no `server-only` — drizzle-kit loads this file
 * outside a server runtime to generate migrations, and the guard would throw.
 * Same split as `modules/<m>/schema.ts` versus its service.
 *
 * The counting logic, and why it has to live in Postgres at all, is in
 * `lib/rate-limit.ts`.
 */
export const rateLimits = pgTable(
  'rate_limits',
  {
    /** `${bucket}:${identifier}` — one row per caller per bucket. */
    key: text('key').primaryKey(),
    hits: integer('hits').notNull().default(0),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
  },
  // Supports the nightly prune, which is the only query that is not by key.
  (t) => [index('rate_limits_window_idx').on(t.windowStart)],
)
