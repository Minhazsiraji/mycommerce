import { getCachedStorefrontSettings } from '@/modules/storefront-settings'

/**
 * The store's icon.
 *
 * Next's `app/icon.svg` convention serves one file baked into the build, so a
 * client could only change their own favicon by editing our source — the exact
 * thing a white-label product must not require. This route resolves the
 * Admin-configured asset instead, and falls back to a neutral mark.
 *
 * A redirect rather than a proxy: the storage CDN already serves the bytes with
 * better caching than we would, and proxying would put every favicon request
 * through the application. Caching comes from `getCachedStorefrontSettings`
 * rather than a route segment config, which `cacheComponents` does not allow.
 */
export async function GET(request: Request) {
  const settings = await getCachedStorefrontSettings().catch(() => null)

  // Already validated by the settings repository against the allowed hosts.
  const configured = settings?.faviconUrl

  return Response.redirect(new URL(configured ?? '/brand/icon-default.svg', request.url), 307)
}
