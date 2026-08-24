import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Email verification must be recoverable.
 *
 * A fresh clone registered its first user, the verification email never
 * arrived, and the account was permanently unusable: sign-in refuses an
 * unverified address, and nothing in the UI could ask for another email. The
 * account existed, the password was right, and there was no way forward.
 */
const state = vi.hoisted(() => ({
  sent: [] as string[],
  failWith: null as Error | null,
  limitOk: true,
  retryAfter: 0,
}))

vi.mock('server-only', () => ({}))

vi.mock('./account-data', () => ({
  AccountError: class extends Error {},
  requestVerificationEmail: vi.fn(async (email: string) => {
    if (state.failWith) throw state.failWith
    state.sent.push(email)
  }),
  verifyPassword: vi.fn(),
  listMySessions: vi.fn(),
  revokeSession: vi.fn(),
  revokeOtherSessions: vi.fn(),
  exportAccountData: vi.fn(),
  deleteAccount: vi.fn(),
}))

vi.mock('./guards', () => ({ requireSession: vi.fn() }))

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(async () => ({ ok: state.limitOk, retryAfter: state.retryAfter })),
  tooManyRequests: (retryAfter: number) => `Too many requests. Try again in ${retryAfter}s.`,
}))

vi.mock('next/cache', () => ({ refresh: vi.fn() }))

const { resendVerificationEmail } = await import('./actions')
const { rateLimit } = await import('@/lib/rate-limit')

beforeEach(() => {
  state.sent = []
  state.failWith = null
  state.limitOk = true
  state.retryAfter = 0
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('requesting another verification email', () => {
  it('sends one for a normal request', async () => {
    const result = await resendVerificationEmail({ email: 'customer@example.com' })

    expect(result.ok).toBe(true)
    expect(state.sent).toEqual(['customer@example.com'])
  })

  it('normalises the address, so casing cannot dodge the rate limit', async () => {
    await resendVerificationEmail({ email: '  Customer@Example.COM  ' })
    expect(state.sent).toEqual(['customer@example.com'])
  })

  it('rejects something that is not an email before doing any work', async () => {
    const result = await resendVerificationEmail({ email: 'not-an-address' })

    expect(result.ok).toBe(false)
    expect(state.sent).toHaveLength(0)
    expect(rateLimit).not.toHaveBeenCalled()
  })
})

describe('it cannot be used to discover who has an account', () => {
  it('answers the same when the address is unknown', async () => {
    // Better Auth throws for an unknown address; the caller must not relay that.
    state.failWith = new Error('User not found')

    const result = await resendVerificationEmail({ email: 'stranger@example.com' })
    expect(result.ok).toBe(true)
  })

  it('answers the same when the account is already verified', async () => {
    state.failWith = new Error('Email already verified')

    const result = await resendVerificationEmail({ email: 'verified@example.com' })
    expect(result.ok).toBe(true)
  })

  it('answers the same when the mail provider refuses', async () => {
    // The exact failure that caused this bug: an unverified sender domain.
    state.failWith = new Error('Resend rejected the message: 403')

    const result = await resendVerificationEmail({ email: 'customer@example.com' })
    expect(result.ok).toBe(true)
  })

  it('returns an identical shape for every outcome', async () => {
    const results = []
    for (const failure of [null, new Error('User not found'), new Error('403')]) {
      state.failWith = failure
      results.push(JSON.stringify(await resendVerificationEmail({ email: 'a@example.com' })))
    }

    expect(new Set(results).size).toBe(1)
  })
})

describe('it is rate limited', () => {
  it('is keyed on the address, so one mailbox cannot be flooded', async () => {
    await resendVerificationEmail({ email: 'customer@example.com' })

    expect(rateLimit).toHaveBeenCalledWith(
      'resend-verification',
      expect.any(Number),
      expect.any(Number),
      'customer@example.com',
    )
  })

  it('refuses once the limit is reached, and sends nothing', async () => {
    state.limitOk = false
    state.retryAfter = 900

    const result = await resendVerificationEmail({ email: 'customer@example.com' })

    expect(result.ok).toBe(false)
    expect(state.sent).toHaveLength(0)
  })
})

describe('it changes nothing about the account', () => {
  it('never marks an address verified itself', async () => {
    const data = await import('./account-data')
    await resendVerificationEmail({ email: 'customer@example.com' })

    // The only thing it may do is ask Better Auth to send mail. Any direct
    // write here would be a verification bypass wearing a helpful hat.
    expect(data.requestVerificationEmail).toHaveBeenCalledTimes(1)
    expect(data.verifyPassword).not.toHaveBeenCalled()
    expect(data.deleteAccount).not.toHaveBeenCalled()
  })

  it('needs no session, and grants none', async () => {
    const guards = await import('./guards')
    const result = await resendVerificationEmail({ email: 'customer@example.com' })

    // Signing in is impossible before verification, so requiring a session here
    // would recreate the dead-end this exists to remove.
    expect(guards.requireSession).not.toHaveBeenCalled()
    expect(result.ok && result.data).toBeNull()
  })
})
