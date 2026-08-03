import Link from 'next/link'

import { getSession } from '@/modules/accounts'

export default async function HomePage() {
  const session = await getSession()

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">MyCommerce</h1>
        <p className="text-(--color-muted)">
          Foundation is in place. The catalog arrives in Phase 1.
        </p>
      </div>

      <div className="flex gap-3 text-sm">
        {session ? (
          <Link href="/account" className="underline underline-offset-4">
            Your account
          </Link>
        ) : (
          <>
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
            <Link href="/register" className="underline underline-offset-4">
              Create an account
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
