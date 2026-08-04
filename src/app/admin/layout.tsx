import type { Metadata } from 'next'
import Link from 'next/link'

import { requireRole } from '@/modules/accounts'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

const NAV = [
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
] as const

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // 404s rather than 403s — an unauthorised visitor should not learn that an
  // admin area exists. See docs/04-security.md.
  await requireRole('admin')

  return (
    <div className="min-h-dvh">
      <header className="border-b border-(--color-border)">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/admin/products" className="text-sm font-semibold">
            MyCommerce admin
          </Link>
          <nav className="flex gap-4 text-sm text-(--color-muted)">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-(--color-fg)">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="ml-auto text-sm text-(--color-muted) underline underline-offset-4 hover:text-(--color-fg)"
          >
            View store
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
