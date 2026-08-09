import { HomepageHero } from '@/components/storefront/homepage-hero'
import { SectionHeader } from '@/components/storefront/section-header'
import { getCachedActiveProducts, getCachedCategories } from '@/modules/catalog'
import { CategoryCard } from '@/modules/catalog/components/category-card'
import { ProductGrid } from '@/modules/catalog/components/product-card'

export default async function HomePage() {
  const [categoryResult, productResult] = await Promise.allSettled([
    getCachedCategories(),
    getCachedActiveProducts({ sort: 'newest', page: 1 }, { limit: 4 }),
  ])

  if (categoryResult.status === 'rejected') {
    console.error('Unable to load homepage categories', categoryResult.reason)
  }

  if (productResult.status === 'rejected') {
    console.error('Unable to load homepage new arrivals', productResult.reason)
  }

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
      <HomepageHero hasCategories={categories.length > 0} />

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
