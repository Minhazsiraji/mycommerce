import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import { env } from '@/lib/env'

import * as schema from './schema'

/**
 * Neon's HTTP driver — one round trip per query, no connection to hold open.
 * That is the right shape for serverless functions, which would otherwise
 * exhaust the connection limit.
 *
 * `casing: 'snake_case'` maps camelCase fields to snake_case columns, so the
 * TypeScript and SQL conventions in the spec both hold without hand-writing
 * every column name.
 */
export const db = drizzle(neon(env.DATABASE_URL), {
  schema,
  casing: 'snake_case',
})

export { schema }
