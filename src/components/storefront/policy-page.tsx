import type { Route } from 'next'
import Link from 'next/link'

import { STORE_CONFIG } from '@/lib/store-config'
import { POLICY_LAST_UPDATED, STORE_TRUST_ROUTES } from '@/lib/store-policies'

type PolicySection = {
  title: string
  body: React.ReactNode
}

export function PolicyPage({
  title,
  summary,
  sections,
}: {
  title: string
  summary: string
  sections: PolicySection[]
}) {
  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <header className="storefront-card flex flex-col gap-4 p-6 sm:p-8">
        <Link
          href="/"
          className="w-fit text-sm font-medium text-(--action-primary) underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        >
          ← Back to store
        </Link>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-wider text-(--text-muted) uppercase">{STORE_CONFIG.name} customer information</p>
          <h1 className="text-3xl font-bold tracking-(--tracking-tight) text-(--text-primary) sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-base leading-7 text-(--text-secondary)">{summary}</p>
          <p className="text-xs text-(--text-muted)">Last updated: {POLICY_LAST_UPDATED}</p>
        </div>
      </header>

      <div className="storefront-card flex flex-col divide-y divide-(--color-border) px-6 sm:px-8">
        {sections.map((section) => (
          <section key={section.title} className="py-7 first:pt-8 last:pb-8">
            <h2 className="text-lg font-semibold text-(--text-primary)">{section.title}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-(--text-secondary)">{section.body}</div>
          </section>
        ))}
      </div>

      <nav aria-label="Customer and legal information" className="storefront-card p-6 sm:p-8">
        <h2 className="text-sm font-semibold text-(--text-primary)">Related information</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STORE_TRUST_ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href as Route}
                className="flex min-h-11 items-center rounded-md px-3 text-sm text-(--text-secondary) underline-offset-4 transition-colors hover:bg-white/25 hover:text-(--text-primary) hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring) dark:hover:bg-white/5"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  )
}
