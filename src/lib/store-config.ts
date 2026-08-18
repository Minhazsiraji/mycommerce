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

const defaultName = process.env.STORE_NAME?.trim() || 'SirajiBD'
const defaultCountryName = process.env.STORE_COUNTRY_NAME?.trim() || 'Bangladesh'

export const STORE_CONFIG = Object.freeze(
  schema.parse({
    name: defaultName,
    brandText: process.env.STORE_BRAND_TEXT?.trim() || 'Siraji',
    brandAccent: process.env.STORE_BRAND_ACCENT?.trim() || 'BD',
    canonicalUrl: process.env.STORE_CANONICAL_URL?.trim() || 'https://sirajibd.com',
    countryCode: process.env.STORE_COUNTRY_CODE?.trim() || 'BD',
    countryName: defaultCountryName,
    currency: process.env.STORE_CURRENCY?.trim() || 'BDT',
    locale: process.env.STORE_LOCALE?.trim() || 'en-BD',
    defaultDescription:
      process.env.STORE_DEFAULT_DESCRIPTION?.trim() ||
      `Shop footwear, apparel, electronics and everyday accessories at ${defaultName} with clear prices, convenient ordering and delivery options across ${defaultCountryName}.`,
  }),
)

export function getStoreUrl(path = '/') {
  return new URL(path, `${STORE_CONFIG.canonicalUrl}/`)
}
