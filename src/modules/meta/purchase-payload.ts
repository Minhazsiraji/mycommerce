import { isSendableMetaPurchaseData } from './purchase-data'
import type { MetaCustomData } from './validators'

export const META_PURCHASE_ELEMENT_ID = 'meta-purchase-payload'

export type MetaPurchasePayload = {
  eventId: string
  data: MetaCustomData
}

export function metaPurchaseStorageKey(eventId: string) {
  return `commerce_meta_${eventId}`
}

/**
 * Pre-rename key. Still consulted before firing: an order page open in a tab
 * from before the rename would otherwise look un-fired and send a second
 * Purchase for the same sale. Meta's event ID would dedupe it, but a duplicate
 * that only the network deduplicates is one bad deploy away from double-counted
 * revenue.
 */
export function legacyMetaPurchaseStorageKey(eventId: string) {
  return `sirajibd_meta_${eventId}`
}

export function parseMetaPurchasePayload(raw: string | null | undefined): MetaPurchasePayload | null {
  if (!raw) return null

  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object') return null

    const candidate = value as { eventId?: unknown; data?: unknown }
    if (typeof candidate.eventId !== 'string' || candidate.eventId.length < 10) return null

    /**
     * The shape is checked, not assumed. Previously any object passed, so a
     * truncated or malformed block would still reach
     * `fbq('track', 'Purchase', …)` — and a Purchase missing a valid currency
     * is precisely what makes Meta log "Parameter 'currency' is invalid for
     * event 'Purchase'" and drop the conversion.
     */
    if (!isSendableMetaPurchaseData(candidate.data)) return null

    return {
      eventId: candidate.eventId,
      data: candidate.data as MetaCustomData,
    }
  } catch {
    return null
  }
}
