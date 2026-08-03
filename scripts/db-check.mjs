/**
 * Connectivity and transaction smoke check against the configured database.
 * Run with: node scripts/db-check.mjs
 *
 * Verifies the migration landed and that the driver supports the interactive
 * transactions checkout depends on.
 */
import { config } from 'dotenv'
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

config({ path: '.env.local' })
config({ path: '.env' })

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

try {
  const tables = await pool.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  )
  console.log('tables:', tables.rows.map((r) => r.table_name).join(', '))

  const version = await pool.query('select version()')
  console.log('server:', version.rows[0].version.split(' ').slice(0, 2).join(' '))

  // The capability neon-http lacks: BEGIN, conditional work, ROLLBACK.
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("insert into users (id, name, email) values ('tx-probe', 'probe', 'probe@local')")
    const mid = await client.query("select count(*)::int as n from users where id='tx-probe'")
    await client.query('ROLLBACK')
    const after = await client.query("select count(*)::int as n from users where id='tx-probe'")
    console.log(
      `interactive transaction: inside=${mid.rows[0].n} after rollback=${after.rows[0].n}`,
      mid.rows[0].n === 1 && after.rows[0].n === 0 ? '=> OK' : '=> FAILED',
    )
  } finally {
    client.release()
  }
} finally {
  await pool.end()
}
