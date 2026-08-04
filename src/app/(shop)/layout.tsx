import Link from 'next/link'

import { listCategories } from '@/modules/catalog'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const categories = await listCategories()
  const tops = categories.filter((c) => !c.parentId)

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-(--color-border)">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            MyCommerce
          </Link>

          <nav className="flex flex-wrap gap-4 text-sm text-(--color-muted)">
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

          <form action="/search" className="ml-auto flex items-center gap-2">
            <label htmlFor="site-search" className="sr-only">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search…"
              className="h-9 w-40 rounded-md border border-(--color-border) bg-(--color-bg) px-3 text-sm sm:w-56"
            />
          </form>

          <Link href="/account" className="text-sm text-(--color-muted) hover:text-(--color-fg)">
            Account
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-(--color-border)">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-(--color-muted)">
          © {new Date().getFullYear()} MyCommerce
        </div>
      </footer>
    </div>
  )
}
