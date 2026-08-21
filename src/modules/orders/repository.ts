import 'server-only'

import { randomBytes } from 'node:crypto'

import { and, count, desc, eq, lt, ne, or, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { CURRENCY } from '@/lib/money'
import {
  cartItems,
  carts,
  inventoryMovements,
  payments,
  categories,
  productImages,
  products,
  productVariants,
  shipments,
} from '@/lib/db/schema'

import { orderItems, orders, type AddressSnapshot } from './schema'
import { initialPaymentState, type CheckoutPaymentMethod } from './payment-methods'
import type { OrderFilters } from './validators'

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
  // 48 random bits keeps the number readable while making collisions and
  // unauthorised guessing materially harder than the previous 24-bit suffix.
  const random = randomBytes(6).toString('hex').toUpperCase()
  return `MC-${stamp}-${random}`
}

export type PlaceOrderArgs = {
  cartId: string
  userId: string | null
  email: string
  phone: string
  address: AddressSnapshot
  shipping: { cost: number; name: string }
  paymentMethod: CheckoutPaymentMethod
  notes: string | null
  /** Null for accepted COD; otherwise the unpaid checkout expiry window. */
  holdMinutes: number | null
  checkoutIp: string
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
    const initialPayment = initialPaymentState(args.paymentMethod)
    // Live product data, read inside the transaction.
    const lines = await tx
      .select({
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        sku: productVariants.sku,
        variantTitle: productVariants.title,
        variantArchivedAt: productVariants.archivedAt,
        productId: products.id,
        productTitle: products.title,
        productSlug: products.slug,
        productStatus: products.status,
        categoryId: products.categoryId,
        categoryName: categories.name,
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
      .leftJoin(categories, eq(products.categoryId, categories.id))
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
        checkoutIp: args.checkoutIp,
        status: initialPayment.orderStatus,
        paymentStatus: initialPayment.paymentStatus,
        fulfillmentStatus: 'unfulfilled',
        subtotal,
        shippingCost: args.shipping.cost,
        total,
        /**
         * Written explicitly rather than left to the column default. The default
         * is 'BDT', and payments/service.ts rejects a gateway result whose
         * currency does not match the order's — so on a store configured for any
         * other currency, relying on the default would fail every online payment
         * after the customer had already been charged.
         */
        currency: CURRENCY,
        shippingAddress: args.address,
        paymentMethod: args.paymentMethod,
        notes: args.notes,
        stockHoldExpiresAt:
          args.holdMinutes === null ? null : new Date(Date.now() + args.holdMinutes * 60_000),
      })
      .returning()

    if (!order) throw new Error('Order insert returned no row')

    // Snapshots — title, SKU and price copied in, so history survives edits.
    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: order.id,
        variantId: line.variantId,
        productId: line.productId,
        categoryId: line.categoryId,
        categoryName: line.categoryName,
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
      status: initialPayment.paymentAttemptStatus,
    })

    // The cart is spent. Emptying it inside the transaction means a failure
    // anywhere above leaves the customer's cart exactly as it was.
    await tx.delete(cartItems).where(eq(cartItems.cartId, args.cartId))
    await tx.delete(carts).where(eq(carts.id, args.cartId))

    return order
  })
}

export const ORDERS_PAGE_SIZE = 25

/** Admin listing. Every status, newest first. */
export async function listOrdersForAdmin(filters: OrderFilters) {
  const where = and(
    filters.status ? eq(orders.status, filters.status) : undefined,
    filters.paymentStatus ? eq(orders.paymentStatus, filters.paymentStatus) : undefined,
    filters.fulfillmentStatus ? eq(orders.fulfillmentStatus, filters.fulfillmentStatus) : undefined,
    // Order number or email — the two things a customer can quote on the phone.
    filters.q
      ? sql`(${orders.orderNumber} ilike ${'%' + filters.q + '%'} or ${orders.email} ilike ${'%' + filters.q + '%'})`
      : undefined,
  )

  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        email: orders.email,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        fulfillmentStatus: orders.fulfillmentStatus,
        total: orders.total,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(ORDERS_PAGE_SIZE)
      .offset((filters.page - 1) * ORDERS_PAGE_SIZE),
    db.select({ n: count() }).from(orders).where(where),
  ])

  return { rows, total: totals?.n ?? 0, pageSize: ORDERS_PAGE_SIZE }
}

export function getOrderById(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: { items: true },
  })
}

export async function setFulfillmentStatus(orderId: string, status: string) {
  return db.transaction(async (tx) => {
    const now = new Date()
    const payableOnDelivery = and(
      eq(orders.paymentMethod, 'cod'),
      eq(orders.paymentStatus, 'cod_pending'),
    )

    const [row] = await tx
      .update(orders)
      .set({ fulfillmentStatus: status, updatedAt: now })
      .where(
        and(
          eq(orders.id, orderId),
          ne(orders.status, 'cancelled'),
          status === 'shipped' || status === 'delivered'
            ? or(eq(orders.paymentStatus, 'paid'), payableOnDelivery)
            : undefined,
          status === 'delivered' ? eq(orders.fulfillmentStatus, 'shipped') : undefined,
          status === 'shipped'
            ? and(
                ne(orders.fulfillmentStatus, 'delivered'),
                sql`exists (select 1 from ${shipments} where ${shipments.orderId} = ${orders.id})`,
              )
            : undefined,
          status === 'unfulfilled' || status === 'processing'
            ? sql`${orders.fulfillmentStatus} not in ('shipped', 'delivered')`
            : undefined,
        ),
      )
      .returning()

    if (
      !row ||
      status !== 'delivered' ||
      row.paymentMethod !== 'cod' ||
      row.paymentStatus !== 'cod_pending'
    ) {
      return row
    }

    const [settled] = await tx
      .update(orders)
      .set({ paymentStatus: 'paid', stockHoldExpiresAt: null, updatedAt: now })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.paymentMethod, 'cod'),
          eq(orders.paymentStatus, 'cod_pending'),
          eq(orders.fulfillmentStatus, 'delivered'),
        ),
      )
      .returning()

    if (!settled) throw new Error('COD settlement did not update the delivered order')

    await tx
      .update(payments)
      .set({ status: 'paid', verifiedAt: now, updatedAt: now })
      .where(
        and(
          eq(payments.orderId, orderId),
          eq(payments.provider, 'cod'),
          eq(payments.status, 'awaiting_collection'),
        ),
      )

    return settled
  })
}

export async function addShipment(input: {
  orderId: string
  carrier: string
  trackingNumber: string | null
}) {
  return db.transaction(async (tx) => {
    // Claim a paid or collect-on-delivery live order before inserting the
    // parcel. This closes the cancellation-vs-shipping race between the
    // service check and this write.
    const [shippable] = await tx
      .update(orders)
      .set({ fulfillmentStatus: 'shipped', updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, input.orderId),
          ne(orders.status, 'cancelled'),
          or(
            eq(orders.paymentStatus, 'paid'),
            and(eq(orders.paymentMethod, 'cod'), eq(orders.paymentStatus, 'cod_pending')),
          ),
          ne(orders.fulfillmentStatus, 'delivered'),
        ),
      )
      .returning({ id: orders.id })

    if (!shippable) return null

    const [shipment] = await tx.insert(shipments).values(input).returning()

    return shipment
  })
}

export function listShipments(orderId: string) {
  return db.select().from(shipments).where(eq(shipments.orderId, orderId))
}

export async function updateShipment(input: {
  id: string
  orderId: string
  carrier: string
  trackingNumber: string | null
}) {
  const [row] = await db
    .update(shipments)
    // orderId is in the predicate, not the update: a mistyped id must miss
    // rather than move someone else's parcel onto this order.
    .set({ carrier: input.carrier, trackingNumber: input.trackingNumber })
    .where(and(eq(shipments.id, input.id), eq(shipments.orderId, input.orderId)))
    .returning()

  return row
}

/**
 * Removes a parcel, and walks fulfilment back if it was the last one.
 *
 * `addShipment` moves the order to "shipped", so deleting the only parcel has to
 * undo that too — otherwise a parcel added by mistake leaves the order claiming
 * to be shipped with nothing to show for it.
 */
export async function deleteShipment(id: string, orderId: string) {
  return db.transaction(async (tx) => {
    const [removed] = await tx
      .delete(shipments)
      .where(
        and(
          eq(shipments.id, id),
          eq(shipments.orderId, orderId),
          sql`exists (
            select 1 from ${orders}
            where ${orders.id} = ${orderId}
              and ${orders.fulfillmentStatus} <> 'delivered'
          )`,
        ),
      )
      .returning()

    if (!removed) return null

    const [remaining] = await tx
      .select({ n: count() })
      .from(shipments)
      .where(eq(shipments.orderId, orderId))

    if ((remaining?.n ?? 0) === 0) {
      await tx
        .update(orders)
        .set({ fulfillmentStatus: 'processing', updatedAt: new Date() })
        .where(and(eq(orders.id, orderId), eq(orders.fulfillmentStatus, 'shipped')))
    }

    return removed
  })
}

export async function setNotes(orderId: string, notes: string) {
  const [row] = await db
    .update(orders)
    .set({ notes: notes || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
    .returning()

  return row
}

/**
 * Cancels an order and returns its stock.
 *
 * Money is NOT moved here. A bank transfer is refunded by the owner making a
 * transfer; a gateway payment through the provider's own dashboard. Marking an
 * order refunded in the database while the customer has not been paid would be
 * worse than not tracking it at all, so this records intent and the admin
 * completes it.
 */
export async function cancelOrder(orderId: string, reason: string) {
  return db.transaction(async (tx) => {
    /**
     * Claim the state transition before touching stock.
     *
     * The predicate is the idempotency and concurrency control: two clicks (or
     * two requests racing) cannot both move the same order out of its active
     * state, so only one transaction is allowed to return inventory.
     */
    const [cancelled] = await tx
      .update(orders)
      .set({
        status: 'cancelled',
        stockHoldExpiresAt: null,
        // Cancellation does not move money. A paid order remains paid until a
        // real refund is completed through the bank or gateway.
        notes: sql`case
          when ${orders.notes} is null or ${orders.notes} = '' then ${`Cancelled: ${reason}`}
          else ${orders.notes} || ${`\n\nCancelled: ${reason}`}
        end`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, orderId),
          ne(orders.status, 'cancelled'),
          sql`${orders.fulfillmentStatus} not in ('shipped', 'delivered')`,
        ),
      )
      .returning({ id: orders.id })

    if (!cancelled) return null

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
        note: `cancelled: ${reason}`,
      })
    }

    return cancelled
  })
}

export function getOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.orderNumber, orderNumber),
    with: { items: true },
  })
}

/** The marker left in place of a deleted customer's details. */
export const REDACTED = '[deleted]'

/**
 * Strips a departed customer's identity from their orders, keeping the order.
 *
 * The rows themselves have to survive: they are the store's accounting record,
 * and deleting them would put a hole in the books for every month a customer
 * ever leaves. What does not have to survive is who the customer was. Email,
 * phone, IP, recipient name and street address go; totals, line items, dates and
 * the destination district stay, because that is what sales reporting and tax
 * actually need and a district alone identifies nobody.
 *
 * `orders.userId` is already `ON DELETE SET NULL`, so the link breaks on its
 * own — this handles the copies the FK cannot reach, which is the JSONB address
 * snapshot most of all.
 */
export async function anonymiseOrdersForUser(userId: string): Promise<number> {
  const rows = await db
    .update(orders)
    .set({
      userId: null,
      email: `${REDACTED}@invalid`,
      phone: null,
      checkoutIp: null,
      notes: null,
      shippingAddress: sql`
        jsonb_build_object(
          'recipient', ${REDACTED}::text,
          'phone', ${REDACTED}::text,
          'line1', ${REDACTED}::text,
          'line2', null,
          'city', ${orders.shippingAddress}->>'city',
          'district', ${orders.shippingAddress}->>'district',
          'upazila', ${REDACTED}::text,
          'union', null,
          'postalCode', null,
          'country', ${orders.shippingAddress}->>'country'
        )
      `,
      updatedAt: new Date(),
    })
    .where(eq(orders.userId, userId))
    .returning({ id: orders.id })

  return rows.length
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
      sql`${orders.paymentStatus} in ('unpaid', 'awaiting_transfer', 'awaiting_verification')`,
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
  return db.transaction(async (tx) => {
    // Claim the expired hold first. A concurrent cron run or payment callback
    // must not be able to release the same stock a second time.
    const [released] = await tx
      .update(orders)
      .set({ status: 'cancelled', stockHoldExpiresAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.status, 'pending'),
          sql`${orders.paymentStatus} in ('unpaid', 'awaiting_transfer', 'awaiting_verification')`,
          lt(orders.stockHoldExpiresAt, new Date()),
        ),
      )
      .returning({ id: orders.id })

    if (!released) return false

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

    return true
  })
}
