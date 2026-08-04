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
import { productVariants } from '@/modules/catalog/schema'

/** Frozen copy of the delivery address. Never a foreign key — see below. */
export type AddressSnapshot = {
  recipient: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  district: string
  postalCode?: string | null
  country: string
}

/**
 * Three independent status fields, not one.
 *
 * An order can be paid but unfulfilled, or shipped and then refunded. Collapsing
 * these into a single enum forces invented combinations like
 * "paid_and_shipped_but_partially_refunded" and makes every query about one
 * dimension depend on the others.
 */
export const ORDER_STATUS = ['pending', 'confirmed', 'cancelled'] as const
export const PAYMENT_STATUS = [
  'unpaid',
  'awaiting_transfer',
  'awaiting_verification',
  'paid',
  'failed',
  'refunded',
] as const
export const FULFILLMENT_STATUS = ['unfulfilled', 'processing', 'shipped', 'delivered'] as const

export const orders = pgTable(
  'orders',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    /** Human-readable, for support conversations. The UUID is not sayable aloud. */
    orderNumber: text('order_number').notNull(),

    /** Null for guests, and nulled rather than cascaded on account deletion — */
    /** orders are retained for tax and accounting (docs/04-security.md). */
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    email: text('email').notNull(),
    phone: text('phone'),

    status: text('status').notNull().default('pending'),
    paymentStatus: text('payment_status').notNull().default('unpaid'),
    fulfillmentStatus: text('fulfillment_status').notNull().default('unfulfilled'),

    /** All integer poisha. Recomputed server-side; never taken from the client. */
    subtotal: integer('subtotal').notNull(),
    shippingCost: integer('shipping_cost').notNull().default(0),
    taxAmount: integer('tax_amount').notNull().default(0),
    discountAmount: integer('discount_amount').notNull().default(0),
    total: integer('total').notNull(),
    currency: char('currency', { length: 3 }).notNull().default('BDT'),

    /**
     * Snapshots, not foreign keys. Customers edit and delete saved addresses,
     * and a dispatched order must not silently change destination.
     */
    shippingAddress: jsonb('shipping_address').$type<AddressSnapshot>().notNull(),
    billingAddress: jsonb('billing_address').$type<AddressSnapshot>(),

    paymentMethod: text('payment_method').notNull(),
    notes: text('notes'),

    /**
     * Stock is reserved the moment the order is created. If payment never
     * completes, a cron releases it after this passes — 30 minutes for a
     * gateway checkout, 72 hours for a bank transfer.
     */
    stockHoldExpiresAt: timestamp('stock_hold_expires_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('orders_number_idx').on(t.orderNumber),
    index('orders_user_idx').on(t.userId, t.createdAt),
    // Guest order lookup has no user id to filter on, and support runs it
    // constantly — see docs/02-data-model.md indexing.
    index('orders_email_idx').on(t.email, t.createdAt),
    // Drives the release-expired-holds cron.
    index('orders_hold_idx').on(t.paymentStatus, t.stockHoldExpiresAt),
  ],
)

/**
 * Denormalised snapshots. An order from last year must render correctly after
 * the product is renamed, repriced or archived, so title, SKU and price are
 * copied in. The variant reference exists for analytics only and is nulled if
 * the variant ever disappears.
 */
export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),

    productTitle: text('product_title').notNull(),
    variantTitle: text('variant_title'),
    sku: text('sku').notNull(),
    /** Slug at purchase time, so order history can still link to the product. */
    productSlug: text('product_slug'),
    imageKey: text('image_key'),

    unitPrice: integer('unit_price').notNull(),
    quantity: integer('quantity').notNull(),
    lineTotal: integer('line_total').notNull(),
  },
  (t) => [index('order_items_order_idx').on(t.orderId)],
)

export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type OrderStatus = (typeof ORDER_STATUS)[number]
export type PaymentStatus = (typeof PAYMENT_STATUS)[number]
export type FulfillmentStatus = (typeof FULFILLMENT_STATUS)[number]
