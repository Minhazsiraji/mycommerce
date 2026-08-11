import 'server-only'

import { and, asc, eq, isNull } from 'drizzle-orm'

import { db } from '@/lib/db'

import { addresses } from './schema'
import type { AddressInput } from './validators'

/** Saved address book. Orders copy addresses in as snapshots, never reference them. */

export function listAddresses(userId: string) {
  return db.query.addresses.findMany({
    where: and(eq(addresses.userId, userId), isNull(addresses.archivedAt)),
    orderBy: [asc(addresses.isDefault), asc(addresses.createdAt)],
  })
}

export async function getAddress(id: string, userId: string) {
  // Scoped by user in the WHERE clause, not checked afterwards — see the IDOR
  // note in docs/04-security.md.
  return db.query.addresses.findFirst({
    where: and(eq(addresses.id, id), eq(addresses.userId, userId), isNull(addresses.archivedAt)),
  })
}

export async function saveAddress(userId: string, input: AddressInput) {
  const existing = await listAddresses(userId)

  const [row] = await db
    .insert(addresses)
    .values({
      userId,
      recipient: input.recipient,
      phone: input.phone,
      line1: input.line1,
      line2: input.line2 ?? null,
      city: input.city,
      district: input.district,
      upazila: input.upazila,
      union: input.union ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country,
      // The first address saved becomes the default; there is nothing to choose
      // between yet, and an account with no default is an extra click forever.
      isDefault: existing.length === 0,
    })
    .returning()

  if (!row) throw new Error('Address insert returned no row')
  return row
}

/** Soft delete, so any historical reference stays resolvable. */
export async function archiveAddress(id: string, userId: string) {
  await db
    .update(addresses)
    .set({ archivedAt: new Date(), isDefault: false, updatedAt: new Date() })
    .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
}

export async function setDefaultAddress(id: string, userId: string) {
  await db.transaction(async (tx) => {
    await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId))
    await tx
      .update(addresses)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
  })
}
