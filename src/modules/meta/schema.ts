import { relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { orders } from '@/modules/orders/schema'

/**
 * Admin-managed Meta integration configuration.
 *
 * One row is used by the current single-store application (`default`). Keeping
 * a store key in the model makes the boundary explicit and lets future client
 * deployments add store scoping without redesigning the secret contract.
 *
 * The CAPI access token is AES-256-GCM encrypted before it reaches this table.
 * It is never returned to a client component.
 */
export const metaIntegrationSettings = pgTable('meta_integration_settings', {
  storeKey: text('store_key').primaryKey().default('default'),
  trackingEnabled: boolean('tracking_enabled').notNull().default(false),
  pixelId: text('pixel_id'),
  datasetId: text('dataset_id'),
  accessTokenEncrypted: text('access_token_encrypted'),
  testEventCode: text('test_event_code'),
  domainVerification: text('domain_verification'),
  lastConnectionTestAt: timestamp('last_connection_test_at'),
  lastConnectionStatus: text('last_connection_status'),
  lastConnectionMessage: text('last_connection_message'),
  lastSuccessfulEventAt: timestamp('last_successful_event_at'),
  lastSuccessfulEventName: text('last_successful_event_name'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

/**
 * Consent-scoped attribution captured when the order is created.
 *
 * It is separate from the accounting record so tracking identifiers can be
 * removed without changing the immutable commercial order snapshot.
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

/**
 * A tiny Postgres-backed outbox for paid-order Purchase events.
 *
 * The unique event id prevents application replay; Meta receives the same id
 * from Pixel and CAPI and performs cross-channel deduplication as well.
 */
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

export const metaOrderAttributionsRelations = relations(metaOrderAttributions, ({ one }) => ({
  order: one(orders, {
    fields: [metaOrderAttributions.orderId],
    references: [orders.id],
  }),
}))

export const metaEventDeliveriesRelations = relations(metaEventDeliveries, ({ one }) => ({
  order: one(orders, { fields: [metaEventDeliveries.orderId], references: [orders.id] }),
}))
