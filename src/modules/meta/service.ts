import 'server-only'

import { cookies, headers } from 'next/headers'
import { after } from 'next/server'

import { clientEnv, env } from '@/lib/env'
import type { CartLine } from '@/modules/cart'

import {
  META_CONSENT_COOKIE,
  META_CONSENT_GRANTED,
} from './consent'
import { purchaseEventId } from './event-id'
import { hashUserData, normalizeBdPhone, normalizeEmail } from './normalization'
import * as repo from './repository'
import { minorToMetaValue } from './value'
import type { MetaCustomData } from './validators'

type EventName = 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase'

type RequestContext = {
  clientIpAddress: string | null
  clientUserAgent: string | null
  eventSourceUrl: string
  fbp: string | null
  fbc: string | null
}

const capIdentifier = (value: string | undefined) => {
  const clean = value?.trim()
  return clean && clean.length <= 255 ? clean : null
}

const cleanUserAgent = (value: string | null) => value?.trim().slice(0, 500) || null

async function hasConsent() {
  return (await cookies()).get(META_CONSENT_COOKIE)?.value === META_CONSENT_GRANTED
}

function safeSourceUrl(raw: string | null, fallbackPath: string) {
  const base = new URL(clientEnv.NEXT_PUBLIC_APP_URL)

  try {
    const candidate = new URL(raw ?? fallbackPath, base)
    return candidate.origin === base.origin ? candidate.toString() : new URL(fallbackPath, base).toString()
  } catch {
    return new URL(fallbackPath, base).toString()
  }
}

async function requestContext(fallbackPath: string): Promise<RequestContext | null> {
  if (!(await hasConsent())) return null

  const [jar, requestHeaders] = await Promise.all([cookies(), headers()])
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()

  return {
    clientIpAddress: requestHeaders.get('cf-connecting-ip') ?? forwarded ?? null,
    clientUserAgent: cleanUserAgent(requestHeaders.get('user-agent')),
    eventSourceUrl: safeSourceUrl(requestHeaders.get('referer'), fallbackPath),
    fbp: capIdentifier(jar.get('_fbp')?.value),
    fbc: capIdentifier(jar.get('_fbc')?.value),
  }
}

function configured() {
  return Boolean(env.META_CAPI_DATASET_ID && env.META_CAPI_ACCESS_TOKEN)
}

export const isCapiConfigured = configured

async function postEvent(input: {
  eventName: EventName
  eventId: string
  eventTime?: Date
  eventSourceUrl: string
  customData: MetaCustomData
  userData: Record<string, string | string[] | undefined>
}) {
  if (!env.META_CAPI_DATASET_ID || !env.META_CAPI_ACCESS_TOKEN) return { sent: false as const }

  const event = {
    event_name: input.eventName,
    event_time: Math.floor((input.eventTime?.getTime() ?? Date.now()) / 1000),
    event_id: input.eventId,
    action_source: 'website',
    event_source_url: input.eventSourceUrl,
    user_data: input.userData,
    custom_data: input.customData,
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/${env.META_GRAPH_API_VERSION}/${encodeURIComponent(env.META_CAPI_DATASET_ID)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [event],
          ...(env.META_CAPI_TEST_EVENT_CODE
            ? { test_event_code: env.META_CAPI_TEST_EVENT_CODE }
            : {}),
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(5_000),
      },
    )

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300)
      return { sent: false as const, error: `Meta ${response.status}: ${detail}` }
    }

    return { sent: true as const }
  } catch (error) {
    return {
      sent: false as const,
      error: error instanceof Error ? error.message : 'Unknown Meta delivery failure',
    }
  }
}

async function sendRequestEvent(
  eventName: Exclude<EventName, 'Purchase'>,
  eventId: string,
  customData: MetaCustomData,
  fallbackPath: string,
) {
  if (!configured()) return
  const context = await requestContext(fallbackPath)
  if (!context?.clientUserAgent) return

  await postEvent({
    eventName,
    eventId,
    eventSourceUrl: context.eventSourceUrl,
    customData,
    userData: {
      client_ip_address: context.clientIpAddress ?? undefined,
      client_user_agent: context.clientUserAgent,
      fbp: context.fbp ?? undefined,
      fbc: context.fbc ?? undefined,
    },
  })
}

export async function trackViewContent(eventId: string, variantId: string) {
  const variant = await repo.findVariantForTracking(variantId)
  if (!variant || variant.productStatus !== 'active' || variant.archivedAt) return

  await sendRequestEvent(
    'ViewContent',
    eventId,
    {
      content_ids: [variant.id],
      content_name: variant.productTitle,
      content_type: 'product',
      contents: [{ id: variant.id, quantity: 1, item_price: minorToMetaValue(variant.price) }],
      currency: 'BDT',
      value: minorToMetaValue(variant.price),
    },
    '/p',
  )
}

export async function trackAddToCart(input: {
  eventId: string
  variant: { id: string; price: number; productTitle: string }
  quantity: number
}) {
  await sendRequestEvent(
    'AddToCart',
    input.eventId,
    {
      content_ids: [input.variant.id],
      content_name: input.variant.productTitle,
      content_type: 'product',
      contents: [
        {
          id: input.variant.id,
          quantity: input.quantity,
          item_price: minorToMetaValue(input.variant.price),
        },
      ],
      currency: 'BDT',
      value: minorToMetaValue(input.variant.price * input.quantity),
    },
    '/cart',
  )
}

export async function trackInitiateCheckout(eventId: string, cart: { lines: CartLine[]; subtotal: number; itemCount: number }) {
  await sendRequestEvent(
    'InitiateCheckout',
    eventId,
    {
      content_ids: cart.lines.map((line) => line.variantId),
      content_type: 'product',
      contents: cart.lines.map((line) => ({
        id: line.variantId,
        quantity: line.quantity,
        item_price: minorToMetaValue(line.unitPrice),
      })),
      currency: 'BDT',
      num_items: cart.itemCount,
      value: minorToMetaValue(cart.subtotal),
    },
    '/checkout',
  )
}

/** Best-effort and called only after the commercial order transaction commits. */
export async function captureOrderAttribution(orderId: string) {
  if (!configured()) return
  const context = await requestContext('/checkout')
  if (!context?.clientUserAgent) return

  await repo.saveOrderAttribution({
    orderId,
    fbp: context.fbp,
    fbc: context.fbc,
    clientUserAgent: context.clientUserAgent,
    eventSourceUrl: context.eventSourceUrl,
  })
}

export async function queuePurchase(orderId: string) {
  if (!configured()) return

  const context = await repo.getPurchaseContext(orderId)
  // No attribution row means analytics consent was not granted at checkout.
  if (!context || context.order.paymentStatus !== 'paid') return

  const eventId = purchaseEventId(orderId)
  await repo.enqueuePurchase(orderId, eventId)
  after(() =>
    deliverPurchase(eventId).catch((error) =>
      console.error('[meta] queued Purchase delivery failed', error),
    ),
  )
}

async function deliverPurchase(eventId: string) {
  const delivery = await repo.claimDelivery(eventId)
  if (!delivery) return

  const context = await repo.getPurchaseContext(delivery.orderId)
  if (!context) {
    await repo.markDeliveryFailed(eventId, 'Order or consented attribution is unavailable')
    return
  }

  const { order, attribution, items } = context
  const result = await postEvent({
    eventName: 'Purchase',
    eventId,
    eventTime: delivery.createdAt,
    eventSourceUrl: safeSourceUrl(
      `${clientEnv.NEXT_PUBLIC_APP_URL}/orders/${encodeURIComponent(order.orderNumber)}`,
      '/orders',
    ),
    userData: {
      em: [hashUserData(normalizeEmail(order.email))],
      ph: order.phone ? [hashUserData(normalizeBdPhone(order.phone))] : undefined,
      external_id: order.userId ? [hashUserData(order.userId)] : undefined,
      client_ip_address: order.checkoutIp ?? undefined,
      client_user_agent: attribution.clientUserAgent,
      fbp: attribution.fbp ?? undefined,
      fbc: attribution.fbc ?? undefined,
    },
    customData: {
      content_ids: items.map((item) => item.variantId ?? item.sku),
      content_type: 'product',
      contents: items.map((item) => ({
        id: item.variantId ?? item.sku,
        quantity: item.quantity,
        item_price: minorToMetaValue(item.unitPrice),
      })),
      currency: 'BDT',
      num_items: items.reduce((total, item) => total + item.quantity, 0),
      value: minorToMetaValue(order.total),
    },
  })

  if (result.sent) await repo.markDeliverySent(eventId)
  else await repo.markDeliveryFailed(eventId, result.error ?? 'Meta delivery was skipped')
}

export async function retryPendingPurchases() {
  if (!configured()) return 0
  const rows = await repo.listRetryableDeliveryIds()
  await Promise.all(rows.map((row) => deliverPurchase(row.eventId)))
  return rows.length
}

export const deleteOrderAttributionForUser = repo.deleteAttributionForUser
