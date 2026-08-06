import type { Route } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { env } from '@/lib/env'
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

/**
 * The footer.
 *
 * Every link here goes somewhere that exists. That constraint is the whole
 * design: the usual e-commerce footer is a wall of About / Careers / Returns /
 * Privacy, and shipping one of those against pages that 404 is worse than
 * having no footer at all — it reads as a store that was abandoned halfway.
 *
 * "Track your order" is the highest-value link on the page and the one most
 * stores bury. A guest with no account and a lost confirmation email has
 * exactly one route back in, and this is it.
 *
 * Contact details appear only when configured, same rule as the trust bar.
 */
function SiteFooter({ categories }: { categories: { id: string; slug: string; name: string }[] }) {
  const email = env.STORE_CONTACT_EMAIL
  const phone = env.STORE_CONTACT_PHONE

  return (
    <footer className="mt-16 border-t border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Link href="/" className="text-base font-semibold tracking-tight">
            MyCommerce
          </Link>
          <p className="max-w-xs text-sm text-(--color-muted)">
            Everyday essentials, delivered across Bangladesh.
          </p>
        </div>

        <FooterColumn title="Shop">
          {categories.map((category) => (
            <FooterLink key={category.id} href={`/c/${category.slug}`}>
              {category.name}
            </FooterLink>
          ))}
          <FooterLink href="/search">Search</FooterLink>
        </FooterColumn>

        <FooterColumn title="Orders">
          <FooterLink href="/orders/lookup">Track your order</FooterLink>
          <FooterLink href="/account/orders">Order history</FooterLink>
          <FooterLink href="/cart">Your cart</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account">
          <FooterLink href="/account">Your account</FooterLink>
          <FooterLink href="/account/security">Security</FooterLink>
          {email ? <FooterLink href={`mailto:${email}`}>{email}</FooterLink> : null}
          {phone ? <FooterLink href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</FooterLink> : null}
        </FooterColumn>
      </div>

      {/*
        No year. Reading the clock in a prerendered component bakes whatever
        year the build ran into a cached page, so it would go quietly wrong
        rather than stay current. A copyright line does not need one.
      */}
      <div className="border-t border-(--color-border)">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-(--color-muted) sm:flex-row sm:items-center sm:justify-between">
          <span>© MyCommerce</span>
          <span>Secure checkout · bKash · Nagad · Rocket · Card · Bank transfer</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wide uppercase">{title}</h2>
      <ul className="flex flex-col gap-2 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href as Route}
        className="text-(--color-muted) transition-colors hover:text-(--color-fg)"
      >
        {children}
      </Link>
    </li>
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

      <SiteFooter categories={tops} />
    </div>
  )
}
