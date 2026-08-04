import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { productVariants } from '@/modules/catalog/schema'

export const MOVEMENT_REASONS = ['order', 'release', 'restock', 'adjustment', 'return'] as const

/**
 * Append-only stock ledger. Never updated, never deleted.
 *
 * `product_variants.stock` is a cached projection of the sum of these rows,
 * maintained inside the same transaction. Keeping the ledger is what makes
 * "why is this count wrong?" answerable — with only a mutable integer, it never
 * is.
 */
export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    variantId: uuid('variant_id')
      .notNull()
      // Restrict, not cascade: deleting a variant must not silently erase the
      // history of what was sold. Variants are archived instead of deleted.
      .references(() => productVariants.id, { onDelete: 'restrict' }),

    /** Signed. Negative for a sale, positive for a restock or release. */
    delta: integer('delta').notNull(),
    reason: text('reason').notNull(),
    /** Order id for sales and releases, admin user id for adjustments. */
    referenceId: uuid('reference_id'),
    note: text('note'),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('inventory_movements_variant_idx').on(t.variantId, t.createdAt)],
)

export type InventoryMovement = typeof inventoryMovements.$inferSelect
export type MovementReason = (typeof MOVEMENT_REASONS)[number]
