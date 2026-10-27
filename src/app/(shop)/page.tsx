import Image from 'next/image'
import { connection } from 'next/server'

import { HomepageHero } from '@/components/storefront/homepage-hero'
import { SectionHeader } from '@/components/storefront/section-header'
import { STORE_CONFIG } from '@/lib/store-config'
import { getCachedActiveProducts, getCachedCategories } from '@/modules/catalog'
import { CategoryCard } from '@/modules/catalog/components/category-card'
import { ProductGrid } from '@/modules/catalog/components/product-card'
import { DEFAULT_STOREFRONT_SETTINGS, getCachedStorefrontSettings } from '@/modules/storefront-settings'

export default async function HomePage() {
  await connection()

  const [categoryResult, productResult, settingsResult] = await Promise.allSettled([
    getCachedCategories(),
    getCachedActiveProducts({ sort: 'newest', page: 1 }),
    getCachedStorefrontSettings(),
  ])

  if (categoryResult.status === 'rejected') {
    console.error('Unable to load homepage categories', categoryResult.reason)
  }

  if (productResult.status === 'rejected') {
    console.error('Unable to load homepage new arrivals', productResult.reason)
  }

  if (settingsResult.status === 'rejected') {
    console.error('Unable to load homepage settings', settingsResult.reason)
  }

  const settings =
    settingsResult.status === 'fulfilled'
      ? settingsResult.value
      : { ...DEFAULT_STOREFRONT_SETTINGS }

  const categories =
    categoryResult.status === 'fulfilled'
      ? categoryResult.value.filter((category) => !category.parentId).slice(0, 4)
      : []

  const products =
    productResult.status === 'fulfilled'
      ? productResult.value.rows.map((row) => ({ ...row, totalStock: Number(row.totalStock) }))
      : []

  const catalogIsEmpty =
    productResult.status === 'fulfilled' && productResult.value.total === 0
  const allDiscoveryFailed =
    categoryResult.status === 'rejected' && productResult.status === 'rejected'
  const socialCommerceMode = process.env.STORE_SOCIAL_COMMERCE_MODE?.trim() === 'true'
  const socialLogoPath = process.env.STORE_SOCIAL_LOGO_PATH?.trim()

  if (socialCommerceMode) {
    return (
      <div className="flex flex-col gap-8 md:gap-10">
        <section className="rounded-(--radius-xl) border border-(--border-subtle) bg-(--surface-primary) px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            {socialLogoPath ? (
              <Image src={socialLogoPath} alt="" width={56} height={56} className="size-14 rounded-full object-cover" priority />
            ) : null}
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight">MoyMoy</h1>
              {process.env.STORE_TAGLINE?.trim() ? <p className="mt-1 text-sm font-medium">{process.env.STORE_TAGLINE.trim()}</p> : null}
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
            <div><dt className="font-medium">Delivery</dt><dd className="text-(--text-secondary)">{process.env.STORE_DELIVERY_TEXT?.trim() || 'Nationwide delivery available'}</dd></div>
            <div><dt className="font-medium">Lead time</dt><dd className="text-(--text-secondary)">{process.env.STORE_LEAD_TIME_TEXT?.trim() || 'Shown with each delivery option'}</dd></div>
            <div><dt className="font-medium">Payment</dt><dd className="text-(--text-secondary)">{process.env.STORE_PAYMENT_TEXT?.trim() || 'Cash on delivery and configured manual payment options'}</dd></div>
          </dl>
        </section>

        <section aria-labelledby="products-title">
          <SectionHeader id="products-title" title="Shop products" />
          {products.length > 0 ? <div className="mt-4"><ProductGrid products={products} priorityCount={2} /></div> : (
            <div className="mt-4 rounded-(--radius-xl) border border-dashed border-(--border-strong) px-6 py-12 text-center">
              <p className="font-medium">Products are being added.</p>
            </div>
          )}
        </section>
      </div>
    )
  }

  const categoryGridColumns =
    categories.length === 1
      ? 'lg:grid-cols-8 [&>li]:lg:col-span-2 [&>li:first-child]:lg:col-start-4'
      : categories.length === 2
        ? 'lg:grid-cols-8 [&>li]:lg:col-span-2 [&>li:first-child]:lg:col-start-3'
        : categories.length === 3
          ? 'lg:grid-cols-8 [&>li]:lg:col-span-2 [&>li:first-child]:lg:col-start-2'
          : 'lg:grid-cols-4'

  return (
    <div className="flex flex-col gap-16 md:gap-20">
      {settings.heroEnabled ? (
        <HomepageHero hasCategories={categories.length > 0} settings={settings} />
      ) : (
        <h1 className="sr-only">{settings.heroTitle}</h1>
      )}

      {categories.length > 0 ? (
        <section id="categories" aria-labelledby="categories-title" className="scroll-mt-6">
          <SectionHeader
            id="categories-title"
            title="Featured categories"
          />
          <ul
            className={`mt-6 grid grid-cols-1 gap-x-4 gap-y-8 min-[360px]:grid-cols-2 sm:grid-cols-3 sm:gap-x-5 lg:gap-x-6 ${categoryGridColumns}`}
          >
            {categories.map((category) => (
              <li key={category.id} className="h-full">
                <CategoryCard category={category} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {productResult.status === 'fulfilled' ? (
        <section aria-labelledby="new-arrivals-title">
          <SectionHeader
            id="new-arrivals-title"
            title="New arrivals"
          />

          {products.length > 0 ? (
            <div className="mt-6">
              <ProductGrid products={products} priorityCount={0} />
            </div>
          ) : catalogIsEmpty ? (
            <div className="mt-6 rounded-(--radius-xl) border border-dashed border-(--border-strong) bg-(--surface-primary) px-6 py-14 text-center">
              <p className="text-lg font-semibold text-(--text-primary)">No products are available yet.</p>
              {categories.length > 0 ? (
                <a
                  href="#categories"
                  className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-(--text-primary) underline underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                >
                  Browse categories
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section
        aria-labelledby="everyday-shopping-title"
        className="storefront-card px-6 py-8 sm:px-8 sm:py-10"
      >
        <div className="max-w-3xl space-y-4">
          <h2 id="everyday-shopping-title" className="text-2xl font-semibold tracking-tight">
            Everyday shopping made simpler in {STORE_CONFIG.countryName}
          </h2>
          <p className="leading-7 text-(--text-secondary)">
            {STORE_CONFIG.name} brings footwear, apparel, electronics and everyday accessories together in one clear storefront. Browse focused categories, compare straightforward prices and open each product page for current availability before you order.
          </p>
          <p className="leading-7 text-(--text-secondary)">
            The store is designed for customers in {STORE_CONFIG.countryName} with a simple path from product discovery to checkout and delivery selection. New products can be added over time without changing the way you browse, search or shop across the core categories.
          </p>
        </div>
      </section>

      {allDiscoveryFailed ? (
        <section aria-labelledby="discovery-error-title" className="rounded-(--radius-xl) border border-(--feedback-danger-border) bg-(--feedback-danger-surface) px-6 py-10 text-center">
          <h2 id="discovery-error-title" className="text-lg font-semibold text-(--feedback-danger-text)">
            We couldn’t load these products.
          </h2>
          <p className="mt-2 text-sm text-(--text-secondary)">Refresh the page to try again.</p>
        </section>
      ) : null}
    </div>
  )
}
