import { neonConfig, Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import ws from 'ws'

import { databaseUrl } from '@/lib/env'

import * as schema from './schema'

/**
 * WebSocket driver, not the HTTP one.
 *
 * `drizzle-orm/neon-http` is a round trip cheaper per query, but it cannot run
 * interactive transactions — each statement is an independent request. Checkout
 * depends on decrementing stock and creating the order inside one transaction
 * (invariant 4 in CLAUDE.md), so the HTTP driver is disqualified for the paths
 * that matter most. Using one driver everywhere beats maintaining two clients
 * and remembering which is safe where.
 *
 * Pooling is why DATABASE_URL must point at the `-pooler` endpoint: serverless
 * functions would otherwise each open a direct connection and exhaust the limit.
 */

// Node has no global WebSocket in the versions we target; edge runtimes do.
if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws
}

const pool = new Pool({ connectionString: databaseUrl })

export const db = drizzle(pool, {
  schema,
  casing: 'snake_case',
})

export { schema }
