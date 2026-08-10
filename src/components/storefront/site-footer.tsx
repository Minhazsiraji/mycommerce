import type { Route } from 'next'
import Link from 'next/link'

import { env } from '@/lib/env'

type NavigationItem = {
  id: string
  slug: string
  name: string
}

export function SiteFooter({ categories }: { categories: NavigationItem[] }) {
  const email = env.STORE_CONTACT_EMAIL
  const phone = env.STORE_CONTACT_PHONE

  return (
    <footer className="mt-16 border-t border-(--border-subtle) bg-(--surface-primary) md:mt-20">
      <div className="mx-auto grid w-full max-w-(--container-content) grid-cols-1 gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <Link href="/" className="w-fit text-xl font-bold tracking-(--tracking-tight) focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--focus-ring)">
            Siraji<span className="text-(--action-primary)">BD</span>
          </Link>
          <p className="max-w-xs text-sm leading-6 text-(--text-secondary)">
            Clear choices. Honest information. A shopping journey you can understand.
          </p>
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

        <FooterColumn title="Orders" label="Footer order links">
          <FooterLink href="/orders/lookup">Track your order</FooterLink>
          <FooterLink href="/account/orders">Order history</FooterLink>
          <FooterLink href="/cart">Your cart</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account" label="Footer account links">
          <FooterLink href="/account">Your account</FooterLink>
          <FooterLink href="/account/security">Security</FooterLink>
          {email ? <FooterLink href={`mailto:${email}`}>{email}</FooterLink> : null}
          {phone ? <FooterLink href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</FooterLink> : null}
        </FooterColumn>
      </div>

      <div className="border-t border-(--border-subtle)">
        <div className="mx-auto flex min-h-16 w-full max-w-(--container-content) items-center px-4 text-xs text-(--text-muted) sm:px-6 lg:px-8">
          <span>© SirajiBD</span>
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
