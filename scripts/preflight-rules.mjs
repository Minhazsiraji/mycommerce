/**
 * Deployment configuration checks.
 *
 * `clone:audit` reads the source and asks "could this codebase be sold?".
 * Preflight reads the environment and asks "is THIS deployment coherent?" — a
 * different question with different failure modes. A store can pass the audit
 * and still be configured to display one currency while charging another, or to
 * take live card payments from a Preview build, or to offer a customer no way
 * to pay at all.
 *
 * Pure so it can be tested against fixtures rather than only against whatever
 * happens to be in the shell.
 */

/** Values the browser renders too, so both names must agree. */
const SHARED = [
  'STORE_CURRENCY',
  'STORE_COUNTRY_CODE',
  'STORE_CURRENCY_SYMBOL',
  'STORE_CURRENCY_MINOR_UNITS',
  'STORE_NUMBER_LOCALE',
  'STORE_TAX_MODE',
  'STORE_TAX_RATE_BASIS_POINTS',
  'STORE_TAX_LABEL',
  'STORE_TAX_ON_SHIPPING',
]

const TAX_MODES = ['none', 'inclusive', 'exclusive']

/** Origins that belong to the original store and must never be a clone's. */
const SOURCE_ORIGINS = ['sirajibd.com']

export function preflight(env) {
  const errors = []
  const warnings = []

  const value = (name) => env[name]?.trim() || ''
  const isProduction = value('VERCEL_ENV') === 'production'
  const isPreview = value('VERCEL_ENV') === 'preview'

  const currency = value('NEXT_PUBLIC_STORE_CURRENCY') || value('STORE_CURRENCY') || 'BDT'
  const country = value('NEXT_PUBLIC_STORE_COUNTRY_CODE') || value('STORE_COUNTRY_CODE') || 'BD'
  const canonical = value('STORE_CANONICAL_URL')
  const name = value('STORE_NAME')

  if (isProduction && !name) errors.push('STORE_NAME is required for a production deployment')
  if (isProduction && !canonical) {
    errors.push('STORE_CANONICAL_URL is required for a production deployment')
  }

  for (const shared of SHARED) {
    const pub = value(`NEXT_PUBLIC_${shared}`)
    const priv = value(shared)

    if (priv && !pub) {
      errors.push(`${shared} is set without NEXT_PUBLIC_${shared}; the browser would use the default`)
    } else if (pub && priv && pub.toLowerCase() !== priv.toLowerCase()) {
      errors.push(`NEXT_PUBLIC_${shared} ("${pub}") and ${shared} ("${priv}") disagree`)
    }
  }

  if (!/^[A-Za-z]{3}$/.test(currency)) {
    errors.push(`Currency "${currency}" is not a three-letter ISO 4217 code`)
  }
  if (!/^[A-Za-z]{2}$/.test(country)) {
    errors.push(`Country "${country}" is not a two-letter ISO 3166-1 code`)
  }

  // Payment: a storefront nobody can buy from is worse than one that will not build.
  const hasSslcommerz = Boolean(value('SSLCOMMERZ_STORE_ID') && value('SSLCOMMERZ_STORE_PASSWORD'))
  const hasBank = Boolean(
    value('BANK_ACCOUNT_NAME') && value('BANK_ACCOUNT_NUMBER') && value('BANK_NAME'),
  )
  const codEnabled = value('STORE_COD_ENABLED') !== 'false'

  if (!codEnabled && !hasSslcommerz && !hasBank) {
    errors.push(
      'No payment method is available: cash on delivery is disabled and no gateway or bank details are configured',
    )
  }

  const sandbox = value('SSLCOMMERZ_SANDBOX')
  if (sandbox === 'false' && !hasSslcommerz) {
    errors.push('SSLCOMMERZ_SANDBOX is false but no SSLCommerz credentials are configured')
  }
  if (sandbox === 'false' && !isProduction) {
    errors.push(
      `SSLCOMMERZ_SANDBOX is false outside production (VERCEL_ENV="${value('VERCEL_ENV') || 'unset'}") — this deployment would take real payments`,
    )
  }
  if (isProduction && hasSslcommerz && sandbox !== 'false' && sandbox !== '') {
    warnings.push('Production is running SSLCommerz in sandbox mode; no real payment can complete')
  }

  // Identity: a clone must never point at the original store's origin.
  if (canonical && !isProduction) {
    for (const origin of SOURCE_ORIGINS) {
      if (canonical.toLowerCase().includes(origin)) {
        errors.push(
          `STORE_CANONICAL_URL points at ${origin} on a non-production deployment; a clone must use its own domain`,
        )
      }
    }
  }
  if (name && /sirajibd/i.test(name) && canonical && !/sirajibd\.com/i.test(canonical)) {
    warnings.push('STORE_NAME looks like the original store but the canonical URL does not match')
  }

  const taxMode = value('NEXT_PUBLIC_STORE_TAX_MODE') || value('STORE_TAX_MODE') || 'none'
  if (!TAX_MODES.includes(taxMode)) {
    errors.push(`STORE_TAX_MODE "${taxMode}" must be one of: ${TAX_MODES.join(', ')}`)
  }

  const rateRaw =
    value('NEXT_PUBLIC_STORE_TAX_RATE_BASIS_POINTS') || value('STORE_TAX_RATE_BASIS_POINTS') || '0'
  const rate = Number(rateRaw)
  if (!Number.isInteger(rate) || rate < 0 || rate > 10_000) {
    errors.push(`Tax rate "${rateRaw}" must be a whole number of basis points between 0 and 10000`)
  } else if (taxMode !== 'none' && rate === 0) {
    warnings.push(`Tax mode is "${taxMode}" but the rate is 0, so no tax line will appear`)
  } else if (taxMode === 'none' && rate > 0) {
    warnings.push('A tax rate is configured but the mode is "none", so it is ignored')
  }

  if (isPreview && value('NEXT_PUBLIC_STORE_GOOGLE_TAG_ID')) {
    warnings.push('Preview has a Google tag configured; Preview traffic will be reported')
  }

  return { errors, warnings }
}
