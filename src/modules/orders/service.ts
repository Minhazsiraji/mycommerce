import 'server-only'

import { cookies } from 'next/headers'

import { env } from '@/lib/env'
import { getSession, saveAddress } from '@/modules/accounts'
import { readCart } from '@/modules/cart'
import {
  sendOrderCancelled,
  sendOrderConfirmed,
  sendOrderPlacedCod,
  sendOrderDelivered,
  sendOrderShipped,
} from '@/modules/notifications'
import { resolveRate } from '@/modules/shipping'
import { assessCheckout } from '@/modules/fraud'
import { captureOrderAttribution, queuePurchase } from '@/modules/meta'

import * as repo from './repository'
import { canFulfilBeforeCollection, initialPaymentState } from './payment-methods'
import { signOrderAccess, verifyOrderAccess } from './order-access-cookie'
import { OutOfStockError } from './repository'
import type { PlaceOrderInput } from './validators'

export class CheckoutError extends Error {}
export { OutOfStockError }

export async function placeOrder(input: PlaceOrderInput) {
  const session = await getSession()
  const cart = await readCart()

  if (!cart.id || cart.lines.length === 0) throw new CheckoutError('Your cart is empty.')

  // Refuse rather than silently adjusting. A total that changes between the
  // cart and the confirmation is how customers stop trusting a store.
  if (cart.hasIssues) {
    throw new CheckoutError('Some items changed. Review your cart before continuing.')
  }

  const assessment = await assessCheckout({ email: input.email, phone: input.address.phone })
  if (!assessment.allowed) throw new CheckoutError(assessment.message)

  /**
   * Delivery is re-quoted from the database for this destination and subtotal.
   * The client sent an id; it never sends a cost. Same rule as item prices.
   */
  const shipping = await resolveRate({
    rateId: input.shippingRateId,
    district: input.address.district,
    subtotal: cart.subtotal,
  })

  const order = await repo.placeOrder({
    cartId: cart.id,
    userId: session?.user.id ?? null,
    email: input.email.toLowerCase(),
    phone: input.address.phone,
    address: {
      recipient: input.address.recipient,
      phone: input.address.phone,
      line1: input.address.line1,
      line2: input.address.line2 ?? null,
      city: input.address.city,
      district: input.address.district,
      upazila: input.address.upazila,
      union: input.address.union ?? null,
      postalCode: input.address.postalCode ?? null,
      country: input.address.country,
    },
    shipping: { cost: shipping.cost, name: shipping.name },
    paymentMethod: input.paymentMethod,
    notes: input.notes ?? null,
    holdMinutes: initialPaymentState(input.paymentMethod).holdMinutes,
    checkoutIp: assessment.ip,
  })

  // Best-effort, and deliberately after the order exists: failing to save an
  // address to the book must never cost someone their order.
  if (session && input.saveAddress) {
    await saveAddress(session.user.id, input.address).catch(() => {})
  }

  const jar = await cookies()

  // The cart was consumed inside the transaction; drop the guest cookie too.
  if (!session) jar.delete('mycommerce_cart')

  await rememberOrder(order.orderNumber)

  await captureOrderAttribution(order.id).catch((error) =>
    console.error('[meta] order attribution capture failed', error),
  )

  if (order.paymentMethod === 'cod') {
    const placed = await repo.getOrderById(order.id)
    if (placed) {
      await notify('COD order confirmation', () =>
        sendOrderPlacedCod({
          orderNumber: placed.orderNumber,
          email: placed.email,
          recipient: placed.shippingAddress.recipient,
          total: placed.total,
          subtotal: placed.subtotal,
          shippingCost: placed.shippingCost,
          taxAmount: placed.taxAmount,
          items: placed.items,
        }),
      )
    }
  }

  return order
}

const RECENT_ORDERS_COOKIE = 'mycommerce_orders'

/**
 * Lets a guest see the order they just placed.
 *
 * They have no session to prove ownership with, and putting the email in the
 * URL would leak it into history, logs and referrers. Instead the order number
 * goes into an HMAC-signed, httpOnly cookie. The HMAC prevents replacement;
 * httpOnly prevents scripts from reading it. It grants viewing only, expires
 * in a week, and the guest lookup form — which needs order number AND matching
 * email — remains the route back after that.
 */
async function rememberOrder(orderNumber: string) {
  const jar = await cookies()
  const existing = verifyOrderAccess(
    jar.get(RECENT_ORDERS_COOKIE)?.value,
    env.BETTER_AUTH_SECRET,
  )

  jar.set(
    RECENT_ORDERS_COOKIE,
    signOrderAccess([orderNumber, ...existing], env.BETTER_AUTH_SECRET),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    },
  )
}

/**
 * Proves a guest owns an order, then grants the same cookie the checkout does.
 *
 * Order number and email must both match, and the answer is identical whether
 * the order is missing or the email is wrong — a lookup form that distinguishes
 * the two is an order-number oracle.
 *
 * Throttling is deliberately not here. On Vercel each invocation may be a fresh
 * instance, so an in-process counter would be security theatre; per-IP limits on
 * this path belong in the Cloudflare WAF rule (docs/04-security.md).
 */
export async function lookupGuestOrder(orderNumber: string, email: string) {
  const order = await repo.findGuestOrder(orderNumber.trim(), email.trim().toLowerCase())
  if (!order) return null

  await rememberOrder(order.orderNumber)
  return order
}

async function wasPlacedHere(orderNumber: string) {
  const jar = await cookies()
  return verifyOrderAccess(
    jar.get(RECENT_ORDERS_COOKIE)?.value,
    env.BETTER_AUTH_SECRET,
  ).includes(orderNumber)
}

/**
 * An order the caller is allowed to see: their own if signed in, or a guest
 * order proven by order number AND matching email.
 */
export async function getVisibleOrder(orderNumber: string, email?: string) {
  const session = await getSession()
  const order = await repo.getOrderByNumber(orderNumber)

  if (!order) return null

  if (session && order.userId === session.user.id) return order
  if (email && order.email === email.toLowerCase()) return order
  if (await wasPlacedHere(orderNumber)) return order

  return null
}

export async function listMyOrders() {
  const session = await getSession()
  if (!session) return []
  return repo.listOrdersForUser(session.user.id)
}

export { releaseHold, listExpiredHolds, deleteShipment, setNotes, updateShipment } from './repository'

/**
 * Every notification below is best-effort.
 *
 * An email that fails must never fail the thing it describes — a customer whose
 * payment succeeded but whose confirmation bounced still has a paid order, and
 * throwing here would roll back work that genuinely happened. Failures are
 * logged for a human instead.
 *
 * They also cannot reach anyone yet: without a verified sending domain, Resend
 * only delivers to the account owner's address. The code is correct and the
 * addressing is not, which is a domain purchase away.
 */
async function notify(what: string, send: () => Promise<unknown>) {
  try {
    await send()
  } catch (error) {
    console.error(`[notifications] ${what} failed`, error)
  }
}

/** Payment state is committed by the payments module; this runs side effects only. */
export async function notifyOrderPaid(orderId: string) {
  const order = await repo.getOrderById(orderId)
  if (!order || order.status !== 'confirmed' || order.paymentStatus !== 'paid') return

  await queuePurchase(orderId).catch((error) =>
    console.error('[meta] Purchase delivery failed', error),
  )

  await notify('order confirmation', () =>
    sendOrderConfirmed({
      orderNumber: order.orderNumber,
      email: order.email,
      recipient: order.shippingAddress.recipient,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      items: order.items,
    }),
  )
}

export async function setFulfillmentStatus(orderId: string, status: string) {
  // Read first: after the update there is no way to tell whether this was a
  // change or someone re-saving the status it already had.
  const before = await repo.getOrderById(orderId)
  if (!before) return null

  if (before.status === 'cancelled') throw new CheckoutError('A cancelled order cannot be fulfilled.')

  if (
    (before.fulfillmentStatus === 'shipped' && status !== 'shipped' && status !== 'delivered') ||
    (before.fulfillmentStatus === 'delivered' && status !== 'delivered')
  ) {
    throw new CheckoutError(
      'A shipped order cannot move backward. Remove an incorrect parcel before dispatch instead.',
    )
  }

  if (
    (status === 'shipped' || status === 'delivered') &&
    before.paymentStatus !== 'paid' &&
    !canFulfilBeforeCollection(before.paymentMethod, before.paymentStatus)
  ) {
    throw new CheckoutError('Confirm payment before shipping this order.')
  }

  if (status === 'shipped') {
    const parcels = await repo.listShipments(orderId)
    if (parcels.length === 0) {
      throw new CheckoutError('Add a parcel to mark this order shipped.')
    }
  }

  if (status === 'delivered' && before.fulfillmentStatus !== 'shipped') {
    throw new CheckoutError('Only a shipped order can be marked delivered.')
  }

  const row = await repo.setFulfillmentStatus(orderId, status)
  if (!row) throw new CheckoutError('The order changed. Refresh and try again.')

  if (status === 'delivered' && before.fulfillmentStatus !== 'delivered') {
    if (before.paymentMethod === 'cod' && before.paymentStatus === 'cod_pending') {
      await queuePurchase(orderId).catch((error) =>
        console.error('[meta] COD Purchase delivery failed', error),
      )
    }

    await notify('delivered email', () =>
      sendOrderDelivered({
        orderNumber: before.orderNumber,
        email: before.email,
        recipient: before.shippingAddress.recipient,
      }),
    )
  }

  return row
}

export async function addShipment(input: {
  orderId: string
  carrier: string
  trackingNumber: string | null
}) {
  const before = await repo.getOrderById(input.orderId)
  if (!before) throw new CheckoutError('Order not found.')
  if (before.status === 'cancelled') throw new CheckoutError('A cancelled order cannot be shipped.')
  if (
    before.paymentStatus !== 'paid' &&
    !canFulfilBeforeCollection(before.paymentMethod, before.paymentStatus)
  ) {
    throw new CheckoutError('Confirm payment before adding a parcel.')
  }
  if (before.fulfillmentStatus === 'delivered') {
    throw new CheckoutError('A delivered order cannot receive another parcel.')
  }

  const shipment = await repo.addShipment(input)
  if (!shipment) throw new CheckoutError('The order changed. Refresh and try again.')

  const order = await repo.getOrderById(input.orderId)
  if (!order) return shipment

  await notify('shipped email', () =>
    sendOrderShipped(
      {
        orderNumber: order.orderNumber,
        email: order.email,
        recipient: order.shippingAddress.recipient,
      },
      { carrier: input.carrier, trackingNumber: input.trackingNumber },
    ),
  )

  return shipment
}

export async function cancelOrder(orderId: string, reason: string) {
  // Read before cancelling: the status is about to change.
  const before = await repo.getOrderById(orderId)
  if (!before) throw new CheckoutError('Order not found.')
  if (before.status === 'cancelled') throw new CheckoutError('This order is already cancelled.')
  if (before.fulfillmentStatus === 'shipped' || before.fulfillmentStatus === 'delivered') {
    throw new CheckoutError('A shipped order needs a return/refund workflow, not cancellation.')
  }
  const wasPaid = before.paymentStatus === 'paid'

  const cancelled = await repo.cancelOrder(orderId, reason)
  if (!cancelled) throw new CheckoutError('The order changed. Refresh and try again.')

  await notify('cancellation email', () =>
    sendOrderCancelled(
      {
        orderNumber: before.orderNumber,
        email: before.email,
        recipient: before.shippingAddress.recipient,
        total: before.total,
      },
      reason,
      wasPaid,
    ),
  )
}
