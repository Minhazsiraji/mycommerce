/**
 * Promotes a registered user to admin.
 *
 * `role` is deliberately not settable through any request — see invariant 12 in
 * docs/04-security.md — so the first admin has to be made out of band. Run:
 *
 *   node --env-file=.env.local scripts/make-admin.mjs you@example.com
 *
 * Targets APP_DATABASE_URL when set, falling back to DATABASE_URL — the same
 * precedence the application and the migration runner use. Granting admin on
 * one database while the deployment reads another is the specific way this
 * script could do real damage: it would look like it worked, the promoted
 * account would still be a customer, and the row it did change would be in
 * whichever database DATABASE_URL happens to point at.
 *
 * The account must already exist; register through the site first.
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

import { describeDatabase, resolveDatabaseUrl } from './database-url.mjs'

const email = process.argv[2]

if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/make-admin.mjs <email>')
  process.exit(1)
}

const { url: databaseUrl, source } = resolveDatabaseUrl()

if (!databaseUrl) {
  console.error('Neither APP_DATABASE_URL nor DATABASE_URL is set. Pass --env-file=.env.local')
  process.exit(1)
}

// Names the target so an operator can see which store they are about to grant
// admin on. Never the URL itself.
const target = describeDatabase(databaseUrl)
if (!target) {
  console.error('The database URL is not parseable')
  process.exit(1)
}
console.log(`[make-admin] database ${target} (via ${source})`)

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: databaseUrl })

try {
  const { rows } = await pool.query(
    "update users set role = 'admin', updated_at = now() where lower(email) = lower($1) returning email, role, email_verified",
    [email],
  )

  const user = rows[0]

  if (!user) {
    console.error(`No account found for ${email}. Register on the site first.`)
    process.exit(1)
  }

  console.log(`${user.email} is now ${user.role}`)

  if (!user.email_verified) {
    console.warn('Note: this address is not verified yet, so sign-in will be refused until it is.')
  }
} finally {
  await pool.end()
}
