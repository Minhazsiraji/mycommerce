import 'server-only'

import { and, eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { orders, shipments } from '@/lib/db/schema'

const BASE_URL = 'https://portal.packzy.com/api/v1'

type SteadfastCreateResponse = {
  status?: number
  message?: string
  consignment?: {
    consignment_id?: number | string
    tracking_code?: string
    invoice?: string
    status?: string
  }
}

type SteadfastStatusResponse = {
  status?: number
  delivery_status?: string
}

function credentials() {
  const apiKey = process.env.STEADFAST_API_KEY?.trim()
  const secretKey = process.env.STEADFAST_SECRET_KEY?.trim()
  return apiKey && secretKey ? { apiKey, secretKey } : null
}

export function isSteadfastConfigured() {
  return Boolean(credentials())
}

async function steadfastFetch(path: string, init?: RequestInit) {
  const auth = credentials()
  if (!auth) throw new Error('Steadfast is not configured')

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Api-Key': auth.apiKey,
      'Secret-Key': auth.secretKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15_000),
  })

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    throw new Error(
      typeof body.message === 'string'
        ? body.message
        : `Steadfast request failed with HTTP ${response.status}`,
    )
  }
  return body
}

function addressText(address: {
  line1: string
  line2?: string | null
  union?: string | null
  upazila: string
  city: string
  district: string
  postalCode?: string | null
}) {
  return [
    address.line1,
    address.line2,
    address.union,
    address.upazila,
    address.city,
    address.district,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ')
    .slice(0, 250)
}

export async function bookConfirmedOrderWithSteadfast(orderId: string) {
  if (!isSteadfastConfigured()) return null

  const existing = await db.query.shipments.findFirst({
    where: and(eq(shipments.orderId, orderId), eq(shipments.carrier, 'Steadfast')),
  })
  if (existing) return existing

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  })
  if (!order || order.status !== 'confirmed') return null

  const codAmount = order.paymentMethod === 'cod' && order.paymentStatus === 'cod_pending'
    ? order.total / 100
    : 0

  const response = (await steadfastFetch('/create_order', {
    method: 'POST',
    body: JSON.stringify({
      invoice: order.orderNumber,
      recipient_name: order.shippingAddress.recipient.slice(0, 100),
      recipient_phone: order.shippingAddress.phone,
      recipient_email: order.email,
      recipient_address: addressText(order.shippingAddress),
      cod_amount: codAmount,
      note: order.notes || undefined,
      item_description: order.items
        .map((item) => `${item.productTitle}${item.variantTitle ? ` (${item.variantTitle})` : ''} x${item.quantity}`)
        .join(', ')
        .slice(0, 500),
      total_lot: order.items.reduce((sum, item) => sum + item.quantity, 0),
      delivery_type: 0,
    }),
  })) as SteadfastCreateResponse

  const trackingCode = response.consignment?.tracking_code?.trim()
  const consignmentId = response.consignment?.consignment_id
  if (!trackingCode && !consignmentId) {
    throw new Error(response.message || 'Steadfast did not return a tracking code')
  }

  const [shipment] = await db
    .insert(shipments)
    .values({
      orderId,
      carrier: 'Steadfast',
      trackingNumber: trackingCode || String(consignmentId),
    })
    .returning()

  return shipment ?? null
}

export async function getSteadfastStatus(trackingCode: string) {
  if (!isSteadfastConfigured() || !trackingCode.trim()) return null

  const response = (await steadfastFetch(
    `/status_by_trackingcode/${encodeURIComponent(trackingCode.trim())}`,
  )) as SteadfastStatusResponse

  return typeof response.delivery_status === 'string' ? response.delivery_status : null
}

export function steadfastPublicTrackingUrl() {
  return 'https://steadfast.com.bd/tracking'
}
