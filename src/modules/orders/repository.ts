import 'server-only'

import { randomBytes } from 'node:crypto'

import { and, desc, eq, lt, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  cartItems,
  carts,
  inventoryMovements,
  payments,
  productImages,
  products,
  productVariants,
} from '@/lib/db/schema'

import { orderItems, orders, type AddressSnapshot } from './schema'

export class OutOfStockError extends Error {
  constructor(readonly productTitle: string) {
    super(`${productTitle} is no longer available in that quantity.`)
  }
}

/**
 * Human-readable and NOT sequential.
 *
 * Support needs something sayable over the phone, but a sequential number would
 * let anyone enumerate orders — and would leak how many the store has taken.
 * Guest lookup additionally requires the matching email (docs/04-security.md,
 * threat 7).
 */
function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6)
  const random = randomBytes(3).toString('hex').toUpperCase()
  return `MC-${stamp}-${random}`
}

export type PlaceOrderArgs = {
  cartId: string
  userId: string | null
  email: string
  phone: string
  address: AddressSnapshot
  shipping: { cost: number; name: string }
  paymentMethod: 'sslcommerz' | 'bank_transfer'
  notes: string | null
  /** 30 minutes for a gateway checkout, 72 hours for a bank transfer. */
  holdMinutes: number
}

/**
 * Creates the order and reserves stock atomically.
 *
 * Everything here either commits together or not at all: stock decrement, order,
 * snapshot line items, the inventory ledger, the payment row, and emptying the
 * cart. A partial commit would either sell stock that was never reserved or
 * reserve stock for an order that does not exist.
 */
export async function placeOrder(args: PlaceOrderArgs) {
  return db.transaction(async (tx) => {
    // Live product data, read inside the transaction.
    const lines = await tx
      .select({
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        sku: productVariants.sku,
        variantTitle: productVariants.title,
        variantArchivedAt: productVariants.archivedAt,
        productTitle: products.title,
        productSlug: products.slug,
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
      .where(eq(cartItems.cartId, args.cartId))

    if (lines.length === 0) throw new Error('Cart is empty')

    for (const line of lines) {
      if (line.productStatus !== 'active' || line.variantArchivedAt !== null) {
        throw new OutOfStockError(line.productTitle)
      }
    }

    /**
     * The conditional decrement. This is what actually prevents overselling.
     *
     * `where stock >= quantity` makes the read and the write one atomic
     * statement — two customers buying the last unit cannot both succeed,
     * because the second update matches zero rows. A read-then-write, however
     * carefully ordered, loses that race.
     */
    for (const line of lines) {
      const result = await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} - ${line.quantity}`, updatedAt: new Date() })
        .where(
          and(
            eq(productVariants.id, line.variantId),
            sql`${productVariants.stock} >= ${line.quantity}`,
          ),
        )

      if (result.rowCount === 0) throw new OutOfStockError(line.productTitle)
    }

    const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0)
    const total = subtotal + args.shipping.cost

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId: args.userId,
        email: args.email,
        phone: args.phone,
        status: 'pending',
        paymentStatus: args.paymentMethod === 'bank_transfer' ? 'awaiting_transfer' : 'unpaid',
        fulfillmentStatus: 'unfulfilled',
        subtotal,
        shippingCost: args.shipping.cost,
        total,
        shippingAddress: args.address,
        paymentMethod: args.paymentMethod,
        notes: args.notes,
        stockHoldExpiresAt: new Date(Date.now() + args.holdMinutes * 60_000),
      })
      .returning()

    if (!order) throw new Error('Order insert returned no row')

    // Snapshots — title, SKU and price copied in, so history survives edits.
    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        variantId: line.variantId,
        productTitle: line.productTitle,
        variantTitle: line.variantTitle,
        sku: line.sku,
        productSlug: line.productSlug,
        imageKey: line.imageKey,
        unitPrice: line.price,
        quantity: line.quantity,
        lineTotal: line.price * line.quantity,
      })),
    )

    // Append-only ledger, so the projection in product_variants.stock is
    // always reconstructable.
    await tx.insert(inventoryMovements).values(
      lines.map((line) => ({
        variantId: line.variantId,
        delta: -line.quantity,
        reason: 'order' as const,
        referenceId: order.id,
      })),
    )

    await tx.insert(payments).values({
      orderId: order.id,
      provider: args.paymentMethod,
      amount: total,
      status: args.paymentMethod === 'bank_transfer' ? 'awaiting_verification' : 'pending',
    })

    // The cart is spent. Emptying it inside the transaction means a failure
    // anywhere above leaves the customer's cart exactly as it was.
    await tx.delete(cartItems).where(eq(cartItems.cartId, args.cartId))
    await tx.delete(carts).where(eq(carts.id, args.cartId))

    return order
  })
}

export function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: { items: true },
  })
}

export function listOrdersForUser(userId: string) {
  return db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  })
}

/** Guest lookup needs BOTH, or an order number alone becomes an oracle. */
export function findGuestOrder(orderNumber: string, email: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.orderNumber, orderNumber), eq(orders.email, email.toLowerCase())),
    with: { items: true },
  })
}

/**
 * Orders whose stock hold has lapsed without payment. Drained by cron: without
 * it, an abandoned checkout holds stock nobody can buy, indefinitely.
 */
export function listExpiredHolds(limit = 50) {
  return db.query.orders.findMany({
    where: and(
      eq(orders.status, 'pending'),
      sql`${orders.paymentStatus} in ('unpaid', 'awaiting_transfer')`,
      // `lt` on a null column is null, so paid orders — whose hold is cleared
      // to null — are excluded without needing a separate check.
      lt(orders.stockHoldExpiresAt, new Date()),
    ),
    with: { items: true },
    limit,
  })
}

/** Returns reserved stock and cancels, atomically. */
export async function releaseHold(orderId: string, reason: 'expired' | 'cancelled') {
  await db.transaction(async (tx) => {
    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId))

    for (const item of items) {
      if (!item.variantId) continue

      await tx
        .update(productVariants)
        .set({ stock: sql`${productVariants.stock} + ${item.quantity}`, updatedAt: new Date() })
        .where(eq(productVariants.id, item.variantId))

      await tx.insert(inventoryMovements).values({
        variantId: item.variantId,
        delta: item.quantity,
        reason: 'release',
        referenceId: orderId,
        note: reason,
      })
    }

    await tx
      .update(orders)
      .set({ status: 'cancelled', stockHoldExpiresAt: null, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
  })
}

export async function markPaid(orderId: string, providerRef: string | null) {
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: 'confirmed',
        paymentStatus: 'paid',
        // Stock is now permanently committed, so the release cron must skip it.
        stockHoldExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    await tx
      .update(payments)
      .set({ status: 'succeeded', providerRef, updatedAt: new Date() })
      .where(eq(payments.orderId, orderId))
  })
}
