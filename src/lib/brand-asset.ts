/**
 * Validates a store-configured brand asset URL.
 *
 * These values are typed into Admin and rendered into `<img>` and `<link rel>`
 * tags, so they are untrusted input on a privileged surface. An unchecked value
 * is a stored-XSS vector (`javascript:`), a privacy leak (a tracking pixel on a
 * third-party host loaded by every visitor), and a hard 500 on every page —
 * next/image refuses a host it does not recognise.
 *
 * Allowed: a same-origin path, or https on a host next/image is configured for.
 * Anything else returns null and the caller falls back, because a missing logo
 * is a cosmetic problem and a hostile one is not.
 */
const ALLOWED_HOSTS = new Set(['res.cloudinary.com'])

export function safeBrandAssetUrl(value: string | null | undefined): string | null {
  const raw = value?.trim()
  if (!raw) return null

  // A same-origin path. Rejects "//evil.example" — protocol-relative, and a
  // browser reads it as a different origin entirely.
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  if (url.protocol !== 'https:') return null
  if (!ALLOWED_HOSTS.has(url.hostname)) return null

  return url.toString()
}

/** The hosts a configured asset may come from, for Admin help text. */
export const BRAND_ASSET_HOSTS = [...ALLOWED_HOSTS]
