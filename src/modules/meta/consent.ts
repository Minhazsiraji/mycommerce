export const META_CONSENT_COOKIE = 'commerce_analytics_consent'
export const META_CONSENT_GRANTED = 'granted_v1'
export const META_CONSENT_DENIED = 'denied_v1'
export const META_CONSENT_EVENT = 'commerce:analytics-consent'
export const META_PRIVACY_OPEN_EVENT = 'commerce:open-privacy'

/**
 * Fired when the pixel finishes loading, so trackers that gave up before it was
 * ready can retry. Named here rather than repeated as a literal in each
 * listener — the dispatcher and the listeners drifting apart would silently
 * lose every event queued before load.
 */
export const META_PIXEL_READY_EVENT = 'commerce:pixel-ready'

/**
 * The name this cookie carried before the storefront became white-label.
 *
 * A stored analytics choice is a privacy decision the visitor already made, so
 * renaming the cookie must not quietly discard it and re-prompt — or worse,
 * treat a previous "denied" as unset and start tracking again. Every read falls
 * back to this name, and `migrateLegacyConsent` rewrites it under the generic
 * one on first visit. Delete once the year-long Max-Age has expired for
 * everyone, some time after 2027-08.
 */
export const LEGACY_CONSENT_COOKIE = 'sirajibd_analytics_consent'

export type MetaConsent = 'granted' | 'denied' | 'unset'

export function parseMetaConsent(value: string | undefined): MetaConsent {
  if (value === META_CONSENT_GRANTED) return 'granted'
  if (value === META_CONSENT_DENIED) return 'denied'
  return 'unset'
}
