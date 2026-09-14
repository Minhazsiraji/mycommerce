/**
 * Generic ad/marketing attribution capture.
 *
 * Framework-agnostic on purpose: no `server-only`, no `'use client'`, no next
 * imports. The browser capture component and the server order-attribution path
 * both build on these pure functions, and the tests exercise them directly.
 *
 * This is the reusable AgentSiraji measurement structure, not a Stepfresh
 * landing-page parser. It preserves whatever ad context an inbound URL actually
 * carries — a Meta `fbclid`, standard `utm_*`, or generic campaign / ad-set /
 * ad / creative identifiers — and never invents a value that was not present.
 */

/** Our first-party record of inbound ad context. Distinct from Meta's `_fbc`. */
export const META_ATTRIBUTION_COOKIE = 'commerce_meta_attribution'

/**
 * 90 days: the ceiling of Meta's click-attribution window, so a purchase that
 * completes late still carries the click that earned it.
 */
export const META_ATTRIBUTION_MAX_AGE_SECONDS = 60 * 60 * 24 * 90

/** Meta's canonical click-id cookie, set by fbevents.js and mirrored by us. */
export const FBC_COOKIE = '_fbc'
/** Meta's canonical browser-id cookie, set by fbevents.js only. */
export const FBP_COOKIE = '_fbp'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

/**
 * Generic ad-identifier query keys. Not Meta-specific and not exhaustive by
 * design — URL builders across ad platforms append a subset of these, and a
 * future connected business can extend the list without touching event code.
 */
const AD_PARAM_KEYS = [
  'campaign_id',
  'campaign_name',
  'adset_id',
  'adset_name',
  'ad_id',
  'ad_name',
  'creative_id',
  'creative_name',
  'placement',
  'site_source_name',
] as const

const MAX_VALUE_LENGTH = 256
const MAX_FBCLID_LENGTH = 512
const MAX_PATH_LENGTH = 512

export type MetaAttribution = {
  /** Raw Meta click id from `?fbclid=`. */
  fbclid?: string
  /** `utm_*` pairs actually present on the inbound URL. */
  utm?: Record<string, string>
  /** Generic campaign / ad-set / ad / creative identifiers, when present. */
  adParams?: Record<string, string>
  /** Landing pathname only — query string is deliberately dropped. */
  landingPath?: string
  /** First-touch capture time (ms epoch). */
  capturedAt?: number
}

function clean(value: string | null | undefined, max: number): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().slice(0, max)
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Meta's `_fbc` value format: `fb.<subdomainIndex>.<creationTimeMs>.<fbclid>`.
 *
 * `subdomainIndex` is 1 for an `example.com`-style apex/`www` host, which is the
 * shape a store domain takes. `creationTimeMs` is milliseconds, not seconds.
 */
export function synthesizeFbc(fbclid: string, creationTimeMs: number, subdomainIndex = 1): string {
  return `fb.${subdomainIndex}.${Math.floor(creationTimeMs)}.${fbclid}`
}

/** Pulls ad context out of an absolute or relative URL. Never throws. */
export function parseAttributionFromUrl(rawUrl: string, base = 'http://localhost'): MetaAttribution {
  let params: URLSearchParams
  let pathname: string | undefined
  try {
    const url = new URL(rawUrl, base)
    params = url.searchParams
    pathname = url.pathname
  } catch {
    return {}
  }

  const result: MetaAttribution = {}

  const fbclid = clean(params.get('fbclid'), MAX_FBCLID_LENGTH)
  if (fbclid) result.fbclid = fbclid

  const utm: Record<string, string> = {}
  for (const key of UTM_KEYS) {
    const value = clean(params.get(key), MAX_VALUE_LENGTH)
    if (value) utm[key] = value
  }
  if (Object.keys(utm).length > 0) result.utm = utm

  const adParams: Record<string, string> = {}
  for (const key of AD_PARAM_KEYS) {
    const value = clean(params.get(key), MAX_VALUE_LENGTH)
    if (value) adParams[key] = value
  }
  if (Object.keys(adParams).length > 0) result.adParams = adParams

  if (pathname) result.landingPath = pathname.slice(0, MAX_PATH_LENGTH)

  return result
}

/** True when a parsed URL carried anything worth persisting. */
export function hasAttributionSignal(attribution: MetaAttribution): boolean {
  return Boolean(
    attribution.fbclid ||
      (attribution.utm && Object.keys(attribution.utm).length > 0) ||
      (attribution.adParams && Object.keys(attribution.adParams).length > 0),
  )
}

/**
 * Combines a stored record with a newly seen one.
 *
 * `fbclid` is last-touch — the most recent ad click is the one Meta attributes,
 * and the same rule keeps our `_fbc` mirror in step with fbevents.js. `utm` and
 * `adParams` merge per key so a fresh campaigned visit updates them while a
 * plain internal navigation clears nothing. `landingPath` / `capturedAt` stay
 * first-touch for reference.
 */
export function mergeAttribution(
  existing: MetaAttribution | null | undefined,
  incoming: MetaAttribution,
): MetaAttribution {
  const prev = existing ?? {}
  const merged: MetaAttribution = {}

  const fbclid = incoming.fbclid ?? prev.fbclid
  if (fbclid) merged.fbclid = fbclid

  const utm = { ...prev.utm, ...incoming.utm }
  if (Object.keys(utm).length > 0) merged.utm = utm

  const adParams = { ...prev.adParams, ...incoming.adParams }
  if (Object.keys(adParams).length > 0) merged.adParams = adParams

  const landingPath = prev.landingPath ?? incoming.landingPath
  if (landingPath) merged.landingPath = landingPath

  merged.capturedAt = prev.capturedAt ?? incoming.capturedAt ?? Date.now()

  return merged
}

/** Serialises for the first-party cookie. */
export function serializeAttribution(attribution: MetaAttribution): string {
  return JSON.stringify(attribution)
}

/** Parses the first-party cookie, rejecting anything malformed or oversized. */
export function parseAttributionCookie(raw: string | null | undefined): MetaAttribution | null {
  if (!raw || raw.length > 4096) return null

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    return null
  }
  if (!value || typeof value !== 'object') return null

  const candidate = value as Record<string, unknown>
  const result: MetaAttribution = {}

  if (typeof candidate.fbclid === 'string') {
    const fbclid = clean(candidate.fbclid, MAX_FBCLID_LENGTH)
    if (fbclid) result.fbclid = fbclid
  }

  result.utm = pickStringMap(candidate.utm, UTM_KEYS)
  result.adParams = pickStringMap(candidate.adParams, AD_PARAM_KEYS)
  if (!result.utm) delete result.utm
  if (!result.adParams) delete result.adParams

  if (typeof candidate.landingPath === 'string') {
    const landingPath = clean(candidate.landingPath, MAX_PATH_LENGTH)
    if (landingPath) result.landingPath = landingPath
  }
  if (typeof candidate.capturedAt === 'number' && Number.isFinite(candidate.capturedAt)) {
    result.capturedAt = candidate.capturedAt
  }

  return result
}

function pickStringMap(
  value: unknown,
  allowedKeys: readonly string[],
): Record<string, string> | undefined {
  if (!value || typeof value !== 'object') return undefined
  const source = value as Record<string, unknown>
  const out: Record<string, string> = {}
  for (const key of allowedKeys) {
    const cleaned = clean(typeof source[key] === 'string' ? (source[key] as string) : undefined, MAX_VALUE_LENGTH)
    if (cleaned) out[key] = cleaned
  }
  return Object.keys(out).length > 0 ? out : undefined
}
