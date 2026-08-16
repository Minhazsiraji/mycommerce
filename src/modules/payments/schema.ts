import { sql } from 'drizzle-orm'
import {
  char,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

import { users } from '@/modules/accounts/schema'
import { orders } from '@/modules/orders/schema'

export const PAYMENT_PROVIDERS = ['sslcommerz', 'bank_transfer', 'cod'] as const

/**
 * One row per payment *attempt*, not per order.
 *
 * A customer whose card is declined and who then pays by transfer must leave
 * two rows behind — collapsing to one loses the failure, which is exactly the
 * history you need when someone disputes a charge.
 */
export const payments = pgTable(
  'payments',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),

    provider: text('provider').notNull(),
    /** Gateway's own identifier. Null until the gateway assigns one. */
    providerRef: text('provider_ref'),

    amount: integer('amount').notNull(),
    currency: char('currency', { length: 3 }).notNull().default('BDT'),
    status: text('status').notNull().default('pending'),

    /** Full provider response, kept for disputes and reconciliation. */
    rawPayload: jsonb('raw_payload'),

    /* --- manual bank transfer only, null for gateway payments --- */

    /** Transaction reference the customer typed in. */
    submittedReference: text('submitted_reference'),
    /** Storage key of the uploaded receipt. Evidence for a human, never proof. */
    proofKey: text('proof_key'),
    /** Admin who confirmed it against the bank statement. */
    verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'set null' }),
    verifiedAt: timestamp('verified_at'),
    /** Amount the admin actually observed, checked against the order total. */
    verifiedAmount: integer('verified_amount'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('payments_order_idx').on(t.orderId),
    index('payments_provider_ref_idx').on(t.provider, t.providerRef),
    // Drives the admin verification queue.
    index('payments_status_idx').on(t.status, t.createdAt),
  ],
)

/**
 * Idempotency for provider callbacks.
 *
 * The unique index IS the dedupe: inserting is the check. If it conflicts the
 * event was already handled, so the handler returns 200 and stops. Without
 * this, a provider retry — which they all do — would mark an order paid twice
 * and could double-decrement stock.
 */
export const webhookEvents = pgTable(
  'webhook_events',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    payload: jsonb('payload'),
    receivedAt: timestamp('received_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('webhook_events_provider_event_idx').on(t.provider, t.eventId)],
)

export type Payment = typeof payments.$inferSelect
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number]
