import 'server-only'

import { cacheLife, cacheTag } from 'next/cache'

import { getMetaPublicConfig } from './integration'

export const META_INTEGRATION_CACHE_TAG = 'meta-integration-settings'

export async function getCachedMetaPublicConfig() {
  'use cache'
  cacheTag(META_INTEGRATION_CACHE_TAG)
  cacheLife('max')
  return getMetaPublicConfig()
}
