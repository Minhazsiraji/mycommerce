import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Drizzle Kit runs outside Next, so it does not inherit Next's .env.local
// loading. Read it explicitly, falling back to .env for CI.
loadEnv({ path: '.env.local' })
loadEnv({ path: '.env' })

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.')
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  casing: 'snake_case',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
})
