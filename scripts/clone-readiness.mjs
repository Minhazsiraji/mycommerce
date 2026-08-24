import fs from 'node:fs'
import path from 'node:path'

import { auditFile } from './clone-audit-rules.mjs'

const root = process.cwd()
const failures = []

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function assert(condition, message) {
  if (!condition) failures.push(message)
}

const envExample = read('.env.example')
const requiredEnvKeys = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_APP_URL',
  'STORE_NAME',
  'STORE_BRAND_TEXT',
  'STORE_BRAND_ACCENT',
  'STORE_CANONICAL_URL',
  'STORE_COUNTRY_CODE',
  'STORE_COUNTRY_NAME',
  'STORE_CURRENCY',
  'STORE_LOCALE',
  'STORE_CONTACT_EMAIL',
  'STORE_ADMIN_EMAIL',
  'STORE_CONTACT_PHONE',
  'STORE_BUSINESS_ADDRESS',
  'NEXT_PUBLIC_META_PIXEL_ID',
  'META_CAPI_DATASET_ID',
  'META_CAPI_ACCESS_TOKEN',
  'NEXT_PUBLIC_GOOGLE_TAG_ID',
  'INTEGRATIONS_ENCRYPTION_KEY',
  'SSLCOMMERZ_STORE_ID',
  'SSLCOMMERZ_STORE_PASSWORD',
  'SSLCOMMERZ_SANDBOX',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RESEND_API_KEY',
  'EMAIL_FROM',
]

for (const key of requiredEnvKeys) {
  assert(envExample.includes(key), `.env.example is missing ${key}`)
}

assert(/SSLCOMMERZ_SANDBOX=.*true/.test(envExample), 'SSLCommerz example must default to sandbox=true')
assert(!/META_CAPI_ACCESS_TOKEN="[^"\n]+"/.test(envExample), 'Meta CAPI token must be empty in .env.example')
assert(!/SSLCOMMERZ_STORE_PASSWORD="[^"\n]+"/.test(envExample), 'SSLCommerz password must be empty in .env.example')
assert(!/CLOUDINARY_API_SECRET="[^"\n]+"/.test(envExample), 'Cloudinary secret must be empty in .env.example')
assert(!/RESEND_API_KEY="[^"\n]+"/.test(envExample), 'Resend API key must be empty in .env.example')

const storeConfig = read('src/lib/store-config.ts')
assert(storeConfig.includes('STORE_CANONICAL_URL'), 'Canonical origin must be configurable')
assert(storeConfig.includes('STORE_NAME'), 'Store name must be configurable')
assert(storeConfig.includes('process.env.STORE_CURRENCY'), 'Store currency must be configurable')

/**
 * The identity a misconfigured deployment falls back to must be nobody's.
 * While these defaults read "SirajiBD", any clone that missed a variable served
 * another company's name and canonical URL, and the product was white-label in
 * documentation only.
 */
assert(
  !/\|\|\s*['"`]SirajiBD['"`]/.test(storeConfig) &&
    !/\|\|\s*['"`]https:\/\/sirajibd\.com['"`]/.test(storeConfig),
  'Store identity must not fall back to a specific business — see docs/CLONE_READINESS.md',
)
assert(
  storeConfig.includes("VERCEL_ENV === 'production'"),
  'A production deployment must fail rather than serve placeholder store identity',
)

const siteMetadata = read('src/lib/site-metadata.ts')
assert(siteMetadata.includes("vercelEnv === 'production'"), 'Only Production should be indexable')

const robots = read('src/app/robots.ts')
assert(robots.includes("disallow: '/'"), 'Non-production robots policy must disallow crawling')

const merchantFeed = read('src/app/google-merchant-feed.xml/route.ts')
assert(merchantFeed.includes('STORE_CONFIG.canonicalUrl'), 'Merchant feed URLs must use configured canonical origin')
assert(merchantFeed.includes('STORE_CONFIG.currency'), 'Merchant feed must use configured currency')

const envRuntime = read('src/lib/env.ts')
assert(envRuntime.includes('SSLCOMMERZ_SANDBOX'), 'Runtime must expose explicit SSLCommerz sandbox/live mode')
assert(envRuntime.includes('NEXT_PUBLIC_GOOGLE_TAG_ID'), 'Google tag must be clone-configurable')
assert(envRuntime.includes('NEXT_PUBLIC_META_PIXEL_ID'), 'Meta Pixel must be clone-configurable')
assert(envRuntime.includes('META_CAPI_ACCESS_TOKEN'), 'Meta CAPI must be deployment-configurable')

const sourceRoot = path.join(root, 'src')
const allowedSirajiDefaultFile = path.normalize(path.join(sourceRoot, 'lib', 'store-config.ts'))

/**
 * Client-specific values must not sit in the schema as column defaults.
 *
 * `orders.currency DEFAULT 'BDT'` was the dangerous one: the application looked
 * correct because it wrote currency explicitly on one path, while the payment
 * row it inserted alongside quietly took the default — so a non-BDT store would
 * have recorded a BDT payment against a non-BDT order and failed verification.
 * `storefront_settings` was the embarrassing one: it shipped the original
 * store's wordmark and copyright as every clone's starting homepage copy.
 */
const CLIENT_DEFAULT = /\.default\(\s*['"`](?:BDT|BD|Siraji[^'"`]*|৳|\+?880[^'"`]*|[^'"`]*sirajibd[^'"`]*)['"`]\s*\)/i

for (const file of fs.globSync('src/**/schema.ts', { cwd: root })) {
  const content = read(file)
  const offending = content.split('\n').filter((line) => CLIENT_DEFAULT.test(line))
  for (const line of offending) {
    failures.push(`Client-specific column default in ${file}: ${line.trim()}`)
  }
}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    if (!/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) continue
    if (/\.test\./.test(entry.name)) continue

    failures.push(
      ...auditFile(path.relative(root, full), fs.readFileSync(full, 'utf8'), {
        allowStoreDefaults: path.normalize(full) === allowedSirajiDefaultFile,
      }),
    )
  }
}

walk(sourceRoot)

if (failures.length) {
  console.error('[clone:audit] FAILED')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('[clone:audit] PASS')
console.log('- deployment identity is configurable')
console.log('- integration credentials remain deployment/admin configuration')
console.log('- SSLCommerz example is sandbox-first')
console.log('- Preview indexing protection is present')
console.log('- Merchant feed uses configured origin/currency')
console.log('- no unexpected SirajiBD production origin or Google tag is hard-coded in runtime source')
console.log('- no store name or host is hard-coded in shipped strings, including legal and content pages')
