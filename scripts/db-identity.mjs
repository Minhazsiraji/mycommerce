/**
 * Answers "which database is this deployment actually talking to?" without
 * printing a connection string.
 *
 * Written after a preview deployment spent a day appearing to be an isolated
 * clone while reading another store's products, orders and user accounts. The
 * environment variable looked right in the dashboard; only the data proved
 * otherwise. Every claim about isolation should be checkable in one command.
 *
 * Strictly read-only: no INSERT, UPDATE, DELETE or DDL. Safe to point at any
 * environment, including production.
 *
 *   node --env-file=.env.local scripts/db-identity.mjs
 */
import { neonConfig, Pool } from '@neondatabase/serverless'
import ws from 'ws'

if (!globalThis.WebSocket) neonConfig.webSocketConstructor = ws

const databaseUrl = process.env.APP_DATABASE_URL || process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('[db-identity] neither APP_DATABASE_URL nor DATABASE_URL is set')
  process.exit(1)
}

const target = new URL(databaseUrl)
console.log('source variable  :', process.env.APP_DATABASE_URL ? 'APP_DATABASE_URL' : 'DATABASE_URL')
console.log('database name    :', target.pathname.replace(/^\//, '').split('?')[0])
console.log('host suffix      :', target.hostname.split('.').slice(1).join('.'))

const pool = new Pool({ connectionString: databaseUrl })

try {
  const { rows: tables } = await pool.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name",
  )

  console.log('public tables    :', tables.length)

  if (tables.length === 0) {
    console.log('\n=> Empty. No migrations have been applied to this database.')
    process.exit(0)
  }

  // Row counts only. Never row contents — this may be pointed at real customers.
  const has = (name) => tables.some((row) => row.table_name === name)
  for (const table of ['users', 'products', 'orders', 'categories']) {
    if (!has(table)) continue
    const { rows } = await pool.query(`select count(*)::int as n from "${table}"`)
    console.log(`  ${table.padEnd(12)}: ${rows[0].n} rows`)
  }

  if (has('storefront_settings')) {
    const { rows } = await pool.query('select hero_brand_text from storefront_settings limit 1')
    // The fastest way to tell whose storefront this is.
    console.log('  storefront   :', rows[0]?.hero_brand_text ?? '(no settings row)')
  }

  const { rows: leftovers } = await pool.query(
    `select table_name, column_name from information_schema.columns
      where table_schema='public' and column_default is not null
        and (column_default ilike '%BDT%' or column_default ilike '%Siraji%')`,
  )
  console.log(
    '  client defaults:',
    leftovers.length === 0
      ? 'none'
      : leftovers.map((r) => `${r.table_name}.${r.column_name}`).join(', '),
  )
} finally {
  await pool.end()
}
