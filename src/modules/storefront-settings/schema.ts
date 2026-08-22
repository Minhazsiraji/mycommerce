import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { DEFAULT_STOREFRONT_SETTINGS, STOREFRONT_SETTINGS_ID } from './defaults'

/**
 * Runtime-editable storefront copy and visibility controls.
 *
 * The singleton id keeps today's single-store product simple. It can become a
 * tenant/store id later without changing the fields or admin experience.
 */
export const storefrontSettings = pgTable('storefront_settings', {
  id: text('id').primaryKey().default(STOREFRONT_SETTINGS_ID),
  announcementEnabled: boolean('announcement_enabled')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.announcementEnabled),
  announcementDeliveryText: text('announcement_delivery_text'),
  announcementOfferText: text('announcement_offer_text'),
  heroEnabled: boolean('hero_enabled').notNull().default(DEFAULT_STOREFRONT_SETTINGS.heroEnabled),
  /**
   * The identity-bearing columns carry no database default.
   *
   * A default is frozen into the migration at generate time, so whatever the
   * store was called that day becomes every future clone's starting copy — this
   * table shipped "Siraji" / "BD" / "© @AgentSiraji" for exactly that reason.
   * Reads fall back to DEFAULT_STOREFRONT_SETTINGS, which follows the deployment's
   * own configuration, and writes always supply a full row.
   */
  heroTitle: text('hero_title').notNull(),
  heroDescription: text('hero_description').notNull(),
  heroPrimaryLabel: text('hero_primary_label')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.heroPrimaryLabel),
  heroPrimaryHref: text('hero_primary_href')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.heroPrimaryHref),
  heroSecondaryLabel: text('hero_secondary_label')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.heroSecondaryLabel),
  heroSecondaryHref: text('hero_secondary_href')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.heroSecondaryHref),
  heroBrandText: text('hero_brand_text').notNull(),
  heroBrandAccent: text('hero_brand_accent').notNull(),
  footerBrandText: text('footer_brand_text').notNull(),
  footerBrandAccent: text('footer_brand_accent').notNull(),
  footerDescription: text('footer_description')
    .notNull()
    .default(DEFAULT_STOREFRONT_SETTINGS.footerDescription),
  footerCopyright: text('footer_copyright').notNull(),
  /** Validated through lib/brand-asset before it reaches an img or link tag. */
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type StorefrontSettings = typeof storefrontSettings.$inferSelect
