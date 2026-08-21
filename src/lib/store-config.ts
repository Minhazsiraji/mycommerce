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

const defaultName = required('STORE_NAME', FALLBACK_NAME)
const defaultCountryName = process.env.STORE_COUNTRY_NAME?.trim() || FALLBACK_COUNTRY
const defaultCurrency = (process.env.STORE_CURRENCY?.trim() || 'BDT').toUpperCase()

export const STORE_CONFIG = Object.freeze(
  schema.parse({
    name: defaultName,
    brandText: process.env.STORE_BRAND_TEXT?.trim() || defaultName,
    brandAccent: process.env.STORE_BRAND_ACCENT?.trim() || '',
    canonicalUrl: required('STORE_CANONICAL_URL', 'http://localhost:3000'),
    countryCode: process.env.STORE_COUNTRY_CODE?.trim() || 'BD',
    countryName: defaultCountryName,
    currency: defaultCurrency,
    currencySymbol:
      process.env.STORE_CURRENCY_SYMBOL?.trim() || CURRENCY_SYMBOLS[defaultCurrency] || defaultCurrency,
    currencyMinorUnits: Number(
      process.env.STORE_CURRENCY_MINOR_UNITS?.trim() ||
        (ZERO_DECIMAL_CURRENCIES.has(defaultCurrency) ? 0 : 2),
    ),
    /**
     * Digit grouping only. Kept separate from `locale` and defaulted to en-US
     * because en-BD and en-IN group in lakh/crore ("12,34,567"), and switching
     * the live storefront's price rendering is not a side effect this config
     * change is allowed to have.
     */
    numberLocale: process.env.STORE_NUMBER_LOCALE?.trim() || 'en-US',
    locale: process.env.STORE_LOCALE?.trim() || 'en-BD',
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
