/**
 * Applies pending migrations. Runs as part of `vercel-build`, before Next
 * compiles, so production schema is never behind the code that needs it.
 *
 * Uses Drizzle's programmatic migrator rather than the `drizzle-kit` CLI: the
 * CLI is a devDependency and would need to survive Vercel's production prune.
 * Drizzle tracks applied migrations in `__drizzle_migrations`, so re-running is
 * a no-op — safe on every build.
 *
 * Run locally with: node scripts/migrate.mjs
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import { config as loadEnv } from 'dotenv'
import { drizzle } from 'drizzle-orm/neon-serverless'
import { migrate } from 'drizzle-orm/neon-serverless/migrator'
import ws from 'ws'

loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

const vercelEnv = process.env.VERCEL_ENV

/**
 * Preview deployments currently point at the same database as production, so
 * migrating from a preview would apply unreviewed schema to live data. Until
 * each preview gets its own Neon branch (P5), previews run against whatever
 * schema production already has.
 */
if (vercelEnv && vercelEnv !== 'production') {
  console.log(`[migrate] VERCEL_ENV=${vercelEnv} — skipping (production only)`)
  process.exit(0)
}

if (!process.env.DATABASE_URL) {
  console.error('[migrate] DATABASE_URL is not set')
  process.exit(1)
}

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

try {
  const started = Date.now()
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  console.log(`[migrate] up to date in ${Date.now() - started}ms`)
} catch (error) {
  // Fail the build. Deploying code whose tables do not exist turns a loud
  // build failure into every page 500ing in production.
  console.error('[migrate] FAILED:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await pool.end()
}
