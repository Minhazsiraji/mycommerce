/**
 * Promotes a registered user to admin.
 *
 * `role` is deliberately not settable through any request — see invariant 12 in
 * docs/04-security.md — so the first admin has to be made out of band. Run:
 *
 *   node --env-file=.env.local scripts/make-admin.mjs you@example.com
 *
 * The account must already exist; register through the site first.
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

const email = process.argv[2]

if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/make-admin.mjs <email>')
  process.exit(1)
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Pass --env-file=.env.local')
  process.exit(1)
}

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

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
