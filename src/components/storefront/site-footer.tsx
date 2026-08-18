import type { Route } from 'next'
import Link from 'next/link'

import { env } from '@/lib/env'
import { routesFor } from '@/lib/store-policies'

type NavigationItem = {
  id: string
  slug: string
  name: string
}

export function SiteFooter({
  categories,
  footer,
  privacyChoices,
}: {
  categories: NavigationItem[]
  footer: {
    brandText: string
    brandAccent: string
    description: string
    copyright: string
  }
  privacyChoices?: React.ReactNode
}) {
  const email = env.STORE_CONTACT_EMAIL
  const phone = env.STORE_CONTACT_PHONE
  const customerCare = routesFor('customer-care')
  const company = routesFor('company')
  const legal = routesFor('legal')

  return (
    <footer className="mt-16 px-4 pb-4 sm:px-6 md:mt-20 lg:px-8 lg:pb-8">
      <div className="mx-auto w-full max-w-(--container-wide) overflow-hidden rounded-(--radius-xl) border border-white/70 bg-(image:--gradient-brand-soft) shadow-(--shadow-1) backdrop-blur-[12px] dark:border-white/20">
        <div className="mx-auto grid w-full max-w-(--container-content) grid-cols-1 gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-5 lg:px-10 lg:py-14">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="w-fit text-xl font-bold tracking-(--tracking-tight) focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)">
              {footer.brandText}
              {footer.brandAccent ? (
                <span className="text-(--action-primary)">{footer.brandAccent}</span>
              ) : null}
            </Link>
            <p className="max-w-xs text-sm leading-6 text-(--text-secondary)">
              {footer.description}
            </p>
            <div className="flex flex-col text-sm text-(--text-secondary)">
              {email ? <FooterInlineLink href={`mailto:${email}`}>{email}</FooterInlineLink> : null}
              {phone ? <FooterInlineLink href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</FooterInlineLink> : null}
            </div>
          </div>

          {categories.length > 0 ? (
            <FooterColumn title="Shop" label="Footer shop links">
              {categories.slice(0, 6).map((category) => (
                <FooterLink key={category.id} href={`/c/${category.slug}`}>
                  {category.name}
                </FooterLink>
              ))}
              <FooterLink href="/search">Search products</FooterLink>
            </FooterColumn>
          ) : (
            <FooterColumn title="Shop" label="Footer shop links">
              <FooterLink href="/search">Search products</FooterLink>
            </FooterColumn>
          )}

          <FooterColumn title="Customer care" label="Footer customer care links">
            <FooterLink href="/orders/lookup">Track your order</FooterLink>
            {customerCare.map((route) => (
              <FooterLink key={route.href} href={route.href}>
                {route.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Account" label="Footer account links">
            <FooterLink href="/account">Your account</FooterLink>
            <FooterLink href="/account/orders">Order history</FooterLink>
            <FooterLink href="/account/security">Security</FooterLink>
            <FooterLink href="/cart">Your cart</FooterLink>
          </FooterColumn>

          <FooterColumn title="Company & legal" label="Footer company and legal links">
            {company.map((route) => (
              <FooterLink key={route.href} href={route.href}>
                {route.label}
              </FooterLink>
            ))}
            {legal.map((route) => (
              <FooterLink key={route.href} href={route.href}>
                {route.label}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <div className="border-t border-white/60 dark:border-white/15">
          <div className="mx-auto flex min-h-16 w-full max-w-(--container-content) flex-wrap items-center justify-between gap-4 px-5 py-3 text-xs text-(--text-muted) sm:px-8 lg:px-10">
            <span>{footer.copyright}</span>
            <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
              <Link href="/privacy" className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
                Privacy
              </Link>
              <Link href="/terms" className="underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)">
                Terms
              </Link>
              {privacyChoices}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  label,
  children,
}: {
  title: string
  label: string
  children: React.ReactNode
}) {
  return (
    <nav aria-label={label} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-wider text-(--text-primary) uppercase">{title}</h2>
      <ul className="flex flex-col">{children}</ul>
    </nav>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href as Route}
        className="flex min-h-11 w-fit items-center text-sm text-(--text-secondary) underline-offset-4 transition-colors hover:text-(--text-primary) hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
      >
        {children}
      </Link>
    </li>
  )
}

function FooterInlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="min-h-9 w-fit content-center underline-offset-4 hover:text-(--text-primary) hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
    >
      {children}
    </a>
  )
}
