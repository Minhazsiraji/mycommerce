import Image from 'next/image'
import Link from 'next/link'

import { ThemeToggle } from '@/components/theme-toggle'

import { MobileNavigation } from './mobile-navigation'
import { SearchBar } from './search-bar'

type NavigationItem = {
  id: string
  slug: string
  name: string
}

export function StorefrontHeader({
  categories,
  cart,
  brand,
}: {
  categories: NavigationItem[]
  cart: React.ReactNode
  brand: { name: string; text: string; accent: string; logoUrl?: string | null }
}) {
  return (
    <>
      <a
        href="#main-content"
        className="fixed top-3 left-3 z-(--z-toast) -translate-y-24 rounded-(--radius-md) bg-(--action-primary) px-4 py-3 text-sm font-semibold text-(--action-primary-text) shadow-(--shadow-2) transition-transform focus:translate-y-0 focus:outline-2 focus:outline-offset-2 focus:outline-(--focus-ring)"
      >
        Skip to content
      </a>

      <header>
        <div className="mx-auto w-full max-w-(--container-content) px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center gap-2 md:min-h-18 lg:gap-6">
            <MobileNavigation categories={categories} />

            <Link
              href="/"
              aria-label={`${brand.name} home`}
              className="mr-auto text-xl font-bold tracking-(--tracking-tight) text-(--text-primary) focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring) lg:mr-0"
            >
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={brand.name}
                  width={160}
                  height={40}
                  priority
                  className="h-8 w-auto"
                />
              ) : (
                <>
                  {brand.text}
                  {brand.accent ? (
                    <span className="text-(--action-primary)">{brand.accent}</span>
                  ) : null}
                </>
              )}
            </Link>

            {categories.length > 0 ? (
              <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center gap-1 lg:flex">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    key={category.id}
                    href={`/c/${category.slug}`}
                    className="inline-flex min-h-11 items-center rounded-(--radius-md) px-3 text-sm font-medium whitespace-nowrap text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            ) : null}

            <SearchBar id="site-search" className="hidden w-56 shrink-0 md:block xl:w-64" />

            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                href="/account"
                aria-label="Account"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-(--radius-md) text-(--text-secondary) transition-colors hover:bg-(--surface-secondary) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
              >
                <AccountIcon />
              </Link>

              {cart}

              <ThemeToggle />
            </div>
          </div>

          <SearchBar id="site-search-mobile" className="pb-4 md:hidden" label={`Search ${brand.name} products`} />

          {categories.length > 0 ? (
            <nav aria-label="Browse categories" className="-mx-4 overflow-x-auto px-4 pb-3 md:hidden">
              <ul className="flex w-max min-w-full items-center gap-2">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/c/${category.slug}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-(--border-subtle) bg-(--surface-secondary) px-4 text-sm font-medium whitespace-nowrap text-(--text-secondary) transition-colors hover:border-(--border-strong) hover:text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </header>
    </>
  )
}

function AccountIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  )
}
