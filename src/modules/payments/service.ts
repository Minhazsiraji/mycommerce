import 'server-only'

import { and, desc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
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
export async function startGatewayPayment(
  orderNumber: string,
  callbackOrigin: string,
): Promise<{ redirectUrl: string }> {
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
    baseUrl: callbackOrigin,
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

/**
 * Switches an unpaid order to bank transfer.
 *
 * Without this, a customer whose card payment fails is stranded: the order
 * exists, the cart was consumed by the transaction, and going back leaves them
 * with an empty cart and no way to pay. The order is already correct — only the
 * method needs to change.
 *
 * The hold is extended to the transfer window at the same time, or a 30-minute
 * gateway hold would expire long before anyone could reach a bank.
 */
export async function switchToBankTransfer(orderNumber: string) {
  const order = await getVisibleOrder(orderNumber)
  if (!order) throw new PaymentError('Order not found.')

  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')
  if (order.status === 'cancelled') throw new PaymentError('This order was cancelled.')

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        paymentMethod: 'bank_transfer',
        paymentStatus: 'awaiting_transfer',
        stockHoldExpiresAt: new Date(Date.now() + 72 * 60 * 60_000),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id))

    // A fresh attempt row rather than editing the failed one — the card
    // attempt is history worth keeping if anyone disputes it later.
    await tx.insert(payments).values({
      orderId: order.id,
      provider: 'bank_transfer',
      amount: order.total,
      currency: order.currency,
      status: 'awaiting_verification',
    })
  })
}

/**
 * The live bank-transfer attempt for an order.
 *
 * Scoped to the provider and to the newest row, both deliberately. An order that
 * failed by card and then switched to transfer has two payment rows, and a bare
 * `where orderId = ...` updates both — stamping "verified by an admin for the
 * full amount" onto a card attempt nobody verified. `switchToBankTransfer` keeps
 * that row precisely so a dispute can be reconstructed; overwriting it defeats
 * the reason it exists.
 */
async function currentTransfer(orderId: string) {
  const [row] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.provider, 'bank_transfer')))
    .orderBy(desc(payments.createdAt))
    .limit(1)

  return row
}

/** Customer submits the reference for a transfer they have made. */
export async function submitTransferReference(orderNumber: string, reference: string) {
  const order = await getVisibleOrder(orderNumber)
  if (!order) throw new PaymentError('Order not found.')

  if (order.paymentMethod !== 'bank_transfer') {
    throw new PaymentError('This order is not being paid by transfer.')
  }
  if (order.status === 'cancelled') throw new PaymentError('This order was cancelled.')
  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')

  const attempt = await currentTransfer(order.id)
  if (!attempt) throw new PaymentError('No transfer is pending on this order.')

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ submittedReference: reference, status: 'awaiting_verification', updatedAt: new Date() })
      .where(eq(payments.id, attempt.id))

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

  /**
   * State guards, not paperwork.
   *
   * The dangerous case is a late transfer against an order whose hold expired:
   * cron already cancelled it and returned the stock, which has since been sold
   * to somebody else. Confirming that order takes the money for goods the store
   * no longer has. Refund it and let the customer reorder — that is a bad
   * afternoon; silently overselling is a bad reputation.
   */
  if (order.paymentMethod !== 'bank_transfer') {
    throw new PaymentError('This order is not being paid by transfer.')
  }
  if (order.status === 'cancelled') {
    throw new PaymentError(
      'This order was cancelled and its stock returned. Refund the transfer and ask the customer to order again.',
    )
  }
  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')

  if (input.observedAmount !== order.total) {
    throw new PaymentError(
      'That amount does not match the order total. Check the statement before confirming.',
    )
  }

  const attempt = await currentTransfer(order.id)
  if (!attempt) throw new PaymentError('No transfer is pending on this order.')

  await db
    .update(payments)
    .set({
      status: 'paid',
      verifiedBy: input.adminUserId,
      verifiedAt: new Date(),
      verifiedAmount: input.observedAmount,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, attempt.id))

  await markPaid(order.id, null)
}

export async function rejectTransfer(orderId: string, reason: string) {
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })
  if (!order) throw new PaymentError('Order not found.')

  // Without this a rejection would set a cancelled order back to
  // awaiting_transfer, quietly bringing it back to life.
  if (order.status === 'cancelled') throw new PaymentError('This order was cancelled.')
  if (order.paymentStatus === 'paid') throw new PaymentError('This order is already paid.')

  const attempt = await currentTransfer(orderId)
  if (!attempt) throw new PaymentError('No transfer is pending on this order.')

  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ status: 'failed', rawPayload: { reason }, updatedAt: new Date() })
      .where(eq(payments.id, attempt.id))

    await tx
      .update(orders)
      // Back to awaiting_transfer, not failed: the customer can correct the
      // reference and try again rather than losing the order.
      .set({ paymentStatus: 'awaiting_transfer', updatedAt: new Date() })
      .where(eq(orders.id, orderId))
  })
}
