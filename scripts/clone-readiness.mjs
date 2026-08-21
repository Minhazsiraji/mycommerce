import fs from 'node:fs'
import path from 'node:path'

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
assert(storeConfig.includes('process.env.STORE_CANONICAL_URL'), 'Canonical origin must be configurable')
assert(storeConfig.includes('process.env.STORE_NAME'), 'Store name must be configurable')
assert(storeConfig.includes('process.env.STORE_CURRENCY'), 'Store currency must be configurable')

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
 * The audit used to look only for the full origin `https://sirajibd.com`, which
 * meant 36 bare "SirajiBD" literals sat in the legal and content pages and the
 * gate still reported PASS. A client's Terms and Privacy naming another
 * business is the most expensive possible clone defect, so the store name and
 * bare host are now failures in their own right.
 *
 * Two narrow exemptions, both deliberate rather than convenient:
 *  - `src/lib/store-config.ts` holds the documented default values.
 *  - the `sirajibd_` / `sirajibd:` prefixes are a frozen storage namespace for
 *    the consent cookie, the Meta dedup keys and the pixel-ready event.
 *    Renaming them would revoke every existing customer's analytics consent and
 *    orphan in-flight deduplication, so they stay put and are invisible to
 *    customers. A clone inherits the prefix; it carries no identity.
 */
const NAMESPACE_PREFIX = /sirajibd[_:]/g
const STORE_IDENTITY = /sirajibd/gi

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
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

    const relative = path.relative(root, full)
    const content = fs.readFileSync(full, 'utf8')

    if (content.includes('https://sirajibd.com') && path.normalize(full) !== allowedSirajiDefaultFile) {
      failures.push(`Hard-coded SirajiBD production origin found in ${relative}`)
    }

    if (path.normalize(full) !== allowedSirajiDefaultFile) {
      // Comments describe the original deployment's history; only shipped
      // strings can reach a client's customers.
      const shipped = stripComments(content).replace(NAMESPACE_PREFIX, '')
      const identity = shipped.match(STORE_IDENTITY)
      if (identity) {
        failures.push(
          `Hard-coded store identity (${identity.length}x "SirajiBD") found in ${relative} — use STORE_CONFIG.name / STORE_HOST`,
        )
      }
    }

    const hardcodedGoogleTag = content.match(/['"`](?:GT|G|AW)-[A-Z0-9-]{5,}['"`]/gi)
    if (hardcodedGoogleTag) {
      failures.push(`Hard-coded Google tag ID found in ${relative}`)
    }
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
