import type { Metadata } from 'next'
import Link from 'next/link'

import { ResetPasswordForm } from '@/modules/accounts/components/password-forms'

export const metadata: Metadata = { title: 'Choose a new password' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-semibold">This link is not valid</h1>
        <p className="text-sm leading-relaxed text-(--color-muted)">
          The reset link is missing its token. Request a new one.
        </p>
        <Link href="/forgot-password" className="text-sm underline underline-offset-4">
          Request a new link
        </Link>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}
