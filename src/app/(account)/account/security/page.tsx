import type { Metadata } from 'next'
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'

import { listMySessions, requireSession } from '@/modules/accounts'
import { AccountDataControls } from '@/modules/accounts/components/account-data-controls'
import { SessionList, type SessionRow } from '@/modules/accounts/components/session-list'
import { TwoFactorSetup } from '@/modules/accounts/components/two-factor-setup'

export const metadata: Metadata = { title: 'Security', robots: { index: false } }

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-(--color-border) p-5">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {hint ? <p className="text-sm text-(--color-muted)">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

async function SecurityPanels({ searchParams }: { searchParams: Promise<{ required?: string }> }) {
  await connection()

  const [{ user, session }, { required }] = await Promise.all([requireSession(), searchParams])
  const sessions = await listMySessions()

  const rows: SessionRow[] = sessions.map((s) => ({
    token: s.token,
    createdAt: new Date(s.createdAt).toISOString(),
    expiresAt: new Date(s.expiresAt).toISOString(),
    ipAddress: s.ipAddress ?? null,
    userAgent: s.userAgent ?? null,
    current: s.token === session.token,
  }))

  return (
    <>
      <Card title="Two-step verification">
        {/* Better Auth types the plugin field as optional; absent means off. */}
        <TwoFactorSetup enabled={user.twoFactorEnabled === true} required={required === 'admin'} />
      </Card>

      <Card
        title="Where you are signed in"
        hint="Sign out any device you do not recognise. Sessions last 30 days."
      >
        <SessionList sessions={rows} />
      </Card>

      <Card title="Your data">
        <AccountDataControls isAdmin={user.role === 'admin'} />
      </Card>
    </>
  )
}

function Skeleton() {
  return (
    <div className="h-64 animate-pulse rounded-lg border border-(--color-border) bg-(--color-surface)" />
  )
}

export default function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <div className="flex flex-col gap-2">
        <Link href="/account" className="text-sm text-(--color-muted) underline underline-offset-4">
          ← Account
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
      </div>

      <Suspense fallback={<Skeleton />}>
        <SecurityPanels searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
