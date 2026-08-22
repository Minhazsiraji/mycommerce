import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Drizzle Kit runs outside Next, so it does not inherit Next's .env.local
// loading. Read it explicitly, falling back to .env for CI.
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

// Same precedence as the app and the migration runner — see src/lib/env.ts.
const databaseUrl = process.env.APP_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.')
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
})
