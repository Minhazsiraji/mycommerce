import type { MetaCustomData } from './validators'

export const META_VIEW_CONTENT_ELEMENT_ID = 'meta-view-content-payload'

export type MetaViewContentPayload = {
  eventId: string
  variantId: string
  eventSourceUrl: string
  data: MetaCustomData
}

export function parseMetaViewContentPayload(raw: string | null | undefined): MetaViewContentPayload | null {
  if (!raw) return null

  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object') return null
    const candidate = value as Partial<MetaViewContentPayload>

    if (typeof candidate.eventId !== 'string' || candidate.eventId.length < 10) return null
    if (typeof candidate.variantId !== 'string' || candidate.variantId.length < 10) return null
    if (typeof candidate.eventSourceUrl !== 'string' || !candidate.eventSourceUrl.startsWith('http')) return null
    if (!candidate.data || typeof candidate.data !== 'object') return null

    return candidate as MetaViewContentPayload
  } catch {
    return null
  }
}
