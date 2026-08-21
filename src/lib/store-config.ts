import { z } from 'zod'

const absoluteUrl = z.string().url().transform((value) => value.replace(/\/$/, ''))

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  brandText: z.string().trim().min(1).max(60),
  brandAccent: z.string().trim().max(30),
  canonicalUrl: absoluteUrl,
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  countryName: z.string().trim().min(1).max(80),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  currencySymbol: z.string().trim().min(1).max(8),
  /** Decimal places the currency subdivides into: 2 for BDT/USD, 0 for JPY. */
  currencyMinorUnits: z.number().int().min(0).max(4),
  numberLocale: z.string().trim().min(2).max(20),
  locale: z.string().trim().min(2).max(20),
  defaultDescription: z.string().trim().min(20).max(320),
  tax: z.object({
    mode: z.enum(['none', 'inclusive', 'exclusive']),
    rateBasisPoints: z.number().int().min(0).max(10_000),
    label: z.string().trim().min(1).max(30),
    appliesToShipping: z.boolean(),
  }),
})

/**
 * Symbols for the currencies we can actually render correctly. Anything else
 * falls back to the ISO code, which is always unambiguous and never wrong —
 * "1,999.50 SEK" reads worse than "1 999,50 kr" but cannot mislead a customer
 * about what they are paying.
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  AED: 'د.إ',
  AUD: 'A$',
  BDT: '৳',
  CAD: 'C$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  JPY: '¥',
  LKR: 'Rs',
  MYR: 'RM',
  NPR: 'Rs',
  PKR: '₨',
  SAR: '﷼',
  SGD: 'S$',
  USD: '$',
}

/** Currencies with no minor unit. Everything else we support subdivides by 100. */
const ZERO_DECIMAL_CURRENCIES = new Set(['JPY', 'KRW', 'VND', 'CLP', 'ISK', 'XAF', 'XOF'])

/**
 * The built-in identity is deliberately generic.
 *
 * SirajiBD is Store #1 running on this software, not the software's own name.
 * When the defaults below said "SirajiBD", every clone that forgot a variable
 * silently inherited another company's identity, and the product could not
 * honestly be described as white-label. A clone that misconfigures itself now
 * looks unconfigured instead of looking like someone else.
 */
const FALLBACK_NAME = 'Commerce'
const FALLBACK_COUNTRY = 'Bangladesh'

/**
 * A live storefront must never fall back. Silently serving "Commerce" and a
 * localhost canonical from a real domain would corrupt every canonical tag,
 * sitemap URL and Merchant feed entry before anyone noticed; a failed deploy
 * leaves the previous good build serving. Loud beats silent.
 */
function required(key: 'STORE_NAME' | 'STORE_CANONICAL_URL', fallback: string): string {
  const value = process.env[key]?.trim()
  if (value) return value

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(
      `${key} must be set for a production deployment. Every store, including SirajiBD, configures its own identity — see docs/CLONE_READINESS.md.`,
    )
  }

  return fallback
}

/**
 * Values the browser renders as well as the server.
 *
 * Next only inlines `NEXT_PUBLIC_*` into client bundles, so a currency set only
 * as STORE_CURRENCY is visible to the server and `undefined` in the browser —
 * which meant a store configured for USD served USD from the server and fell
 * back to ৳ in every client-rendered price. Verified by building with
 * STORE_CURRENCY=USD and finding ৳ still in the static chunks.
 *
 * Each is referenced as a literal member expression because `process.env[key]`
 * is not inlined either. Where both names are set and disagree we throw: a
 * split between what the page shows and what the customer is charged must never
 * be something you have to notice.
 */
function shared(
  publicRaw: string | undefined,
  privateRaw: string | undefined,
  name: string,
): string | undefined {
  const isPublic = publicRaw?.trim()
  const isPrivate = privateRaw?.trim()

  if (isPublic && isPrivate && isPublic.toLowerCase() !== isPrivate.toLowerCase()) {
    throw new Error(
      `NEXT_PUBLIC_${name} is "${isPublic}" but ${name} is "${isPrivate}". These must match — the first is what the browser renders, the second is what the server uses.`,
    )
  }

  /**
   * Setting only the private name is the dangerous case, because it looks like
   * it worked: the server honours it and every client-rendered price silently
   * keeps the default. Refuse rather than ship a storefront that disagrees with
   * itself about what the customer is paying.
   */
  if (isPrivate && !isPublic) {
    throw new Error(
      `${name} is set but NEXT_PUBLIC_${name} is not. The browser never sees ${name}, so prices would render with the default currency. Set NEXT_PUBLIC_${name}.`,
    )
  }

  return isPublic
}

const defaultName = required('STORE_NAME', FALLBACK_NAME)
const defaultCountryName = process.env.STORE_COUNTRY_NAME?.trim() || FALLBACK_COUNTRY
const defaultCurrency = (
  shared(process.env.NEXT_PUBLIC_STORE_CURRENCY, process.env.STORE_CURRENCY, 'STORE_CURRENCY') || 'BDT'
).toUpperCase()

export const STORE_CONFIG = Object.freeze(
  schema.parse({
    name: defaultName,
    brandText: process.env.STORE_BRAND_TEXT?.trim() || defaultName,
    brandAccent: process.env.STORE_BRAND_ACCENT?.trim() || '',
    canonicalUrl: required('STORE_CANONICAL_URL', 'http://localhost:3000'),
    countryCode:
      shared(
        process.env.NEXT_PUBLIC_STORE_COUNTRY_CODE,
        process.env.STORE_COUNTRY_CODE,
        'STORE_COUNTRY_CODE',
      ) || 'BD',
    countryName: defaultCountryName,
    currency: defaultCurrency,
    currencySymbol:
      shared(
        process.env.NEXT_PUBLIC_STORE_CURRENCY_SYMBOL,
        process.env.STORE_CURRENCY_SYMBOL,
        'STORE_CURRENCY_SYMBOL',
      ) ||
      CURRENCY_SYMBOLS[defaultCurrency] ||
      defaultCurrency,
    currencyMinorUnits: Number(
      shared(
        process.env.NEXT_PUBLIC_STORE_CURRENCY_MINOR_UNITS,
        process.env.STORE_CURRENCY_MINOR_UNITS,
        'STORE_CURRENCY_MINOR_UNITS',
      ) || (ZERO_DECIMAL_CURRENCIES.has(defaultCurrency) ? 0 : 2),
    ),
    /**
     * Digit grouping only. Kept separate from `locale` and defaulted to en-US
     * because en-BD and en-IN group in lakh/crore ("12,34,567"), and switching
     * the live storefront's price rendering is not a side effect this config
     * change is allowed to have.
     */
    numberLocale:
      shared(
        process.env.NEXT_PUBLIC_STORE_NUMBER_LOCALE,
        process.env.STORE_NUMBER_LOCALE,
        'STORE_NUMBER_LOCALE',
      ) || 'en-US',
    locale: process.env.STORE_LOCALE?.trim() || 'en-BD',
    /**
     * Defaults to 'none', which reproduces the previous behaviour exactly:
     * total = subtotal + shipping, tax_amount 0. A store that wants to disclose
     * tax opts in; no existing deployment's totals move because this setting
     * arrived.
     */
    tax: {
      mode: shared(process.env.NEXT_PUBLIC_STORE_TAX_MODE, process.env.STORE_TAX_MODE, 'STORE_TAX_MODE') || 'none',
      rateBasisPoints: Number(
        shared(
          process.env.NEXT_PUBLIC_STORE_TAX_RATE_BASIS_POINTS,
          process.env.STORE_TAX_RATE_BASIS_POINTS,
          'STORE_TAX_RATE_BASIS_POINTS',
        ) || 0,
      ),
      label:
        shared(process.env.NEXT_PUBLIC_STORE_TAX_LABEL, process.env.STORE_TAX_LABEL, 'STORE_TAX_LABEL') ||
        'Tax',
      appliesToShipping:
        (shared(
          process.env.NEXT_PUBLIC_STORE_TAX_ON_SHIPPING,
          process.env.STORE_TAX_ON_SHIPPING,
          'STORE_TAX_ON_SHIPPING',
        ) || 'false') === 'true',
    },
    defaultDescription:
      process.env.STORE_DEFAULT_DESCRIPTION?.trim() ||
      `Shop at ${defaultName} with clear prices, convenient ordering and delivery options across ${defaultCountryName}.`,
  }),
)

export function getStoreUrl(path = '/') {
  return new URL(path, `${STORE_CONFIG.canonicalUrl}/`)
}

/**
 * The bare hostname, for prose that names the site rather than links to it.
 *
 * Policy pages have to say "purchases made through example.com" somewhere, and
 * a literal there is a clone blocker of the worst kind: a client's Terms would
 * name someone else's business. Deriving it means the sentence follows
 * STORE_CANONICAL_URL like everything else.
 */
export const STORE_HOST = new URL(STORE_CONFIG.canonicalUrl).host

/**
 * Filename-safe store name for downloads (CSV exports, product feeds).
 *
 * Sanitised rather than interpolated raw: the store name is operator-supplied
 * and these values land in a Content-Disposition header, where a quote or a
 * newline would let a bad STORE_NAME rewrite the response headers.
 */
export const STORE_SLUG =
  STORE_CONFIG.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'store'
