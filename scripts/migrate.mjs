/**
 * Applies pending migrations before Vercel compiles the app.
 * Also repairs the known historical Meta integration schema drift before
 * Drizzle checks its migration journal, then verifies required integration
 * tables used by request-time Admin pages.
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import { config as loadEnv } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import ws from 'ws'

import { describeDatabase, resolveDatabaseUrl } from './database-url.mjs'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

/**
 * Same precedence as the running application — see the note on
 * APP_DATABASE_URL in src/lib/env.ts. Migrating one database while the app
 * queries another is worse than not migrating at all: the deploy goes green and
 * the data is wrong.
 */
const { url: databaseUrl, source } = resolveDatabaseUrl()

if (!databaseUrl) {
  console.error('[migrate] neither APP_DATABASE_URL nor DATABASE_URL is set')
  process.exit(1)
}

// Names the target without printing credentials, so a deploy log shows which
// database was actually migrated.
const target = describeDatabase(databaseUrl)
if (!target) {
  console.error('[migrate] database URL is not parseable')
  process.exit(1)
}
console.log(`[migrate] target database ${target} (via ${source})`)

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: databaseUrl })

try {
  const started = Date.now()

  // Historical safeguard: some deployed databases recorded the Meta migration
  // as applied while the table itself remained on an older partial schema.
  // This repair is additive and idempotent, and is skipped automatically when
  // the table does not exist yet (fresh databases are handled by Drizzle below).
  await pool.query(`
    ALTER TABLE IF EXISTS "meta_integration_settings"
      ADD COLUMN IF NOT EXISTS "tracking_enabled" boolean DEFAULT false NOT NULL,
      ADD COLUMN IF NOT EXISTS "pixel_id" text,
      ADD COLUMN IF NOT EXISTS "dataset_id" text,
      ADD COLUMN IF NOT EXISTS "access_token_encrypted" text,
      ADD COLUMN IF NOT EXISTS "test_event_code" text,
      ADD COLUMN IF NOT EXISTS "domain_verification" text,
      ADD COLUMN IF NOT EXISTS "last_connection_test_at" timestamp,
      ADD COLUMN IF NOT EXISTS "last_connection_status" text,
      ADD COLUMN IF NOT EXISTS "last_connection_message" text,
      ADD COLUMN IF NOT EXISTS "last_successful_event_at" timestamp,
      ADD COLUMN IF NOT EXISTS "last_successful_event_name" text,
      ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL
  `)
  console.log('[migrate] Meta schema preflight repair complete')

  // Google integration settings are deliberately simple and contain no secret.
  // Creating the table idempotently before Drizzle makes preview clones robust
  // even if an interrupted deploy records journal state out of order.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "google_integration_settings" (
      "store_key" text PRIMARY KEY DEFAULT 'default' NOT NULL,
      "tracking_enabled" boolean DEFAULT false NOT NULL,
      "tag_id" text,
      "purchase_tracking_enabled" boolean DEFAULT true NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `)
  console.log('[migrate] Google integration schema preflight complete')

  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })

  const metaResult = await pool.query("select column_name from information_schema.columns where table_schema = 'public' and table_name = 'meta_integration_settings'")
  const metaColumns = new Set(metaResult.rows.map((row) => row.column_name))
  const metaRequired = ['store_key', 'tracking_enabled', 'pixel_id', 'dataset_id', 'access_token_encrypted']
  const metaMissing = metaRequired.filter((column) => !metaColumns.has(column))

  if (metaMissing.length) {
    throw new Error(`meta_integration_settings schema incomplete: ${metaMissing.join(', ')}`)
  }

  const googleResult = await pool.query("select column_name from information_schema.columns where table_schema = 'public' and table_name = 'google_integration_settings'")
  const googleColumns = new Set(googleResult.rows.map((row) => row.column_name))
  const googleRequired = ['store_key', 'tracking_enabled', 'tag_id', 'purchase_tracking_enabled']
  const googleMissing = googleRequired.filter((column) => !googleColumns.has(column))

  if (googleMissing.length) {
    throw new Error(`google_integration_settings schema incomplete: ${googleMissing.join(', ')}`)
  }

  console.log(`[migrate] schema verified; up to date in ${Date.now() - started}ms`)
} catch (error) {
  console.error('[migrate] FAILED:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await pool.end()
}
