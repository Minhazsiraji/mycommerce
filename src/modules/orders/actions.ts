'use server'

import { refresh } from 'next/cache'
import { redirect } from 'next/navigation'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { auditedAdmin } from '@/modules/admin'
import { ShippingError } from '@/modules/shipping'

import * as service from './service'
import { CheckoutError, OutOfStockError } from './service'
import {
  cancelOrderSchema,
  deleteShipmentSchema,
  fulfillmentUpdateSchema,
  guestLookupSchema,
  orderNotesSchema,
  placeOrderSchema,
  shipmentSchema,
  updateShipmentSchema,
} from './validators'

export type LookupState = {
  error?: string
  fieldErrors?: { orderNumber?: string; email?: string }
}

/**
 * Guest order lookup. Returns state for `useActionState` rather than
 * `ActionResult`, because on success it redirects and never returns at all.
 */
export async function lookupGuestOrder(
  _prev: LookupState,
  formData: FormData,
): Promise<LookupState> {
  // Throttled before parsing: an attacker grinding order numbers should not get
  // free validation feedback, and this is the enumeration surface threat 7 names.
  const limit = await rateLimit('order-lookup', 10, 3600)
  if (!limit.ok) return { error: tooManyRequests(limit.retryAfter) }

  const parsed = guestLookupSchema.safeParse({
    orderNumber: formData.get('orderNumber'),
    email: formData.get('email'),
  })

  if (!parsed.success) {
    const fieldErrors: LookupState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'orderNumber' || key === 'email') fieldErrors[key] ??= issue.message
    }
    return { error: 'Check the order number and email address.', fieldErrors }
  }

  const order = await service.lookupGuestOrder(parsed.data.orderNumber, parsed.data.email)

  // One message for both "no such order" and "wrong email" — see the service.
  if (!order) {
    return {
      error: 'We could not find an order with that number and email address together.',
    }
  }

  redirect(`/orders/${order.orderNumber}`)
}

function toResult(error: unknown): ActionResult<never> {
  // Out-of-stock is the one a customer is most likely to hit, and the message
  // names the product so they know which line to fix.
  if (error instanceof OutOfStockError) return fail('conflict', error.message)
  if (error instanceof CheckoutError) return fail('conflict', error.message)
  if (error instanceof ShippingError) return fail('conflict', error.message)
  throw error
}

export async function setFulfillmentStatus(input: unknown): Promise<ActionResult<null>> {
  const parsed = fulfillmentUpdateSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.fulfillment_changed',
    entityType: 'order',
    entityId: parsed.data.orderId,
    detail: { status: parsed.data.status },
  })

  try {
    const row = await service.setFulfillmentStatus(parsed.data.orderId, parsed.data.status)
    if (!row) return fail('not_found', 'Order not found.')
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function updateShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = updateShipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.shipment_updated',
    entityType: 'order',
    entityId: parsed.data.orderId,
    detail: {
      shipmentId: parsed.data.shipmentId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber ?? null,
    },
  })

  try {
    const row = await service.updateShipment({
      id: parsed.data.shipmentId,
      orderId: parsed.data.orderId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber || null,
    })
    if (!row) return fail('not_found', 'That parcel is no longer on this order.')
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function deleteShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = deleteShipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.shipment_deleted',
    entityType: 'order',
    entityId: parsed.data.orderId,
    detail: { shipmentId: parsed.data.shipmentId },
  })

  try {
    const row = await service.deleteShipment(parsed.data.shipmentId, parsed.data.orderId)
    if (!row) return fail('not_found', 'That parcel is no longer on this order.')
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function setOrderNotes(input: unknown): Promise<ActionResult<null>> {
  const parsed = orderNotesSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.notes_edited',
    entityType: 'order',
    entityId: parsed.data.orderId,
    // The text itself goes in the log: notes are where a cancellation reason
    // lives, so overwriting one without a record would erase the trail.
    detail: { notes: parsed.data.notes },
  })

  try {
    const row = await service.setNotes(parsed.data.orderId, parsed.data.notes)
    if (!row) return fail('not_found', 'Order not found.')
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function addShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = shipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.shipment_added',
    entityType: 'order',
    entityId: parsed.data.orderId,
    detail: { carrier: parsed.data.carrier, trackingNumber: parsed.data.trackingNumber ?? null },
  })

  try {
    await service.addShipment({
      orderId: parsed.data.orderId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber || null,
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function cancelOrder(input: unknown): Promise<ActionResult<null>> {
  const parsed = cancelOrderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  await auditedAdmin({
    action: 'order.cancelled',
    entityType: 'order',
    entityId: parsed.data.orderId,
    detail: { reason: parsed.data.reason },
  })

  try {
    await service.cancelOrder(parsed.data.orderId, parsed.data.reason)
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function placeOrder(
  input: unknown,
): Promise<ActionResult<{ orderNumber: string; paymentMethod: string }>> {
  const parsed = placeOrderSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  /**
   * The most important limit in the application.
   *
   * Placing an order decrements real stock and holds it for up to 72 hours with
   * nothing paid. Unthrottled, a loop empties the catalogue for free. Ten an
   * hour is far above what a real customer does and far below what an attacker
   * needs.
   */
  const limit = await rateLimit('place-order', 10, 3600)
  if (!limit.ok) return fail('conflict', tooManyRequests(limit.retryAfter))

  try {
    const order = await service.placeOrder(parsed.data)
    refresh()
    return ok({ orderNumber: order.orderNumber, paymentMethod: order.paymentMethod })
  } catch (error) {
    try {
      return toResult(error)
    } catch (unexpected) {
      // A database or provider fault must stay on the checkout form. Server
      // detail is logged, while the customer gets a safe retry message rather
      // than Next.js replacing the entire page with a generic error screen.
      console.error('[orders] place order failed', unexpected)
      return fail('unexpected', 'We could not place your order. Please try again.')
    }
  }
}
