import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * Store-scoped Google tag configuration.
 *
 * Google tag identifiers are not secrets, but they are store identity. Keeping
 * them in a dedicated table prevents a cloned storefront from inheriting the
 * source store's measurement destination by accident.
 */
export const googleIntegrationSettings = pgTable('google_integration_settings', {
  storeKey: text('store_key').primaryKey().default('default'),
  trackingEnabled: boolean('tracking_enabled').notNull().default(false),
  tagId: text('tag_id'),
  purchaseTrackingEnabled: boolean('purchase_tracking_enabled').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type GoogleIntegrationSettings = typeof googleIntegrationSettings.$inferSelect
