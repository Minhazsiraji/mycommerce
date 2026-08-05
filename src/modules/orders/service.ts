import 'server-only'

import { cookies } from 'next/headers'

import { getSession, saveAddress } from '@/modules/accounts'
import { readCart } from '@/modules/cart'
import { sendOrderCancelled, sendOrderConfirmed, sendOrderShipped } from '@/modules/notifications'
import { resolveRate } from '@/modules/shipping'

import * as repo from './repository'
import { OutOfStockError } from './repository'
import type { PlaceOrderInput } from './validators'

export class CheckoutError extends Error {}
export { OutOfStockError }

/**
 * How long stock stays reserved without payment.
 *
 * Two windows on purpose. A single constant would either cancel legitimate bank
 * transfers — which take a day or more — or let a dropped gateway checkout
 * freeze stock for days that nobody can buy.
 */
const HOLD_MINUTES = {
  sslcommerz: 30,
  bank_transfer: 72 * 60,
} as const

export async function placeOrder(input: PlaceOrderInput) {
  const session = await getSession()
  const cart = await readCart()

  if (!cart.id || cart.lines.length === 0) throw new CheckoutError('Your cart is empty.')

  // Refuse rather than silently adjusting. A total that changes between the
  // cart and the confirmation is how customers stop trusting a store.
  if (cart.hasIssues) {
    throw new CheckoutError('Some items changed. Review your cart before continuing.')
  }

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
      postalCode: input.address.postalCode ?? null,
      country: input.address.country,
    },
    shipping: { cost: shipping.cost, name: shipping.name },
    paymentMethod: input.paymentMethod,
    notes: input.notes ?? null,
    holdMinutes: HOLD_MINUTES[input.paymentMethod],
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

  return order
}

const RECENT_ORDERS_COOKIE = 'mycommerce_orders'

/**
 * Lets a guest see the order they just placed.
 *
 * They have no session to prove ownership with, and putting the email in the
 * URL would leak it into history, logs and referrers. Instead the order number
 * goes into an httpOnly cookie the browser already trusts. It grants viewing
 * only, expires in a week, and the guest lookup form — which needs order number
 * AND matching email — remains the route back after that.
 */
async function rememberOrder(orderNumber: string) {
  const jar = await cookies()
  const existing = jar.get(RECENT_ORDERS_COOKIE)?.value?.split(',').filter(Boolean) ?? []

  jar.set(RECENT_ORDERS_COOKIE, [orderNumber, ...existing].slice(0, 10).join(','), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

async function wasPlacedHere(orderNumber: string) {
  const jar = await cookies()
  return (jar.get(RECENT_ORDERS_COOKIE)?.value?.split(',') ?? []).includes(orderNumber)
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

export { releaseHold, listExpiredHolds, findGuestOrder } from './repository'

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

export async function markPaid(orderId: string, providerRef: string | null) {
  await repo.markPaid(orderId, providerRef)

  const order = await repo.getOrderById(orderId)
  if (!order) return

  await notify('order confirmation', () =>
    sendOrderConfirmed({
      orderNumber: order.orderNumber,
      email: order.email,
      recipient: order.shippingAddress.recipient,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      items: order.items,
    }),
  )
}

export async function addShipment(input: {
  orderId: string
  carrier: string
  trackingNumber: string | null
}) {
  const shipment = await repo.addShipment(input)

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
  const wasPaid = before?.paymentStatus === 'paid'

  await repo.cancelOrder(orderId, reason)

  if (!before) return

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
