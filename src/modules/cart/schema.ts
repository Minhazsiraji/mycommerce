import { sql } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

import { users } from '@/modules/accounts/schema'
import { productVariants } from '@/modules/catalog/schema'

/**
 * A cart belongs to a signed-in user OR to an anonymous visitor identified by a
 * signed cookie — never both. Guests must be able to fill a cart before they
 * have an account, because forcing registration first is a measurable
 * conversion loss (docs/02-data-model.md decision 6).
 *
 * On sign-in the guest cart is merged into the user's and then discarded.
 */
export const carts = pgTable(
  'carts',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    /** Random token stored in an httpOnly cookie. Null once the cart has a user. */
    sessionToken: text('session_token'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    // A user has at most one cart; a guest token maps to exactly one.
    uniqueIndex('carts_user_idx').on(t.userId),
    uniqueIndex('carts_session_idx').on(t.sessionToken),
    index('carts_updated_idx').on(t.updatedAt),
  ],
)

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull(),
    /**
     * Price when the item was added, for display only — so the cart can show
     * "price changed since you added this". Checkout ALWAYS recomputes from
     * product_variants; this column is never trusted for money.
     */
    unitPrice: integer('unit_price').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    // Adding the same variant twice bumps quantity rather than duplicating.
    uniqueIndex('cart_items_cart_variant_idx').on(t.cartId, t.variantId),
  ],
)

export type Cart = typeof carts.$inferSelect
export type CartItem = typeof cartItems.$inferSelect
