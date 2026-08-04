import 'server-only'

import { asc, eq } from 'drizzle-orm'

import { db } from '@/lib/db'

import { shippingRates } from './schema'
import type { ShippingRateInput } from './validators'

/** The only place Drizzle is called for shipping data. */

export function listRates() {
  return db.query.shippingRates.findMany({
    orderBy: [asc(shippingRates.position), asc(shippingRates.name)],
  })
}

export function listActiveRates() {
  return db.query.shippingRates.findMany({
    where: eq(shippingRates.active, true),
    orderBy: [asc(shippingRates.position), asc(shippingRates.name)],
  })
}

export function getRate(id: string) {
  return db.query.shippingRates.findFirst({ where: eq(shippingRates.id, id) })
}

export async function insertRate(input: ShippingRateInput) {
  const [row] = await db
    .insert(shippingRates)
    .values({ ...input, description: input.description ?? null })
    .returning()

  if (!row) throw new Error('Shipping rate insert returned no row')
  return row
}

export async function updateRate(id: string, input: ShippingRateInput) {
  const [row] = await db
    .update(shippingRates)
    .set({ ...input, description: input.description ?? null, updatedAt: new Date() })
    .where(eq(shippingRates.id, id))
    .returning()

  return row
}

export async function deleteRate(id: string) {
  await db.delete(shippingRates).where(eq(shippingRates.id, id))
}
