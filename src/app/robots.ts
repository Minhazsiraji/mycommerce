import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'

import { getSiteUrl, isCanonicalRequestHost, isIndexableEnvironment } from '@/lib/site-metadata'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get('host')?.split(':')[0] ?? ''
  if (!isIndexableEnvironment() || !isCanonicalRequestHost(host)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: new URL('/sitemap.xml', getSiteUrl()).href,
  }
}

