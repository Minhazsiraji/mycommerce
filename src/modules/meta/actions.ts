'use server'

import { ok, fromZodError, type ActionResult } from '@/lib/action-result'
import { rateLimit } from '@/lib/rate-limit'
import { readCart } from '@/modules/cart'
import { getProductBySlug } from '@/modules/catalog'
import { CURRENCY } from '@/lib/money'
import { minorToMetaValue } from './value'

import * as service from './service'
import {
  addPaymentInfoEventSchema,
  contactEventSchema,
  initiateCheckoutEventSchema,
  leadEventSchema,
  viewContentEventSchema,
  viewContentPrepareSchema,
} from './validators'

export async function prepareViewContent(input: unknown): Promise<ActionResult<{
  eventId: string
  variantId: string
  data: {
    content_ids: string[]
    content_name: string
    content_type: 'product'
    contents: { id: string; quantity: number; item_price: number }[]
    currency: string
    value: number
  }
} | null>> {
  const parsed = viewContentPrepareSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)

  const product = await getProductBySlug(parsed.data.slug)
  if (!product || product.status !== 'active') return ok(null)

  const variant = product.variants.find((item) => item.stock > 0) ?? product.variants[0]
  if (!variant) return ok(null)

  const value = variant.price / 100
  return ok({
    eventId: `viewcontent:${crypto.randomUUID()}`,
    variantId: variant.id,
    data: {
      content_ids: [variant.id],
      content_name: product.title,
      content_type: 'product',
      contents: [{ id: variant.id, quantity: 1, item_price: value }],
      currency: CURRENCY,
      value,
    },
  })
}

export async function trackViewContent(input: unknown): Promise<ActionResult<boolean>> {
  const parsed = viewContentEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(false)

  const limit = await rateLimit('meta-view-content', 120, 3600)
  if (!limit.ok) return ok(false)

  const sent = await service.trackViewContent(
    parsed.data.eventId,
    parsed.data.variantId,
    parsed.data.eventSourceUrl,
  )
  return ok(sent)
}

export async function prepareInitiateCheckout(): Promise<ActionResult<{
  eventId: string
  data: {
    content_ids: string[]
    content_type: 'product'
    contents: { id: string; quantity: number; item_price: number }[]
    currency: string
    num_items: number
    value: number
  }
} | null>> {
  const cart = await readCart()
  if (!cart.id || cart.lines.length === 0 || cart.hasIssues) return ok(null)

  return ok({
    eventId: `initiatecheckout:${crypto.randomUUID()}`,
    data: {
      content_ids: cart.lines.map((line) => line.variantId),
      content_type: 'product',
      contents: cart.lines.map((line) => ({
        id: line.variantId,
        quantity: line.quantity,
        item_price: minorToMetaValue(line.unitPrice),
      })),
      currency: CURRENCY,
      num_items: cart.itemCount,
      value: minorToMetaValue(cart.subtotal),
    },
  })
}

export async function trackInitiateCheckout(input: unknown): Promise<ActionResult<null>> {
  const parsed = initiateCheckoutEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-initiate-checkout', 30, 3600)
  if (!limit.ok) return ok(null)

  const cart = await readCart()
  if (!cart.id || cart.lines.length === 0 || cart.hasIssues) return ok(null)

  await service.trackInitiateCheckout(parsed.data.eventId, cart)
  return ok(null)
}

export async function trackAddPaymentInfo(input: unknown): Promise<ActionResult<null>> {
  const parsed = addPaymentInfoEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-add-payment-info', 30, 3600)
  if (!limit.ok) return ok(null)

  const cart = await readCart()
  if (!cart.id || cart.lines.length === 0 || cart.hasIssues) return ok(null)

  await service.trackAddPaymentInfo(parsed.data.eventId, cart)
  return ok(null)
}

export async function trackContact(input: unknown): Promise<ActionResult<null>> {
  const parsed = contactEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-contact', 30, 3600)
  if (!limit.ok) return ok(null)

  await service.trackContact(parsed.data.eventId, parsed.data.method)
  return ok(null)
}

/**
 * Reusable Lead delivery. No storefront surface calls this yet — it exists so
 * the AgentSiraji.com Store-Audit form (a separate app) can be wired to a
 * consistent, deduplicated Lead path without reimplementing CAPI.
 */
export async function trackLead(input: unknown): Promise<ActionResult<null>> {
  const parsed = leadEventSchema.safeParse(input)
  if (!parsed.success) return fromZodError(parsed.error)
  if (!(await service.isCapiConfigured())) return ok(null)

  const limit = await rateLimit('meta-lead', 30, 3600)
  if (!limit.ok) return ok(null)

  await service.trackLead(parsed.data.eventId, {
    value: parsed.data.value,
    currency: parsed.data.currency,
    contentName: parsed.data.contentName,
  })
  return ok(null)
}
