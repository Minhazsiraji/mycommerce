import 'server-only'

import * as repo from './repository'
import type { ShippingRate } from './schema'
import type { ShippingRateInput } from './validators'

export class ShippingError extends Error {}

export type QuotedRate = {
  id: string
  name: string
  description: string | null
  /** What the customer actually pays — zero when the free threshold is met. */
  cost: number
  /** The normal price, so the UI can show that delivery was made free. */
  baseCost: number
  isFree: boolean
  estimatedDaysMin: number
  estimatedDaysMax: number
}

function appliesTo(rate: ShippingRate, district: string | null): boolean {
  // An empty district list is the catch-all for anywhere not named elsewhere.
  if (rate.districts.length === 0) return true
  if (!district) return false

  return rate.districts.some((d) => d.toLowerCase() === district.trim().toLowerCase())
}

function quote(rate: ShippingRate, subtotal: number): QuotedRate {
  const isFree = rate.freeOverSubtotal !== null && subtotal >= rate.freeOverSubtotal

  return {
    id: rate.id,
    name: rate.name,
    description: rate.description,
    cost: isFree ? 0 : rate.cost,
    baseCost: rate.cost,
    isFree,
    estimatedDaysMin: rate.estimatedDaysMin,
    estimatedDaysMax: rate.estimatedDaysMax,
  }
}

/**
 * Options for a destination.
 *
 * District-specific rates come first, catch-alls after, so "Inside Dhaka"
 * outranks "Rest of Bangladesh" for a Dhaka address while both remain
 * selectable. Returning an empty list means the store has configured nothing —
 * checkout must treat that as a configuration error rather than free delivery.
 */
export async function quoteRates(input: {
  district: string | null
  subtotal: number
}): Promise<QuotedRate[]> {
  const rates = await repo.listActiveRates()

  return rates
    .filter((rate) => appliesTo(rate, input.district))
    .sort((a, b) => {
      const aSpecific = a.districts.length > 0 ? 0 : 1
      const bSpecific = b.districts.length > 0 ? 0 : 1
      return aSpecific - bSpecific || a.position - b.position
    })
    .map((rate) => quote(rate, input.subtotal))
}

/**
 * Re-quotes one chosen rate at order time.
 *
 * Checkout must never take a shipping cost from the client — the same rule as
 * item prices. This resolves the id the customer picked back to its real cost
 * for the given subtotal.
 */
export async function resolveRate(input: {
  rateId: string
  district: string | null
  subtotal: number
}): Promise<QuotedRate> {
  const rate = await repo.getRate(input.rateId)

  if (!rate || !rate.active) throw new ShippingError('That delivery option is no longer available.')
  if (!appliesTo(rate, input.district)) {
    throw new ShippingError('That delivery option does not cover this address.')
  }

  return quote(rate, input.subtotal)
}

/**
 * The cheapest free-delivery threshold on offer, for the cart's progress hint.
 *
 * The cart does not know the destination yet, so it shows the most achievable
 * threshold — promising the easiest one and then charging more at checkout
 * would be worse than saying nothing.
 */
export async function lowestFreeThreshold(): Promise<number | null> {
  const rates = await repo.listActiveRates()

  const thresholds = rates
    .map((r) => r.freeOverSubtotal)
    .filter((t): t is number => t !== null && t > 0)

  return thresholds.length ? Math.min(...thresholds) : null
}

/** Soonest and latest across active rates, for a cart-level delivery estimate. */
export async function deliveryEstimate(): Promise<{ min: number; max: number } | null> {
  const rates = await repo.listActiveRates()
  if (!rates.length) return null

  return {
    min: Math.min(...rates.map((r) => r.estimatedDaysMin)),
    max: Math.max(...rates.map((r) => r.estimatedDaysMax)),
  }
}

export async function createRate(input: ShippingRateInput) {
  return repo.insertRate(input)
}

export async function updateRate(id: string, input: ShippingRateInput) {
  const row = await repo.updateRate(id, input)
  if (!row) throw new ShippingError('Delivery option not found.')
  return row
}

export async function deleteRate(id: string) {
  const remaining = (await repo.listRates()).filter((r) => r.id !== id)

  // Without a catch-all, anyone outside the named districts cannot check out.
  if (remaining.length > 0 && !remaining.some((r) => r.districts.length === 0 && r.active)) {
    throw new ShippingError(
      'Keep at least one option that covers everywhere else, or customers outside your listed districts cannot check out.',
    )
  }

  await repo.deleteRate(id)
}
