/**
 * Applies pending migrations before Vercel compiles the app.
 * Also repairs the known historical Meta integration schema drift before
 * Drizzle checks its migration journal, then verifies the required columns.
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import { config as loadEnv } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import ws from 'ws'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('[migrate] DATABASE_URL is not set')
  process.exit(1)
}

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

  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })

  const result = await pool.query("select column_name from information_schema.columns where table_schema = 'public' and table_name = 'meta_integration_settings'")
  const columns = new Set(result.rows.map((row) => row.column_name))
  const required = ['store_key', 'tracking_enabled', 'pixel_id', 'dataset_id', 'access_token_encrypted']
  const missing = required.filter((column) => !columns.has(column))

  if (missing.length) {
    throw new Error(`meta_integration_settings schema incomplete: ${missing.join(', ')}`)
  }

  console.log(`[migrate] schema verified; up to date in ${Date.now() - started}ms`)
} catch (error) {
  console.error('[migrate] FAILED:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await pool.end()
}
