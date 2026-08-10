import type { MetadataRoute } from 'next'

import { getSiteUrl, isIndexableEnvironment } from '@/lib/site-metadata'
import { listActiveProductSlugs, listCategories } from '@/modules/catalog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableEnvironment()) return []

  const siteUrl = getSiteUrl()
  const [categories, productSlugs] = await Promise.all([
    listCategories(),
    listActiveProductSlugs(),
  ])

  return [
    { url: siteUrl.href, changeFrequency: 'weekly', priority: 1 },
    ...categories.map((category) => ({
      url: new URL(`/c/${category.slug}`, siteUrl).href,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...productSlugs.map(({ slug }) => ({
      url: new URL(`/p/${slug}`, siteUrl).href,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}

