import 'server-only'

import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { getVisibleOrder, markPaid } from '@/modules/orders'
// Tables come from the schema barrel, not another module's folder — see CLAUDE.md.
import { orders } from '@/lib/db/schema'

import { payments, webhookEvents } from './schema'
import { createSession, validatePayment } from './sslcommerz'

export class PaymentError extends Error {}

/**
 * Starts a hosted checkout for an order the caller is allowed to see.
 *
 * The amount comes from the order row, never from the caller — the same rule as
 * everywhere else money is involved.
 */
export async function startGatewayPayment(orderNumber: string): Promise<{ redirectUrl: string }> {
  const order = await getVisibleOrder(orderNumber)
  if (!order) throw new PaymentError('Order not found.')

  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')
  if (order.status === 'cancelled') throw new PaymentError('This order was cancelled.')

  const { redirectUrl } = await createSession({
    orderNumber: order.orderNumber,
    amount: order.total,
    customer: {
      name: order.shippingAddress.recipient,
      email: order.email,
      phone: order.shippingAddress.phone,
    },
    address: order.shippingAddress,
    baseUrl: env.BETTER_AUTH_URL,
  })

  return { redirectUrl }
}

/**
 * Handles a gateway notification. The ONLY path by which a gateway order
 * becomes paid.
 *
 * Order matters: record the event first so a retry is a no-op, then verify with
 * the provider, then check the amount, then mark paid.
 */
export async function handleGatewayNotification(valId: string): Promise<'ok' | 'duplicate'> {
  // The insert IS the idempotency check. Providers retry, and a second
  // delivery must never mark an order paid twice.
  const inserted = await db
    .insert(webhookEvents)
    .values({ provider: 'sslcommerz', eventId: valId })
    .onConflictDoNothing()
    .returning()

  if (inserted.length === 0) return 'duplicate'

  const result = await validatePayment(valId)

  await db
    .update(webhookEvents)
    .set({ payload: result.raw })
    .where(and(eq(webhookEvents.provider, 'sslcommerz'), eq(webhookEvents.eventId, valId)))

  if (!result.valid) throw new PaymentError('Payment did not validate.')

  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNumber, result.orderNumber),
  })
  if (!order) throw new PaymentError('Notification referenced an unknown order.')

  /**
   * The amount is checked against our own record, not accepted.
   *
   * Without this, a forged or tampered notification could settle a large order
   * for a trivial amount. Currency too — a valid payment in the wrong currency
   * is not payment.
   */
  if (result.amount !== order.total || result.currency !== order.currency) {
    throw new PaymentError(
      `Amount mismatch on ${order.orderNumber}: gateway said ${result.amount} ${result.currency}, order is ${order.total} ${order.currency}`,
    )
  }

  if (order.paymentStatus === 'paid') return 'duplicate'

  await markPaid(order.id, result.providerRef)
  return 'ok'
}

/** Customer submits the reference for a transfer they have made. */
export async function submitTransferReference(orderNumber: string, reference: string) {
  const order = await getVisibleOrder(orderNumber)
  if (!order) throw new PaymentError('Order not found.')

  if (order.paymentMethod !== 'bank_transfer') {
    throw new PaymentError('This order is not being paid by transfer.')
  }
  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ submittedReference: reference, status: 'awaiting_verification', updatedAt: new Date() })
      .where(eq(payments.orderId, order.id))

    await tx
      .update(orders)
      .set({ paymentStatus: 'awaiting_verification', updatedAt: new Date() })
      .where(eq(orders.id, order.id))
  })
}

/** The admin verification queue. */
export async function listPendingTransfers() {
  return db
    .select({
      paymentId: payments.id,
      orderId: orders.id,
      orderNumber: orders.orderNumber,
      email: orders.email,
      total: orders.total,
      reference: payments.submittedReference,
      submittedAt: payments.updatedAt,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(and(eq(payments.provider, 'bank_transfer'), eq(payments.status, 'awaiting_verification')))
    .orderBy(desc(payments.updatedAt))
}

/**
 * Confirms a transfer against the bank statement.
 *
 * The admin types the amount they actually saw, and it must match the order
 * total. An uploaded receipt is evidence for a human, never proof — a
 * screenshot is trivially forged (docs/04-security.md, threat 15).
 */
export async function confirmTransfer(input: {
  orderId: string
  observedAmount: number
  adminUserId: string
}) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) })
  if (!order) throw new PaymentError('Order not found.')

  if (input.observedAmount !== order.total) {
    throw new PaymentError(
      'That amount does not match the order total. Check the statement before confirming.',
    )
  }

  await db
    .update(payments)
    .set({
      verifiedBy: input.adminUserId,
      verifiedAt: new Date(),
      verifiedAmount: input.observedAmount,
      updatedAt: new Date(),
    })
    .where(eq(payments.orderId, order.id))

  await markPaid(order.id, null)
}

export async function rejectTransfer(orderId: string, reason: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: 'failed', rawPayload: { reason }, updatedAt: new Date() })
      .where(eq(payments.orderId, orderId))

    await tx
      .update(orders)
      // Back to awaiting_transfer, not failed: the customer can correct the
      // reference and try again rather than losing the order.
      .set({ paymentStatus: 'awaiting_transfer', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
  })
}
