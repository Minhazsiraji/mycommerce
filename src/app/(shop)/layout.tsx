import Link from 'next/link'
import { Suspense } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { formatBdt } from '@/lib/money'
import { CartBadge, CartBadgeFallback } from '@/modules/cart/components/cart-badge'
import { getCachedCategories } from '@/modules/catalog'
import { getCachedDeliverySummary } from '@/modules/shipping'

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
   * A cached read, deliberately.
   *
   * Reading the rates uncached here makes every storefront page blocking, since
   * the layout is prerendered — and putting it behind `connection()` instead
   * only trades that for the same problem wearing a different hat. Caching is
   * the honest answer: rates change a few times a year, and the shipping
   * actions clear the tag when they do.
   */
  const { freeOver, estimate } = await getCachedDeliverySummary()

  const days =
    estimate && (estimate.min === estimate.max ? `${estimate.min}` : `${estimate.min}–${estimate.max}`)

  const facts = [
    days ? { icon: <TruckIcon />, label: `Delivery in ${days} days`, detail: 'across Bangladesh' } : null,
    freeOver ? { icon: <TagIcon />, label: `Free over ${formatBdt(freeOver)}`, detail: 'delivery' } : null,
    { icon: <CardIcon />, label: 'bKash · Nagad · Rocket · Card', detail: '· Bank transfer' },
  ].filter((f) => f !== null)

  if (facts.length === 0) return null

  return (
    <div className="border-b border-(--color-border) bg-(--color-surface)">
      {/*
        Icons and dividers rather than three lines of grey text. Stacked as a
        paragraph these read as boilerplate nobody scans; as separate chips each
        one registers on its own. The longer half of each fact is hidden on a
        phone, so the band stays a single line instead of eating three rows
        above the fold.
      */}
      <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-1.5 px-6 py-2.5 text-xs text-(--color-muted) sm:gap-x-6">
        {facts.map((fact, i) => (
          <li key={fact.label} className="flex items-center gap-1.5 whitespace-nowrap">
            {i > 0 ? (
              <span aria-hidden className="mr-2 hidden h-3 w-px bg-(--color-border) sm:block" />
            ) : null}
            <span className="text-(--color-fg)/60">{fact.icon}</span>
            <span>
              {fact.label} <span className="hidden sm:inline">{fact.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Inline SVG rather than an icon package — three glyphs is not a dependency,
   and inline markup needs no CSP allowance for an external image host. */

function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12.6 2.7a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.5 8.5a2 2 0 0 0 2.8 0l6.8-6.8a2 2 0 0 0 0-2.8Z" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
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

            {/*
              Plain links, no active-state highlight. Deriving one needs
              `usePathname`, and a client hook reading the route inside this
              cached layout breaks prerendering for every storefront page. The
              page's own <h1> already says where you are; that is not worth
              trading static rendering for.
            */}
            <nav className="hidden gap-5 text-sm text-(--color-muted) md:flex">
              {tops.map((category) => (
                <Link
                  key={category.id}
                  href={`/c/${category.slug}`}
                  className="transition-colors hover:text-(--color-fg)"
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
              className="whitespace-nowrap transition-colors hover:text-(--color-fg)"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </header>

      {/* Cached, so it prerenders with the rest of the shell — no boundary. */}
      <TrustBar />

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
