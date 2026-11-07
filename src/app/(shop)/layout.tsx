import type { Metadata } from 'next'
import { Suspense } from 'react'
import { connection } from 'next/server'

import { AnnouncementBar } from '@/components/storefront/announcement-bar'
import { SiteFooter } from '@/components/storefront/site-footer'
import { StorefrontHeader } from '@/components/storefront/storefront-header'
import { formatBdt } from '@/lib/money'
import { STORE_CONFIG } from '@/lib/store-config'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import { getEffectiveGoogleConfig } from '@/modules/google'
import { GoogleAnalytics } from '@/modules/google/components/google-analytics'
import { getEffectiveMetaConfig } from '@/modules/meta'
import { MetaAttributionCapture } from '@/modules/meta/components/attribution-capture'
import { ContactLinkTracker } from '@/modules/meta/components/contact-link-tracker'
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

  const [categoriesResult, deliveryResult, settingsResult, metaResult, googleResult] = await Promise.allSettled([
    getCachedCategories(),
    getCachedDeliverySummary(),
    getCachedStorefrontSettings(),
    getEffectiveMetaConfig(),
    getEffectiveGoogleConfig(),
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
  if (googleResult.status === 'rejected') {
    console.error('Unable to load Google integration configuration')
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
  const google =
    googleResult.status === 'fulfilled'
      ? googleResult.value
      : { enabled: false, source: 'disabled' as const, purchaseTrackingEnabled: false }
  const analyticsEnabled = meta.enabled || google.enabled

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

  const implicitAnalyticsConsent = process.env.STORE_ANALYTICS_CONSENT_MODE?.trim() === 'implicit'
  const socialCommerceMode = process.env.STORE_SOCIAL_COMMERCE_MODE?.trim() === 'true'
  const socialLogoPath = process.env.STORE_SOCIAL_LOGO_PATH?.trim()

  return (
    <div className="flex min-h-dvh flex-col">
      <MetaAnalytics pixelId={meta.pixelId} enabled={analyticsEnabled} implicitConsent={implicitAnalyticsConsent} />
      <MetaAttributionCapture enabled={meta.enabled} />
      <ContactLinkTracker enabled={meta.enabled} />
      <GoogleAnalytics tagId={google.tagId} enabled={google.enabled} />
      <div className={socialCommerceMode ? 'px-3 pt-3 sm:px-6 sm:pt-4 lg:px-8 lg:pt-6' : 'px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6'}>
        <div className="mx-auto w-full max-w-(--container-wide) overflow-hidden rounded-(--radius-xl) border border-white/70 bg-(image:--gradient-brand-soft) shadow-(--shadow-1) backdrop-blur-[12px] dark:border-white/20">
          <StorefrontHeader
            categories={topCategories}
            compactSocial={socialCommerceMode}
            brand={{
              name: STORE_CONFIG.name,
              text: socialCommerceMode ? 'MoyMoy' : STORE_CONFIG.brandText,
              accent: socialCommerceMode ? '' : STORE_CONFIG.brandAccent,
              // An uploaded logo replaces the wordmark; unset keeps the text,
              // so a store with no artwork still has a usable header.
              logoUrl: socialCommerceMode ? socialLogoPath : settings.logoUrl,
            }}
            cart={
              <Suspense fallback={<CartBadgeFallback />}>
                <CartBadge />
              </Suspense>
            }
          />
          {!socialCommerceMode ? <AnnouncementBar facts={announcementFacts} /> : null}
        </div>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className={socialCommerceMode ? 'mx-auto w-full max-w-(--container-content) flex-1 px-3 py-4 outline-none sm:px-6 sm:py-8 md:py-10 lg:px-8' : 'mx-auto w-full max-w-(--container-content) flex-1 px-4 py-8 outline-none sm:px-6 md:py-10 lg:px-8'}
      >
        {children}
      </main>

      <SiteFooter
        categories={socialCommerceMode ? [] : topCategories}
        footer={{
          brandText: socialCommerceMode ? (process.env.STORE_FOOTER_BRAND_TEXT?.trim() || 'MoyMoy') : settings.footerBrandText,
          brandAccent: socialCommerceMode ? '' : settings.footerBrandAccent,
          description: socialCommerceMode ? (process.env.STORE_FOOTER_DESCRIPTION?.trim() || 'Fashion made easy for everyday Bangladesh.') : settings.footerDescription,
          copyright: socialCommerceMode ? (process.env.STORE_FOOTER_COPYRIGHT?.trim() || '© MoyMoy. All rights reserved.') : settings.footerCopyright,
        }}
        hideContact={socialCommerceMode}
        privacyChoices={<PrivacyChoicesButton enabled={analyticsEnabled} hidden={implicitAnalyticsConsent} />}
      />
    </div>
  )
}
