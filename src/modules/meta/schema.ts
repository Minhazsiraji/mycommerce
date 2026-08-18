import { relations, sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { orders } from '@/modules/orders/schema'

/**
 * Consent-scoped attribution captured when the order is created.
 * It is separate from the commercial order so tracking identifiers can be
 * removed without changing the immutable accounting record.
 */
export const metaOrderAttributions = pgTable('meta_order_attributions', {
  orderId: uuid('order_id')
    .primaryKey()
    .references(() => orders.id, { onDelete: 'cascade' }),
  fbp: text('fbp'),
  fbc: text('fbc'),
  clientUserAgent: text('client_user_agent').notNull(),
  eventSourceUrl: text('event_source_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

/** A Postgres-backed outbox for paid-order Purchase events. */
export const metaEventDeliveries = pgTable(
  'meta_event_deliveries',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    eventId: text('event_id').notNull(),
    eventName: text('event_name').notNull(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('meta_event_deliveries_event_idx').on(table.eventId),
    index('meta_event_deliveries_retry_idx').on(table.status, table.attempts, table.createdAt),
  ],
)

/**
 * Store-owned Meta integration configuration.
 *
 * The only credential is stored as authenticated ciphertext. Public identifiers
 * remain readable so the server can safely hand the Pixel id to the browser.
 * A clone gets its own row/database, while store_key leaves room for a future
 * multi-store control plane without redesigning the contract.
 */
export const metaIntegrationSettings = pgTable('meta_integration_settings', {
  storeKey: text('store_key').primaryKey().default('default'),
  enabled: boolean('enabled').notNull().default(false),
  pixelId: text('pixel_id'),
  datasetId: text('dataset_id'),
  accessTokenEncrypted: text('access_token_encrypted'),
  testEventCode: text('test_event_code'),
  domainVerificationCode: text('domain_verification_code'),
  lastTestStatus: text('last_test_status'),
  lastTestMessage: text('last_test_message'),
  lastTestedAt: timestamp('last_tested_at'),
  lastSuccessfulEventName: text('last_successful_event_name'),
  lastSuccessfulEventAt: timestamp('last_successful_event_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const metaOrderAttributionsRelations = relations(metaOrderAttributions, ({ one }) => ({
  order: one(orders, {
    fields: [metaOrderAttributions.orderId],
    references: [orders.id],
  }),
}))

export const metaEventDeliveriesRelations = relations(metaEventDeliveries, ({ one }) => ({
  order: one(orders, { fields: [metaEventDeliveries.orderId], references: [orders.id] }),
}))
