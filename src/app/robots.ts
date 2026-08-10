import type { MetadataRoute } from 'next'

import { getSiteUrl, isIndexableEnvironment } from '@/lib/site-metadata'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexableEnvironment()) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', getSiteUrl()).href,
  }
}

