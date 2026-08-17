import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { withDbRetry } from '@/lib/db/retry'

import { getStorefrontSettings } from './repository'
import { STOREFRONT_SETTINGS_TAGS } from './tags'

export async function getCachedStorefrontSettings() {
  'use cache'
  cacheTag(STOREFRONT_SETTINGS_TAGS.settings)
  cacheLife('max')

  return withDbRetry(() => getStorefrontSettings(), 'getStorefrontSettings')
}
