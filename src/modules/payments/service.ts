import 'server-only'

import { and, desc, eq, gt, inArray, ne, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import { getVisibleOrder, notifyOrderPaid } from '@/modules/orders'
// Tables come from the schema barrel, not another module's folder — see CLAUDE.md.
import { orders } from '@/lib/db/schema'

import { payments, webhookEvents } from './schema'
import { createSession, validatePayment } from './sslcommerz'

export class PaymentError extends Error {}

const MAX_VALUE_ID_LENGTH = 200

function assertValueId(value: string) {
  if (
    value.length < 1 ||
    value.length > MAX_VALUE_ID_LENGTH ||
    // Keep control characters out of provider URLs and logs.
    !/^[\x21-\x7e]+$/.test(value)
  ) {
    throw new PaymentError('Invalid payment reference.')
  }
}

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
  if (order.paymentMethod !== 'sslcommerz') {
    throw new PaymentError('This order is being paid by bank transfer.')
  }
  if (!order.stockHoldExpiresAt || order.stockHoldExpiresAt <= new Date()) {
    throw new PaymentError('This payment window expired. Please place the order again.')
  }

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
 * Order matters: verify with the provider first, check our own order amount,
 * then claim the event and settle the exact payment attempt/order atomically.
 * Claiming before validation would turn a temporary provider failure into a
 * permanently ignored retry.
 */
export async function handleGatewayNotification(
  valId: string,
): Promise<'ok' | 'late-cancelled' | 'duplicate'> {
  assertValueId(valId)

  // Verify before claiming the event. A provider timeout here must remain
  // retryable; recording the id first would make every later retry a no-op.
  const result = await validatePayment(valId)
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

  const outcome = await db.transaction(async (tx) => {
    // The insert is the idempotency claim, now inside the same transaction as
    // the commercial state change. A rollback removes both or neither.
    const inserted = await tx
      .insert(webhookEvents)
      .values({ provider: 'sslcommerz', eventId: valId, payload: result.raw })
      .onConflictDoNothing()
      .returning({ id: webhookEvents.id })

    if (inserted.length === 0) return 'duplicate' as const

    /**
     * This update arbitrates the payment-vs-expiry race on the order row.
     * If cron cancelled first, payment is still recorded truthfully but the
     * order stays cancelled and stock is not silently re-reserved/oversold.
     * If payment won first, cron's unpaid predicate no longer matches.
     */
    const [settled] = await tx
      .update(orders)
      .set({
        status: sql`case when ${orders.status} = 'cancelled' then 'cancelled' else 'confirmed' end`,
        paymentStatus: 'paid',
        stockHoldExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, order.id), ne(orders.paymentStatus, 'paid')))
      .returning({ status: orders.status })

    if (!settled) return 'duplicate' as const

    const [attempt] = await tx
      .select({ id: payments.id })
      .from(payments)
      .where(and(eq(payments.orderId, order.id), eq(payments.provider, 'sslcommerz')))
      .orderBy(desc(payments.createdAt))
      .limit(1)

    if (!attempt) throw new Error(`Missing SSLCommerz payment attempt for ${order.orderNumber}`)

    await tx
      .update(payments)
      .set({
        status: 'succeeded',
        providerRef: result.providerRef,
        rawPayload: result.raw,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, attempt.id))

    return settled.status === 'cancelled' ? ('late-cancelled' as const) : ('ok' as const)
  })

  if (outcome === 'ok') {
    await notifyOrderPaid(order.id).catch((error) =>
      console.error('[payments] paid-order side effects failed', order.orderNumber, error),
    )
  }
  if (outcome === 'late-cancelled') {
    console.error('[payments] paid gateway order arrived after stock release', order.orderNumber)
  }

  return outcome
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
  if (order.paymentMethod !== 'sslcommerz') {
    throw new PaymentError('This order is already using bank transfer.')
  }
  if (!order.stockHoldExpiresAt || order.stockHoldExpiresAt <= new Date()) {
    throw new PaymentError('This order expired. Please place it again.')
  }

  await db.transaction(async (tx) => {
    const [switched] = await tx
      .update(orders)
      .set({
        paymentMethod: 'bank_transfer',
        paymentStatus: 'awaiting_transfer',
        stockHoldExpiresAt: new Date(Date.now() + 72 * 60 * 60_000),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, order.id),
          eq(orders.status, 'pending'),
          eq(orders.paymentMethod, 'sslcommerz'),
          inArray(orders.paymentStatus, ['unpaid', 'failed']),
          gt(orders.stockHoldExpiresAt, new Date()),
        ),
      )
      .returning({ id: orders.id })

    if (!switched) throw new PaymentError('The order changed. Refresh and try again.')

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
    .select({ id: payments.id, status: payments.status, reference: payments.submittedReference })
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
    // Claim the live order first so cancellation/expiry cannot race this write
    // and leave a cancelled order back in the verification queue.
    const [submitted] = await tx
      .update(orders)
      .set({ paymentStatus: 'awaiting_verification', updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, order.id),
          eq(orders.status, 'pending'),
          eq(orders.paymentMethod, 'bank_transfer'),
          inArray(orders.paymentStatus, ['awaiting_transfer', 'awaiting_verification']),
          gt(orders.stockHoldExpiresAt, new Date()),
        ),
      )
      .returning({ id: orders.id })

    if (!submitted) throw new PaymentError('This transfer window expired or the order changed.')

    await tx
      .update(payments)
      .set({ submittedReference: reference, status: 'awaiting_verification', updatedAt: new Date() })
      .where(eq(payments.id, attempt.id))
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
    .where(
      and(
        eq(payments.provider, 'bank_transfer'),
        eq(payments.status, 'awaiting_verification'),
        eq(orders.status, 'pending'),
        eq(orders.paymentStatus, 'awaiting_verification'),
      ),
    )
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
  if (attempt.status !== 'awaiting_verification' || !attempt.reference) {
    throw new PaymentError('Wait for the customer to submit a transfer reference.')
  }

  await db.transaction(async (tx) => {
    // Payment and order state commit together. The predicate prevents a late
    // admin click from confirming an order whose stock cron already returned.
    const [settled] = await tx
      .update(orders)
      .set({
        status: 'confirmed',
        paymentStatus: 'paid',
        stockHoldExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(orders.id, order.id),
          eq(orders.status, 'pending'),
          eq(orders.paymentMethod, 'bank_transfer'),
          eq(orders.paymentStatus, 'awaiting_verification'),
          gt(orders.stockHoldExpiresAt, new Date()),
        ),
      )
      .returning({ id: orders.id })

    if (!settled) {
      throw new PaymentError(
        'This order expired or changed. Refund the transfer and ask the customer to order again.',
      )
    }

    await tx
      .update(payments)
      .set({
        status: 'paid',
        verifiedBy: input.adminUserId,
        verifiedAt: new Date(),
        verifiedAmount: input.observedAmount,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, attempt.id))
  })

  await notifyOrderPaid(order.id).catch((error) =>
    console.error('[payments] transfer side effects failed', order.orderNumber, error),
  )
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
    const [rejected] = await tx
      .update(orders)
      // Back to awaiting_transfer, not failed: the customer can correct the
      // reference and try again rather than losing the order.
      .set({ paymentStatus: 'awaiting_transfer', updatedAt: new Date() })
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.status, 'pending'),
          eq(orders.paymentMethod, 'bank_transfer'),
          eq(orders.paymentStatus, 'awaiting_verification'),
        ),
      )
      .returning({ id: orders.id })

    if (!rejected) throw new PaymentError('The order changed. Refresh and try again.')

    await tx
      .update(payments)
      .set({ status: 'failed', rawPayload: { reason }, updatedAt: new Date() })
      .where(eq(payments.id, attempt.id))
  })
}
