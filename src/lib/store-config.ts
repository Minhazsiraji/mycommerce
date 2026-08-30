export type StoreTaxMode = 'none' | 'inclusive' | 'exclusive'

export type StoreConfig = {
  name: string
  brandText: string
  brandAccent: string
  canonicalUrl: string
  countryCode: string
  countryName: string
  currency: string
  currencySymbol: string
  currencyMinorUnits: number
  numberLocale: string
  locale: string
  defaultDescription: string
  tax: {
    mode: StoreTaxMode
    rateBasisPoints: number
    label: string
    appliesToShipping: boolean
  }
}

/**
 * Customer-specific sales demo configuration.
 *
 * This branch is intentionally isolated from the live SirajiBD environment.
 * It is a noindex, non-transactional preview used only to demonstrate how the
 * AgentSiraji Commerce buying flow could look for Kountry Feed in Rwanda.
 */
export const STORE_CONFIG: Readonly<StoreConfig> = Object.freeze({
  name: 'Kountry Feed',
  brandText: 'Kountry Feed',
  brandAccent: '',
  canonicalUrl: 'https://kountry-feed-demo.vercel.app',
  countryCode: 'RW',
  countryName: 'Rwanda',
  currency: 'RWF',
  currencySymbol: 'RWF',
  currencyMinorUnits: 0,
  numberLocale: 'en-US',
  locale: 'en-RW',
  defaultDescription:
    'Personalized AgentSiraji Commerce concept for Kountry Feed, showing an easier product-to-order journey while keeping WhatsApp in the sales flow.',
  tax: {
    mode: 'none',
    rateBasisPoints: 0,
    label: 'Tax',
    appliesToShipping: false,
  },
})

export function getStoreUrl(path = '/') {
  return new URL(path, `${STORE_CONFIG.canonicalUrl}/`)
}

export const STORE_HOST = new URL(STORE_CONFIG.canonicalUrl).host
export const STORE_SLUG = 'kountry-feed'
