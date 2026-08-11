import { Suspense } from 'react'

import { AnnouncementBar } from '@/components/storefront/announcement-bar'
import { SiteFooter } from '@/components/storefront/site-footer'
import { StorefrontHeader } from '@/components/storefront/storefront-header'
import { formatBdt } from '@/lib/money'
import { clientEnv, env } from '@/lib/env'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import {
  MetaAnalytics,
  PrivacyChoicesButton,
} from '@/modules/meta/components/meta-analytics'
import { getCachedDeliverySummary } from '@/modules/shipping'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const metaEnabled = Boolean(
    clientEnv.NEXT_PUBLIC_META_PIXEL_ID ||
      (env.META_CAPI_DATASET_ID && env.META_CAPI_ACCESS_TOKEN),
  )
  let categories: Awaited<ReturnType<typeof getCachedCategories>> = []

  try {
    categories = await getCachedCategories()
  } catch (error) {
    console.error('Unable to load storefront categories', error)
  }

  const topCategories = categories.filter((category) => !category.parentId)
  const announcementFacts: { key: 'delivery' | 'threshold'; label: string }[] = []

  try {
    const { freeOver, estimate } = await getCachedDeliverySummary()
    const days =
      estimate &&
      (estimate.min === estimate.max ? `${estimate.min}` : `${estimate.min}–${estimate.max}`)

    if (days) announcementFacts.push({ key: 'delivery', label: `Delivery in ${days} days` })
    if (freeOver) {
      announcementFacts.push({
        key: 'threshold',
        label: `Free delivery over ${formatBdt(freeOver)}`,
      })
    }
  } catch (error) {
    console.error('Unable to load storefront delivery facts', error)
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MetaAnalytics pixelId={clientEnv.NEXT_PUBLIC_META_PIXEL_ID} enabled={metaEnabled} />
      <div className="px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <div className="mx-auto w-full max-w-(--container-wide) overflow-hidden rounded-(--radius-xl) border border-white/70 bg-(image:--gradient-brand-soft) shadow-(--shadow-1) backdrop-blur-[12px] dark:border-white/20">
          <StorefrontHeader
            categories={topCategories}
            cart={
              <Suspense fallback={<CartBadgeFallback />}>
                <CartBadge />
              </Suspense>
            }
          />
          <AnnouncementBar facts={announcementFacts} />
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-(--container-content) flex-1 px-4 py-8 outline-none sm:px-6 md:py-10 lg:px-8"
      >
        {children}
      </main>

      <SiteFooter
        categories={topCategories}
        privacyChoices={<PrivacyChoicesButton enabled={metaEnabled} />}
      />
    </div>
  )
}
