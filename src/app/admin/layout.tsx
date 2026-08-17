import type { Metadata } from 'next'
import type { Route } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { requireRole } from '@/modules/accounts'

import AdminLoading from './loading'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

const NAV = [
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/homepage', label: 'Homepage' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/shopping-readiness', label: 'AI readiness' },
  { href: '/admin/shipping', label: 'Delivery' },
  { href: '/admin/transfers', label: 'Transfers' },
  { href: '/admin/fraud', label: 'Fraud' },
  { href: '/admin/activity', label: 'Activity' },
] as const

/**
 * The authorisation check reads the session, which is per-request data. Under
 * cacheComponents that has to sit inside a Suspense boundary, or it blocks the
 * whole document from streaming — so it lives in this child rather than at the
 * top of the layout. The chrome renders immediately; nothing inside it does
 * until the check passes.
 */
async function Guarded({ children }: { children: React.ReactNode }) {
  /**
   * Declares this subtree per-request before anything else runs. Admin screens
   * are never cacheable — they show live operational data — and without this
   * Next tries to prerender them, then fails when the auth stack reaches for
   * crypto during that prerender.
   */
  await connection()

  // 404s rather than 403s — an unauthorised visitor should not learn that an
  // admin area exists. See docs/04-security.md.
  await requireRole('admin')
  return children
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-(--color-border)">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-6 px-4 py-4 sm:px-6">
          <Link href="/admin/analytics" className="shrink-0 text-sm font-semibold">
            MyCommerce admin
          </Link>
          <nav className="flex gap-4 overflow-x-auto text-sm text-(--color-muted)">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href as Route} className="hover:text-(--color-fg)">
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

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <Suspense fallback={<AdminLoading />}>
          <Guarded>{children}</Guarded>
        </Suspense>
      </main>
    </div>
  )
}
