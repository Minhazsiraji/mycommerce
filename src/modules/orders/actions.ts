'use server'

import { refresh } from 'next/cache'
import { after } from 'next/server'
import { z } from 'zod'
import { getProductBySlug } from '@/modules/catalog'
import * as cartService from '@/modules/cart/service'
import { addToCart as addToCartAction } from '@/modules/cart/actions'
import { addressInputSchema } from '@/modules/accounts/validators'
import { trackLead } from '@/modules/meta/actions'
import { isQuickDenimProduct, QUICK_DENIM_UNIT_PRICE, QUICK_DENIM_MAX_ITEMS } from '@/lib/moymoy-quick-cod'
import { z } from 'zod'
import { redirect } from 'next/navigation'

import { fail, fromZodError, ok, type ActionResult } from '@/lib/action-result'
import { rateLimit, tooManyRequests } from '@/lib/rate-limit'
import { requireRole } from '@/modules/accounts'
import { recordAudit } from '@/modules/admin'
import { ShippingError } from '@/modules/shipping'

import { configuredPaymentMethods } from './configured-payments'
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
  fieldErrors?: { orderNumber?: string; phone?: string }
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
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    const fieldErrors: LookupState['fieldErrors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'orderNumber' || key === 'phone') fieldErrors[key] ??= issue.message
    }
    return { error: 'Check the order number and email address.', fieldErrors }
  }

  const order = await service.lookupGuestOrder(parsed.data.orderNumber, parsed.data.phone)

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

export async function confirmOrderForCourier(orderId: unknown): Promise<ActionResult<null>> {
  const parsed = z.uuid().safeParse(orderId)
  if (!parsed.success) return fail('validation', 'Invalid order.')
  const admin = await requireRole('admin')

  try {
    await service.confirmOrderForCourier(parsed.data)
    await recordAudit(admin, {
      action: 'order.courier_confirmed',
      entityType: 'order',
      entityId: parsed.data,
      detail: { courier: 'Steadfast' },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function setFulfillmentStatus(input: unknown): Promise<ActionResult<null>> {
  const parsed = fulfillmentUpdateSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const admin = await requireRole('admin')

  try {
    const row = await service.setFulfillmentStatus(parsed.data.orderId, parsed.data.status)
    if (!row) return fail('not_found', 'Order not found.')
    await recordAudit(admin, {
      action: 'order.fulfillment_changed',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: { status: parsed.data.status },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function updateShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = updateShipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const admin = await requireRole('admin')

  try {
    const row = await service.updateShipment({
      id: parsed.data.shipmentId,
      orderId: parsed.data.orderId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber || null,
    })
    if (!row) return fail('not_found', 'That parcel is no longer on this order.')
    await recordAudit(admin, {
      action: 'order.shipment_updated',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: {
        shipmentId: parsed.data.shipmentId,
        carrier: parsed.data.carrier,
        trackingNumber: parsed.data.trackingNumber ?? null,
      },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function deleteShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = deleteShipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const admin = await requireRole('admin')

  try {
    const row = await service.deleteShipment(parsed.data.shipmentId, parsed.data.orderId)
    if (!row) return fail('not_found', 'That parcel is no longer on this order.')
    await recordAudit(admin, {
      action: 'order.shipment_deleted',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: { shipmentId: parsed.data.shipmentId },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function setOrderNotes(input: unknown): Promise<ActionResult<null>> {
  const parsed = orderNotesSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const admin = await requireRole('admin')

  try {
    const row = await service.setNotes(parsed.data.orderId, parsed.data.notes)
    if (!row) return fail('not_found', 'Order not found.')
    await recordAudit(admin, {
      action: 'order.notes_edited',
      entityType: 'order',
      entityId: parsed.data.orderId,
      // The text itself goes in the log: notes are where a cancellation reason
      // lives, so overwriting one without a record would erase the trail.
      detail: { notes: parsed.data.notes },
    })
    refresh()
    return ok(null)
  } catch (error) {
    return toResult(error)
  }
}

export async function addShipment(input: unknown): Promise<ActionResult<null>> {
  const parsed = shipmentSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const admin = await requireRole('admin')

  try {
    await service.addShipment({
      orderId: parsed.data.orderId,
      carrier: parsed.data.carrier,
      trackingNumber: parsed.data.trackingNumber || null,
    })
    await recordAudit(admin, {
      action: 'order.shipment_added',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: { carrier: parsed.data.carrier, trackingNumber: parsed.data.trackingNumber ?? null },
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
  const admin = await requireRole('admin')

  try {
    await service.cancelOrder(parsed.data.orderId, parsed.data.reason)
    await recordAudit(admin, {
      action: 'order.cancelled',
      entityType: 'order',
      entityId: parsed.data.orderId,
      detail: { reason: parsed.data.reason },
    })
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
   * The schema knows every method the software supports; only this deployment
   * knows which it can settle. Checked server-side because the form's list is a
   * client value — accepting an unconfigured method would take an order the
   * store has no way to collect on.
   */
  if (!configuredPaymentMethods().includes(parsed.data.paymentMethod)) {
    return fail('validation', 'That payment method is not available.')
  }

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

/** Dedicated Messenger link checkout. Does not modify the ordinary checkout route. */
const quickSelectionSchema = z.object({
  slug: z.string().trim().min(2).max(180),
  variantId: z.uuid(),
  quantity: z.number().int().min(1).max(QUICK_DENIM_MAX_ITEMS),
})

const quickCodSchema = z.object({
  slug: z.string().trim().min(2).max(180),
  email: z.string().trim().toLowerCase().refine(
    (value) => !value || z.email().safeParse(value).success,
    'সঠিক ইমেইল লিখুন অথবা খালি রাখুন',
  ),
  address: addressInputSchema,
})

async function validQuickVariant(slug: string, variantId: string) {
  const product = await getProductBySlug(slug)
  if (!product || product.status !== 'active' || !isQuickDenimProduct(product.title)) return false
  const variant = product.variants.find((v) => v.id === variantId)
  return Boolean(variant && variant.stock > 0 && variant.price === QUICK_DENIM_UNIT_PRICE)
}

/** Starting a new fast order intentionally replaces this visitor's old cart. */
export async function startQuickDenim(input: unknown): Promise<ActionResult<null>> {
  const parsed = quickSelectionSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const { slug, variantId, quantity } = parsed.data
  if (!(await validQuickVariant(slug, variantId))) {
    return fail('validation', 'এই কালার/সাইজ এখন উপলব্ধ নেই। অন্যটি নির্বাচন করুন।')
  }
  const limiter = await rateLimit('quick-denim-select', 50, 3600)
  if (!limiter.ok) return fail('conflict', tooManyRequests(limiter.retryAfter))
  try {
    const existing = await cartService.readCart()
    for (const line of existing.lines) await cartService.removeLine(line.id)
    return await addToCartAction({ variantId, quantity })
  } catch {
    return fail('unexpected', 'পণ্য নির্বাচন করা যায়নি। আবার চেষ্টা করুন।')
  }
}

/** Add a second colour/size on the checkout screen without a separate cart page. */
export async function addQuickDenimVariant(input: unknown): Promise<ActionResult<null>> {
  const parsed = quickSelectionSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  const { slug, variantId, quantity } = parsed.data
  if (!(await validQuickVariant(slug, variantId))) {
    return fail('validation', 'নির্বাচিত কালার বা সাইজ পাওয়া যাচ্ছে না।')
  }
  const cart = await cartService.readCart()
  if (!cart.id || cart.lines.length === 0 || cart.lines.some((l) => l.productSlug !== slug)) {
    return fail('validation', 'আগে একটি ডেনিম প্যান্ট নির্বাচন করুন।')
  }
  if (cart.itemCount + quantity > QUICK_DENIM_MAX_ITEMS) {
    return fail('validation', 'এক অর্ডারে সর্বোচ্চ ১০ পিস নেওয়া যাবে।')
  }
  return addToCartAction({ variantId, quantity })
}

export async function placeQuickDenimCod(
  input: unknown,
): Promise<ActionResult<{ orderNumber: string }>> {
  const parsed = quickCodSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!configuredPaymentMethods().includes('cod')) {
    return fail('validation', 'এই মুহূর্তে ক্যাশ অন ডেলিভারি পাওয়া যাচ্ছে না।')
  }
  const limiter = await rateLimit('quick-denim-cod', 10, 3600)
  if (!limiter.ok) return fail('conflict', tooManyRequests(limiter.retryAfter))
  try {
    const order = await service.placeOrder({
      email: parsed.data.email,
      address: parsed.data.address,
      shippingRateId: '00000000-0000-4000-8000-000000000000', // not used in trusted quick-COD path
      paymentMethod: 'cod',
      saveAddress: false,
    }, { quickDenimSlug: parsed.data.slug })
    // A placed COD order is a lead, not a paid Purchase. Existing payment flow owns Purchase.
    after(() =>
      trackLead(`cod-order:${order.id}`, {
        value: order.total / 100,
        currency: 'BDT',
        contentName: 'MoyMoy COD order submitted',
      }).catch((error) => console.error('[meta] COD order lead failed', error)),
    )
    return ok({ orderNumber: order.orderNumber })
  } catch (error) {
    try {
      return toResult(error)
    } catch (unexpected) {
      console.error('[quick-denim] checkout failed', unexpected)
      return fail('unexpected', 'অর্ডার সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।')
    }
  }
}
