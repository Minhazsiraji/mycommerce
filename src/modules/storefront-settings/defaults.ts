import { STORE_CONFIG } from '@/lib/store-config'

export const STOREFRONT_SETTINGS_ID = 'default'

/**
 * What a store sees before an admin has edited anything.
 *
 * These previously read "Siraji" / "BD" / "© @AgentSiraji" and named Bangladesh
 * in the hero copy — so a fresh clone's homepage and footer carried another
 * company's wordmark until someone noticed and retyped them. They are the
 * store's own identity now, taken from the same configuration everything else
 * uses, and every value stays editable in Admin.
 */
export const DEFAULT_STOREFRONT_SETTINGS = {
  announcementEnabled: true,
  announcementDeliveryText: null as string | null,
  announcementOfferText: null as string | null,
  heroEnabled: true,
  heroTitle: `Smarter everyday shopping for modern life in ${STORE_CONFIG.countryName}.`,
  heroDescription: `Browse practical products with clear prices and a simple shopping experience built for ${STORE_CONFIG.countryName}.`,
  heroPrimaryLabel: 'Browse categories',
  heroPrimaryHref: '#categories',
  heroSecondaryLabel: 'Search products',
  heroSecondaryHref: '/search',
  heroBrandText: STORE_CONFIG.brandText,
  heroBrandAccent: STORE_CONFIG.brandAccent,
  footerBrandText: STORE_CONFIG.brandText,
  footerBrandAccent: STORE_CONFIG.brandAccent,
  footerDescription:
    'Clear choices. Honest information. A shopping journey you can understand.',
  footerCopyright: `© ${STORE_CONFIG.name}`,
  /** Unset means the wordmark and the bundled neutral icon. */
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
} as const

export type StorefrontSettingsValues = {
  announcementEnabled: boolean
  announcementDeliveryText: string | null
  announcementOfferText: string | null
  heroEnabled: boolean
  heroTitle: string
  heroDescription: string
  heroPrimaryLabel: string
  heroPrimaryHref: string
  heroSecondaryLabel: string
  heroSecondaryHref: string
  heroBrandText: string
  heroBrandAccent: string
  footerBrandText: string
  footerBrandAccent: string
  footerDescription: string
  footerCopyright: string
  logoUrl: string | null
  faviconUrl: string | null
}
