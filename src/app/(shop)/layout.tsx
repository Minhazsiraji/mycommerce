import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { formatBdt } from '@/lib/money'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import { deliveryEstimate, lowestFreeThreshold } from '@/modules/shipping'

/**
 * What a first-time visitor needs to know before they trust the store with a
 * card number: where we deliver, how long it takes, and what we accept.
 *
 * Every figure is read from the delivery rates the owner actually configured.
 * Both helpers return null when nothing is set, and the corresponding line is
 * then omitted rather than guessed — an invented "free over ৳2000" is worse
 * than silence, because a customer who reaches checkout and finds otherwise
 * has been lied to.
 */
async function TrustBar() {
  /**
   * Declares this subtree per-request before it reads anything.
   *
   * These are the layout's only database calls, and without this Next pulls
   * them into the static shell of every storefront page — where the Neon
   * driver's WebSocket handshake asks for random bytes before any request data
   * exists, and the build fails. It surfaces as an error on whichever page is
   * reported first, which is misleading: the cause is here, in the layout.
   */
  await connection()

  const [freeOver, estimate] = await Promise.all([lowestFreeThreshold(), deliveryEstimate()])

  const facts = [
    estimate
      ? `Delivery across Bangladesh in ${estimate.min === estimate.max ? `${estimate.min}` : `${estimate.min}–${estimate.max}`} working days`
      : null,
    freeOver ? `Free delivery over ${formatBdt(freeOver)}` : null,
    'bKash · Nagad · Rocket · Card · Bank transfer',
  ].filter(Boolean)

  if (facts.length === 0) return null

  return (
    <div className="border-b border-(--color-border) bg-(--color-surface)">
      <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-6 py-2 text-xs text-(--color-muted)">
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </div>
  )
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCachedCategories()
  const tops = categories.filter((c) => !c.parentId)

  const search = (id: string, className: string) => (
    <form action="/search" className={className}>
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search…"
        className="h-9 w-full rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-accent)"
      />
    </form>
  )

  return (
    <div className="flex min-h-dvh flex-col">
      {/*
        Three deliberate rows on small screens — brand and actions, then search,
        then categories — instead of one flex-wrap row breaking wherever the
        browser happens to run out of width. On md and up it collapses to the
        single row it always looked like it wanted to be.
      */}
      <header className="border-b border-(--color-border)">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex items-center gap-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight whitespace-nowrap">
              MyCommerce
            </Link>

            <nav className="hidden gap-5 text-sm text-(--color-muted) md:flex">
              {tops.map((category) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  className="hover:text-(--color-fg)"
                >
                  {category.name}
                </Link>
              ))}
            </nav>

            {search('site-search', 'ml-auto hidden w-56 md:block')}

            <div className="ml-auto flex items-center gap-4 md:ml-0">
              <Link
                href="/account"
                className="text-sm text-(--color-muted) hover:text-(--color-fg)"
              >
                Account
              </Link>

              {/* Per-visitor, so it streams in rather than being baked into this
                  cached layout. */}
              <Suspense fallback={<CartBadgeFallback />}>
                <CartBadge />
              </Suspense>

              <ThemeToggle />
            </div>
          </div>

          {search('site-search-mobile', 'pb-3 md:hidden')}
        </div>

        {/* Categories scroll sideways on a phone rather than wrapping into a
            block that pushes the products off the screen. */}
        <nav className="mx-auto flex w-full max-w-6xl gap-5 overflow-x-auto px-6 pb-3 text-sm text-(--color-muted) md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tops.map((category) => (
            <Link
              key={category.id}
              href={`/c/${category.slug}`}
              className="whitespace-nowrap hover:text-(--color-fg)"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Reads delivery rates, so it streams rather than blocking the header. */}
      <Suspense fallback={null}>
        <TrustBar />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-(--color-border)">
        {/*
          No year here on purpose. Reading the clock in a prerendered component
          bakes whatever year the build ran into a cached page, so it would go
          quietly wrong rather than stay current. A copyright line does not need
          one, and it is not worth making the whole layout render per request.
        */}
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-(--color-muted)">
          © MyCommerce
        </div>
      </footer>
    </div>
  )
}
