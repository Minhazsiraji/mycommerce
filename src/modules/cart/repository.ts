import 'server-only'

import { and, asc, eq, isNull, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
// Another module's TABLES come from the shared schema barrel, not from that
// module's folder. The barrel is the canonical description of the database, and
// joining across tables is not the coupling the boundary rule guards against —
// importing another module's service or repository would be.
import { productImages, products, productVariants } from '@/lib/db/schema'

import { cartItems, carts } from './schema'

/**
 * The only place Drizzle is called for cart data.
 *
 * Every read joins live product data. The cart never displays a price from its
 * own row — `cart_items.unit_price` exists solely to detect that the price has
 * changed since the item was added.
 */

export type CartLine = {
  id: string
  variantId: string
  productSlug: string
  productTitle: string
  variantTitle: string | null
  sku: string
  imageKey: string | null
  /** Live price, from product_variants. */
  unitPrice: number
  /** Price when the line was added, for a "price changed" notice. */
  addedPrice: number
  quantity: number
  availableStock: number
  /** Product is archived, draft, or the variant was archived. */
  unavailable: boolean
  lineTotal: number
}

export async function findCartByUser(userId: string) {
  return db.query.carts.findFirst({ where: eq(carts.userId, userId) })
}

export async function findCartBySession(token: string) {
  return db.query.carts.findFirst({ where: eq(carts.sessionToken, token) })
}

export async function createCart(owner: { userId: string } | { sessionToken: string }) {
  const [row] = await db
    .insert(carts)
    .values('userId' in owner ? { userId: owner.userId } : { sessionToken: owner.sessionToken })
    .returning()

  if (!row) throw new Error('Cart insert returned no row')
  return row
}

/** Lines with live product data joined in. */
export async function listLines(cartId: string): Promise<CartLine[]> {
  const rows = await db
    .select({
      id: cartItems.id,
      variantId: cartItems.variantId,
      quantity: cartItems.quantity,
      addedPrice: cartItems.unitPrice,
      unitPrice: productVariants.price,
      availableStock: productVariants.stock,
      variantTitle: productVariants.title,
      sku: productVariants.sku,
      variantArchivedAt: productVariants.archivedAt,
      productSlug: products.slug,
      productTitle: products.title,
      productStatus: products.status,
      imageKey: sql<string | null>`(
        select ${productImages.r2Key}
        from ${productImages}
        where ${productImages.productId} = ${products.id}
        order by ${productImages.position}
        limit 1
      )`,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt))

  return rows.map((r) => ({
    id: r.id,
    variantId: r.variantId,
    productSlug: r.productSlug,
    productTitle: r.productTitle,
    variantTitle: r.variantTitle,
    sku: r.sku,
    imageKey: r.imageKey,
    unitPrice: r.unitPrice,
    addedPrice: r.addedPrice,
    quantity: r.quantity,
    availableStock: r.availableStock,
    unavailable: r.productStatus !== 'active' || r.variantArchivedAt !== null,
    lineTotal: r.unitPrice * r.quantity,
  }))
}

export async function findLine(lineId: string) {
  return db.query.cartItems.findFirst({ where: eq(cartItems.id, lineId) })
}

/** A variant is only purchasable if both it and its product are live. */
export async function findPurchasableVariant(variantId: string) {
  const [row] = await db
    .select({
      id: productVariants.id,
      price: productVariants.price,
      stock: productVariants.stock,
      productTitle: products.title,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        eq(productVariants.id, variantId),
        isNull(productVariants.archivedAt),
        eq(products.status, 'active'),
      ),
    )
    .limit(1)

  return row
}

/**
 * Adds to an existing line rather than creating a duplicate, matching the
 * unique index on (cart_id, variant_id).
 */
export async function upsertLine(input: {
  cartId: string
  variantId: string
  quantity: number
  unitPrice: number
  cap: number
}) {
  await db
    .insert(cartItems)
    .values({
      cartId: input.cartId,
      variantId: input.variantId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
    })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.variantId],
      set: {
        quantity: sql`least(${cartItems.quantity} + ${input.quantity}, ${input.cap})`,
        unitPrice: input.unitPrice,
        updatedAt: new Date(),
      },
    })

  await touch(input.cartId)
}

export async function setLineQuantity(lineId: string, quantity: number) {
  await db
    .update(cartItems)
    .set({ quantity, updatedAt: new Date() })
    .where(eq(cartItems.id, lineId))
}

export async function deleteLine(lineId: string) {
  await db.delete(cartItems).where(eq(cartItems.id, lineId))
}

export async function deleteCart(cartId: string) {
  await db.delete(carts).where(eq(carts.id, cartId))
}

export async function touch(cartId: string) {
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId))
}

/**
 * Moves a guest cart's lines onto the user's cart, then discards the guest one.
 *
 * Quantities are summed and capped rather than overwritten: someone who added
 * two on their phone and one signed in expects three, not one.
 */
export async function mergeCarts(guestCartId: string, userCartId: string, cap: number) {
  await db.transaction(async (tx) => {
    const guestLines = await tx.select().from(cartItems).where(eq(cartItems.cartId, guestCartId))

    for (const line of guestLines) {
      await tx
        .insert(cartItems)
        .values({
          cartId: userCartId,
          variantId: line.variantId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })
        .onConflictDoUpdate({
          target: [cartItems.cartId, cartItems.variantId],
          set: {
            quantity: sql`least(${cartItems.quantity} + ${line.quantity}, ${cap})`,
            updatedAt: new Date(),
          },
        })
    }

    await tx.delete(carts).where(eq(carts.id, guestCartId))
    await tx.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, userCartId))
  })
}

/** Reassigns a guest cart to a user when they have no cart of their own. */
export async function claimCart(cartId: string, userId: string) {
  await db
    .update(carts)
    .set({ userId, sessionToken: null, updatedAt: new Date() })
    .where(eq(carts.id, cartId))
}
