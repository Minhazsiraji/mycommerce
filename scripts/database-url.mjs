/**
 * The one place the database precedence is decided for scripts.
 *
 * `src/lib/env.ts` states the same rule for the running application. Scripts
 * cannot import it — they run outside Next and outside the TypeScript build —
 * so the rule lives here for them, and both are covered by tests.
 *
 * It matters that every entry point agrees. A migration runner, an admin
 * promotion and a running app that disagree about which database they mean
 * produce the worst kind of failure: each step reports success against a
 * different database, and only the data shows it.
 */
export function resolveDatabaseUrl(env = process.env) {
  const override = env.APP_DATABASE_URL?.trim()
  const fallback = env.DATABASE_URL?.trim()

  if (override) return { url: override, source: 'APP_DATABASE_URL' }
  if (fallback) return { url: fallback, source: 'DATABASE_URL' }

  return { url: null, source: null }
}

/**
 * Names the target without exposing credentials, so a log line can say which
 * database was touched.
 */
export function describeDatabase(url) {
  try {
    const parsed = new URL(url)
    return `"${parsed.pathname.replace(/^\//, '').split('?')[0]}" on ${parsed.hostname
      .split('.')
      .slice(1)
      .join('.')}`
  } catch {
    return null
  }
}
