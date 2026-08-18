/**
 * Applies pending migrations before Vercel compiles the app.
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
