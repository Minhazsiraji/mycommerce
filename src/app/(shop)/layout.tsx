import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'

import { AnnouncementBar } from '@/components/storefront/announcement-bar'
import { SiteFooter } from '@/components/storefront/site-footer'
import { StorefrontHeader } from '@/components/storefront/storefront-header'
import { formatBdt } from '@/lib/money'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import { getEffectiveMetaConfig } from '@/modules/meta'
import {
  MetaAnalytics,
  PrivacyChoicesButton,
} from '@/modules/meta/components/meta-analytics'
import { getCachedDeliverySummary } from '@/modules/shipping'
import { DEFAULT_STOREFRONT_SETTINGS, getCachedStorefrontSettings } from '@/modules/storefront-settings'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  await connection()
  try {
    const meta = await getEffectiveMetaConfig()
    return meta.domainVerification
      ? { other: { 'facebook-domain-verification': meta.domainVerification } }
      : {}
  } catch {
    return {}
  }
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  await connection()

  const [categoriesResult, deliveryResult, settingsResult, metaResult] = await Promise.allSettled([
    getCachedCategories(),
    getCachedDeliverySummary(),
    getCachedStorefrontSettings(),
    getEffectiveMetaConfig(),
  ])

  if (categoriesResult.status === 'rejected') {
    console.error('Unable to load storefront categories', categoriesResult.reason)
  }
  if (deliveryResult.status === 'rejected') {
    console.error('Unable to load storefront delivery facts', deliveryResult.reason)
  }
  if (settingsResult.status === 'rejected') {
    console.error('Unable to load storefront settings', settingsResult.reason)
  }
  if (metaResult.status === 'rejected') {
    console.error('Unable to load Meta integration configuration')
  }

  const categories = categoriesResult.status === 'fulfilled' ? categoriesResult.value : []
  const settings =
    settingsResult.status === 'fulfilled'
      ? settingsResult.value
      : { ...DEFAULT_STOREFRONT_SETTINGS }
  const meta =
    metaResult.status === 'fulfilled'
      ? metaResult.value
      : { enabled: false, source: 'disabled' as const }

  const topCategories = categories.filter((category) => !category.parentId)
  const announcementFacts: { key: 'delivery' | 'threshold'; label: string }[] = []

  if (settings.announcementEnabled) {
    const deliverySummary =
      deliveryResult.status === 'fulfilled' ? deliveryResult.value : { freeOver: null, estimate: null }
    const { freeOver, estimate } = deliverySummary
    const days = estimate && (estimate.min === estimate.max ? `${estimate.min}` : `${estimate.min}–${estimate.max}`)

    const deliveryLabel =
      settings.announcementDeliveryText ?? (days ? `Delivery in ${days} days` : null)
    const offerLabel =
      settings.announcementOfferText ?? (freeOver ? `Free delivery over ${formatBdt(freeOver)}` : null)

    if (deliveryLabel) announcementFacts.push({ key: 'delivery', label: deliveryLabel })
    if (offerLabel) announcementFacts.push({ key: 'threshold', label: offerLabel })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <MetaAnalytics pixelId={meta.pixelId} enabled={meta.enabled} />
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
        footer={{
          brandText: settings.footerBrandText,
          brandAccent: settings.footerBrandAccent,
          description: settings.footerDescription,
          copyright: settings.footerCopyright,
        }}
        privacyChoices={<PrivacyChoicesButton enabled={meta.enabled} />}
      />
    </div>
  )
}
