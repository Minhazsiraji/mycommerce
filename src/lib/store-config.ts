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
  locale: z.string().trim().min(2).max(20),
  defaultDescription: z.string().trim().min(20).max(320),
})

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

export const STORE_CONFIG = Object.freeze(
  schema.parse({
    name: defaultName,
    brandText: process.env.STORE_BRAND_TEXT?.trim() || defaultName,
    brandAccent: process.env.STORE_BRAND_ACCENT?.trim() || '',
    canonicalUrl: required('STORE_CANONICAL_URL', 'http://localhost:3000'),
    countryCode: process.env.STORE_COUNTRY_CODE?.trim() || 'BD',
    countryName: defaultCountryName,
    currency: process.env.STORE_CURRENCY?.trim() || 'BDT',
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
