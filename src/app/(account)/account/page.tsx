import type { Metadata } from 'next'
import Link from 'next/link'

import { requireSession } from '@/modules/accounts'
import { SignOutButton } from '@/modules/accounts/components/sign-out-button'

export const metadata: Metadata = { title: 'Your account' }

export default async function AccountPage() {
  // Middleware only checked for a cookie. This is the real authentication.
  const { user } = await requireSession()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/account/orders" className="underline underline-offset-4">
            View your orders →
          </Link>
          <Link href="/account/security" className="underline underline-offset-4">
            Security and your data →
          </Link>
        </div>
      </div>

      <dl className="storefront-card flex flex-col gap-3 p-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-(--color-muted)">Name</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-(--color-muted)">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-(--color-muted)">Verified</dt>
          <dd>{user.emailVerified ? 'Yes' : 'No'}</dd>
        </div>
      </dl>

      <SignOutButton />
    </main>
  )
}
