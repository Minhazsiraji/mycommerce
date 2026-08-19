import type { MetaCustomData } from './validators'

export const META_PURCHASE_ELEMENT_ID = 'meta-purchase-payload'

export type MetaPurchasePayload = {
  eventId: string
  data: MetaCustomData
}

export function metaPurchaseStorageKey(eventId: string) {
  return `sirajibd_meta_${eventId}`
}

export function parseMetaPurchasePayload(raw: string | null | undefined): MetaPurchasePayload | null {
  if (!raw) return null

  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object') return null

    const candidate = value as { eventId?: unknown; data?: unknown }
    if (typeof candidate.eventId !== 'string' || candidate.eventId.length < 10) return null
    if (!candidate.data || typeof candidate.data !== 'object') return null

    return {
      eventId: candidate.eventId,
      data: candidate.data as MetaCustomData,
    }
  } catch {
    return null
  }
}
