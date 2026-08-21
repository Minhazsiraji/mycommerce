/**
 * Checks that THIS deployment's configuration is coherent before it serves
 * customers. Run with the environment loaded, e.g.
 *
 *   node --env-file=.env.local scripts/preflight.mjs
 *
 * Prints variable names and, where it helps, offending values that are already
 * public (currency, country, canonical URL). Never prints a secret.
 */
import { preflight } from './preflight-rules.mjs'

const { errors, warnings } = preflight(process.env)

for (const warning of warnings) console.warn(`[preflight] warning: ${warning}`)

if (errors.length) {
  console.error('[preflight] FAILED')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('[preflight] PASS')
console.log('- store identity is present for this environment')
console.log('- browser and server agree on country, currency and tax')
console.log('- at least one payment method is available')
console.log('- no live payment configuration outside production')
console.log('- canonical origin belongs to this store')
if (warnings.length) console.log(`- ${warnings.length} warning(s) above are not blocking`)
