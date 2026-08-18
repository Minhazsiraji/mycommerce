import 'server-only'

import { and, asc, desc, eq, inArray, lt, or, sql } from 'drizzle-orm'

import { db } from '@/lib/db'
import {
  metaEventDeliveries,
  metaIntegrationSettings,
  metaOrderAttributions,
  orderItems,
  orders,
  products,
  productVariants,
} from '@/lib/db/schema'

export const META_STORE_KEY = 'default'

export function getMetaIntegrationSettings() {
  return db.query.metaIntegrationSettings.findFirst({
    where: eq(metaIntegrationSettings.storeKey, META_STORE_KEY),
  })
}

export async function saveMetaIntegrationSettings(input: {
  trackingEnabled: boolean
  pixelId: string | null
  datasetId: string | null
  accessTokenEncrypted: string | null
  testEventCode: string | null
  domainVerification: string | null
}) {
  const now = new Date()
  const [row] = await db
    .insert(metaIntegrationSettings)
    .values({ storeKey: META_STORE_KEY, ...input, updatedAt: now })
    .onConflictDoUpdate({
      target: metaIntegrationSettings.storeKey,
      set: { ...input, updatedAt: now },
    })
    .returning()
  return row
}

export async function recordMetaConnectionTest(status: 'ok' | 'error', message: string) {
  await db
    .update(metaIntegrationSettings)
    .set({
      lastConnectionTestAt: new Date(),
      lastConnectionStatus: status,
      lastConnectionMessage: message.slice(0, 300),
      updatedAt: new Date(),
    })
    .where(eq(metaIntegrationSettings.storeKey, META_STORE_KEY))
}

export async function recordMetaSuccessfulEvent(eventName: string) {
  await db
    .update(metaIntegrationSettings)
    .set({
      lastSuccessfulEventAt: new Date(),
      lastSuccessfulEventName: eventName.slice(0, 80),
      updatedAt: new Date(),
    })
    .where(eq(metaIntegrationSettings.storeKey, META_STORE_KEY))
}

export function listRecentMetaDeliveries(limit = 25) {
  return db
    .select({
      eventName: metaEventDeliveries.eventName,
      status: metaEventDeliveries.status,
      attempts: metaEventDeliveries.attempts,
      sentAt: metaEventDeliveries.sentAt,
      createdAt: metaEventDeliveries.createdAt,
      lastError: metaEventDeliveries.lastError,
    })
    .from(metaEventDeliveries)
    .orderBy(desc(metaEventDeliveries.createdAt))
    .limit(limit)
}

export function findVariantForTracking(variantId: string) {
  return db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      price: productVariants.price,
      productTitle: products.title,
      productStatus: products.status,
      archivedAt: productVariants.archivedAt,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(productVariants.id, variantId))
    .limit(1)
    .then((rows) => rows[0])
}

export async function saveOrderAttribution(input: {
  orderId: string
  fbp: string | null
  fbc: string | null
  clientUserAgent: string
  eventSourceUrl: string
}) {
  await db.insert(metaOrderAttributions).values(input).onConflictDoNothing()
}

export async function enqueuePurchase(orderId: string, eventId: string) {
  await db
    .insert(metaEventDeliveries)
    .values({ orderId, eventId, eventName: 'Purchase' })
    .onConflictDoNothing()
}

/** Atomically claims a delivery so concurrent webhook and cron calls cannot both send it. */
export async function claimDelivery(eventId: string) {
  const stale = new Date(Date.now() - 5 * 60_000)
  const [row] = await db
    .update(metaEventDeliveries)
    .set({
      status: 'sending',
      attempts: sql`${metaEventDeliveries.attempts} + 1`,
      lastError: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(metaEventDeliveries.eventId, eventId),
        lt(metaEventDeliveries.attempts, 10),
        or(
          inArray(metaEventDeliveries.status, ['pending', 'failed']),
          and(eq(metaEventDeliveries.status, 'sending'), lt(metaEventDeliveries.updatedAt, stale)),
        ),
      ),
    )
    .returning()

  return row
}

export async function getPurchaseContext(orderId: string) {
  const [order, attribution, items] = await Promise.all([
    db.query.orders.findFirst({ where: eq(orders.id, orderId) }),
    db.query.metaOrderAttributions.findFirst({
      where: eq(metaOrderAttributions.orderId, orderId),
    }),
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
  ])

  if (!order || !attribution) return null
  return { order, attribution, items }
}

export async function markDeliverySent(eventId: string) {
  await db
    .update(metaEventDeliveries)
    .set({ status: 'sent', sentAt: new Date(), lastError: null, updatedAt: new Date() })
    .where(eq(metaEventDeliveries.eventId, eventId))
}

export async function markDeliveryFailed(eventId: string, error: string) {
  await db
    .update(metaEventDeliveries)
    .set({ status: 'failed', lastError: error.slice(0, 500), updatedAt: new Date() })
    .where(eq(metaEventDeliveries.eventId, eventId))
}

export function listRetryableDeliveryIds(limit = 25) {
  const stale = new Date(Date.now() - 5 * 60_000)
  return db
    .select({ eventId: metaEventDeliveries.eventId })
    .from(metaEventDeliveries)
    .where(
      and(
        lt(metaEventDeliveries.attempts, 10),
        or(
          inArray(metaEventDeliveries.status, ['pending', 'failed']),
          and(eq(metaEventDeliveries.status, 'sending'), lt(metaEventDeliveries.updatedAt, stale)),
        ),
      ),
    )
    .orderBy(asc(metaEventDeliveries.createdAt))
    .limit(limit)
}

export async function deleteAttributionForUser(userId: string) {
  const orderIds = db.select({ id: orders.id }).from(orders).where(eq(orders.userId, userId))

  await db.transaction(async (tx) => {
    await tx.delete(metaEventDeliveries).where(inArray(metaEventDeliveries.orderId, orderIds))
    await tx.delete(metaOrderAttributions).where(inArray(metaOrderAttributions.orderId, orderIds))
  })
}
