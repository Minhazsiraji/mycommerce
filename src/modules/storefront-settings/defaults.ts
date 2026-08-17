export const STOREFRONT_SETTINGS_ID = 'default'

export const DEFAULT_STOREFRONT_SETTINGS = {
  announcementEnabled: true,
  announcementDeliveryText: null as string | null,
  announcementOfferText: null as string | null,
  heroEnabled: true,
  heroTitle: 'Smarter everyday shopping for modern life in Bangladesh.',
  heroDescription:
    'Browse practical products with clear prices and a simple shopping experience built for Bangladesh.',
  heroPrimaryLabel: 'Browse categories',
  heroPrimaryHref: '#categories',
  heroSecondaryLabel: 'Search products',
  heroSecondaryHref: '/search',
  heroBrandText: 'Siraji',
  heroBrandAccent: 'BD',
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
}
