import { sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/**
 * Delivery options the store owner defines. Nothing about rates is hardcoded —
 * amounts, thresholds, districts and delivery estimates are all editable in
 * admin, because they are business decisions that change without a deploy.
 *
 * Shaped for how Bangladeshi stores actually price delivery: a rate for Dhaka,
 * another for everywhere else, each with its own cost and optional
 * free-over-this-amount threshold.
 */
export const shippingRates = pgTable(
  'shipping_rates',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),

    /** Shown to the customer at checkout, e.g. "Inside Dhaka". */
    name: text('name').notNull(),
    description: text('description'),

    /** Integer poisha, like every other amount in the system. */
    cost: integer('cost').notNull(),

    /**
     * Subtotal at or above which this rate becomes free. Null means never free.
     * Per-rate rather than store-wide: free delivery inside Dhaka at ৳2,000 but
     * not nationwide is a normal thing to want.
     */
    freeOverSubtotal: integer('free_over_subtotal'),

    /**
     * Districts this rate covers. An EMPTY array is the fallback that applies
     * anywhere not matched by a more specific rate — without one, a customer in
     * an unlisted district would have no way to check out at all.
     */
    districts: jsonb('districts').$type<string[]>().notNull().default([]),

    estimatedDaysMin: integer('estimated_days_min').notNull().default(2),
    estimatedDaysMax: integer('estimated_days_max').notNull().default(5),

    /** Lower sorts first, and decides which rate wins when several match. */
    position: integer('position').notNull().default(0),
    active: boolean('active').notNull().default(true),

    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [index('shipping_rates_active_idx').on(t.active, t.position)],
)

export type ShippingRate = typeof shippingRates.$inferSelect
