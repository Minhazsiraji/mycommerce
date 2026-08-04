/**
 * Public API of the cart module. Server-side only — client components import
 * `./validators` directly, which has no server dependencies.
 */

export { addToCart, mergeGuestCart, removeLine, updateLineQuantity } from './actions'

/** Render-safe read. Never creates a cart; see the note in service.ts. */
export { readCart, type CartLine, type CartView } from './service'

export { MAX_LINE_QUANTITY, addToCartSchema, updateLineSchema } from './validators'

export type { Cart, CartItem } from './schema'
