export const META_CONSENT_COOKIE = 'sirajibd_analytics_consent'
export const META_CONSENT_GRANTED = 'granted_v1'
export const META_CONSENT_DENIED = 'denied_v1'
export const META_CONSENT_EVENT = 'sirajibd:analytics-consent'
export const META_PRIVACY_OPEN_EVENT = 'sirajibd:open-privacy'

export type MetaConsent = 'granted' | 'denied' | 'unset'

export function parseMetaConsent(value: string | undefined): MetaConsent {
  if (value === META_CONSENT_GRANTED) return 'granted'
  if (value === META_CONSENT_DENIED) return 'denied'
  return 'unset'
}
