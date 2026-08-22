import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { POLICY_SETTINGS_ID } from './settings-defaults'

/**
 * Operational numbers the Returns policy quotes to customers.
 *
 * These were prose in the bundled template — "within 7 calendar days", "5–7
 * business days" — which made one retailer's commercial terms the software's
 * default promise to every clone's customers. A return window is a business
 * decision, exactly like a shipping rate or a tax mode.
 *
 * All nullable, and unset means unset: the policy then says the window is
 * confirmed on request rather than inventing a number. A store that wants to
 * state a period states its own.
 */
export const policySettings = pgTable('policy_settings', {
  id: text('id').primaryKey().default(POLICY_SETTINGS_ID),
  returnWindowDays: integer('return_window_days'),
  refundProcessingMinDays: integer('refund_processing_min_days'),
  refundProcessingMaxDays: integer('refund_processing_max_days'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type PolicySettings = typeof policySettings.$inferSelect
