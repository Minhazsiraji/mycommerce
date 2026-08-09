import { Suspense } from 'react'

import { AnnouncementBar } from '@/components/storefront/announcement-bar'
import { SiteFooter } from '@/components/storefront/site-footer'
import { StorefrontHeader } from '@/components/storefront/storefront-header'
import { formatBdt } from '@/lib/money'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import { getCachedDeliverySummary } from '@/modules/shipping'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
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
      <StorefrontHeader
        categories={topCategories}
        cart={
          <Suspense fallback={<CartBadgeFallback />}>
            <CartBadge />
          </Suspense>
        }
      />
      <AnnouncementBar facts={announcementFacts} />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-(--container-content) flex-1 px-4 py-8 outline-none sm:px-6 md:py-10 lg:px-8"
      >
        {children}
      </main>

      <SiteFooter categories={topCategories} />
    </div>
  )
}
